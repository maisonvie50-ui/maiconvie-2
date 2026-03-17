// ============================================================
// GOOGLE APPS SCRIPT — Đồng bộ đơn đặt bàn từ Google Sheet → Supabase
// ============================================================
// 
// HƯỚNG DẪN SỬ DỤNG:
// 1. Mở Google Sheet chứa dữ liệu booking
// 2. Vào Extensions > Apps Script
// 3. Dán toàn bộ code này vào
// 4. Cấu hình SUPABASE_URL và SUPABASE_ANON_KEY ở phần CONFIG
// 5. Cấu hình đúng tên cột trong phần COLUMN_MAPPING
// 6. Chạy hàm syncBookingsToSupabase() thủ công lần đầu
// 7. Đặt Trigger tự động (mỗi 5-15 phút) nếu muốn tự đồng bộ
//
// CẤU TRÚC GOOGLE SHEET CẦN CÓ CÁC CỘT (tên cột có thể tùy chỉnh):
// | Tên khách | SĐT | Email | Ngày đặt | Giờ đặt | Số khách | Ghi chú | Nguồn | Khu vực | Trạng thái đồng bộ |
// ============================================================

// ===================== CONFIG =====================
const CONFIG = {
  // === SUPABASE ===
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',  // ← Thay bằng URL Supabase của bạn
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY_HERE',               // ← Thay bằng Anon Key của bạn

  // === GOOGLE SHEET ===
  SHEET_NAME: 'Sheet1',           // Tên sheet chứa dữ liệu (mặc định "Sheet1")
  HEADER_ROW: 1,                  // Dòng chứa tên cột
  DATA_START_ROW: 2,              // Dòng bắt đầu dữ liệu

  // === SYNC SETTINGS ===
  SYNC_STATUS_COL: 'Trạng thái đồng bộ',  // Cột đánh dấu đã sync
  DEFAULT_SOURCE: 'email',                  // Nguồn mặc định (email, website, phone, facebook, whatsapp, walk_in, zalo)
  DEFAULT_STATUS: 'new',                    // Trạng thái mặc định khi tạo đơn mới
};

// ===================== CỘT MAPPING =====================
// Ánh xạ tên cột trong Google Sheet → trường trong Supabase
// Chỉnh sửa bên trái (key) cho khớp với tên cột trong Google Sheet
const COLUMN_MAPPING = {
  'Tên khách':    'customer_name',
  'SĐT':         'phone',
  'Email':        'email',
  'Ngày đặt':    'booking_date',    // Định dạng: YYYY-MM-DD hoặc DD/MM/YYYY
  'Giờ đặt':     'time',            // Định dạng: HH:mm (VD: 19:00)
  'Số khách':     'pax',
  'Ghi chú':      'notes',
  'Nguồn':        'source',          // email, website, phone, facebook, whatsapp, walk_in, zalo
  'Khu vực':      'area',            // indoor, outdoor, vip, rooftop
};

// ===================== HÀM CHÍNH =====================

/**
 * Hàm chính: Đồng bộ tất cả đơn chưa sync từ Google Sheet → Supabase
 */
function syncBookingsToSupabase() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    Logger.log('❌ Không tìm thấy sheet: ' + CONFIG.SHEET_NAME);
    return;
  }

  const headers = sheet.getRange(CONFIG.HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow < CONFIG.DATA_START_ROW) {
    Logger.log('ℹ️ Không có dữ liệu để đồng bộ');
    return;
  }

  const dataRange = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - CONFIG.DATA_START_ROW + 1, sheet.getLastColumn());
  const rows = dataRange.getValues();

  // Tìm vị trí cột "Trạng thái đồng bộ"
  const syncColIndex = headers.indexOf(CONFIG.SYNC_STATUS_COL);
  
  // Nếu chưa có cột sync status, tạo mới
  if (syncColIndex === -1) {
    const newCol = sheet.getLastColumn() + 1;
    sheet.getRange(CONFIG.HEADER_ROW, newCol).setValue(CONFIG.SYNC_STATUS_COL);
    Logger.log('✅ Đã tạo cột "' + CONFIG.SYNC_STATUS_COL + '" ở cột ' + newCol);
    // Re-run sau khi tạo cột
    syncBookingsToSupabase();
    return;
  }

  let syncCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = CONFIG.DATA_START_ROW + i;
    const syncStatus = row[syncColIndex];

    // Bỏ qua các dòng đã sync hoặc trống
    if (syncStatus === '✅ Đã sync' || syncStatus === '⏳ Đang xử lý') {
      skipCount++;
      continue;
    }

    // Kiểm tra dòng có dữ liệu không (ít nhất phải có tên khách)
    const customerNameColIndex = headers.indexOf(Object.keys(COLUMN_MAPPING).find(k => COLUMN_MAPPING[k] === 'customer_name'));
    if (!row[customerNameColIndex] || String(row[customerNameColIndex]).trim() === '') {
      skipCount++;
      continue;
    }

    // Đánh dấu đang xử lý
    sheet.getRange(rowNumber, syncColIndex + 1).setValue('⏳ Đang xử lý');

    try {
      // Xây dựng object booking từ row
      const booking = buildBookingFromRow(headers, row);

      // Kiểm tra trùng lặp trước khi insert
      const isDuplicate = checkDuplicate(booking);
      if (isDuplicate) {
        sheet.getRange(rowNumber, syncColIndex + 1).setValue('⚠️ Trùng lặp');
        Logger.log('⚠️ Dòng ' + rowNumber + ': Trùng lặp - ' + booking.customer_name + ' ' + booking.booking_date + ' ' + booking.time);
        skipCount++;
        continue;
      }

      // Insert vào Supabase
      const result = insertBookingToSupabase(booking);
      
      if (result.success) {
        sheet.getRange(rowNumber, syncColIndex + 1).setValue('✅ Đã sync');
        syncCount++;
        Logger.log('✅ Dòng ' + rowNumber + ': Đã sync - ' + booking.customer_name);
      } else {
        sheet.getRange(rowNumber, syncColIndex + 1).setValue('❌ Lỗi: ' + result.error);
        errorCount++;
        Logger.log('❌ Dòng ' + rowNumber + ': Lỗi - ' + result.error);
      }

    } catch (e) {
      sheet.getRange(rowNumber, syncColIndex + 1).setValue('❌ Lỗi: ' + e.message);
      errorCount++;
      Logger.log('❌ Dòng ' + rowNumber + ': Exception - ' + e.message);
    }

    // Tránh rate limit
    Utilities.sleep(200);
  }

  Logger.log('============================');
  Logger.log('📊 KẾT QUẢ ĐỒNG BỘ:');
  Logger.log('  ✅ Đã sync: ' + syncCount + ' đơn');
  Logger.log('  ⏭️ Bỏ qua: ' + skipCount + ' đơn');
  Logger.log('  ❌ Lỗi: ' + errorCount + ' đơn');
  Logger.log('============================');
}

// ===================== HÀM PHỤ TRỢ =====================

/**
 * Xây dựng object booking từ 1 row dữ liệu
 */
function buildBookingFromRow(headers, row) {
  const booking = {
    customer_name: '',
    phone: '',
    email: '',
    booking_date: '',
    time: '',
    pax: 2,
    notes: [],
    source: CONFIG.DEFAULT_SOURCE,
    area: '',
    status: CONFIG.DEFAULT_STATUS,
    customer_type: 'retail',
    selected_menus: [],
  };

  for (const [sheetCol, dbField] of Object.entries(COLUMN_MAPPING)) {
    const colIndex = headers.indexOf(sheetCol);
    if (colIndex === -1) continue;

    let value = row[colIndex];
    if (value === undefined || value === null || String(value).trim() === '') continue;

    switch (dbField) {
      case 'booking_date':
        booking.booking_date = formatDate(value);
        break;
      case 'time':
        booking.time = formatTime(value);
        break;
      case 'pax':
        booking.pax = parseInt(value) || 2;
        break;
      case 'notes':
        // Ghi chú lưu dưới dạng mảng
        booking.notes = [String(value).trim()];
        break;
      case 'source':
        booking.source = mapSource(String(value).trim());
        break;
      case 'area':
        booking.area = mapArea(String(value).trim());
        break;
      default:
        booking[dbField] = String(value).trim();
    }
  }

  return booking;
}

/**
 * Chuẩn hóa ngày thành YYYY-MM-DD
 */
function formatDate(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  
  const str = String(value).trim();
  
  // Xử lý DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    return ddmmyyyy[3] + '-' + month + '-' + day;
  }

  // Đã là YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Thử parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return str;
}

/**
 * Chuẩn hóa giờ thành HH:mm
 */
function formatTime(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'HH:mm');
  }

  const str = String(value).trim();
  
  // Đã đúng format HH:mm
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const parts = str.split(':');
    return parts[0].padStart(2, '0') + ':' + parts[1];
  }

  // HH:mm:ss
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
    const parts = str.split(':');
    return parts[0].padStart(2, '0') + ':' + parts[1];
  }

  return str;
}

/**
 * Map nguồn đặt từ tiếng Việt sang code
 */
function mapSource(value) {
  const lower = value.toLowerCase();
  const map = {
    'email': 'email',
    'website': 'website',
    'web': 'website',
    'điện thoại': 'phone',
    'phone': 'phone',
    'gọi điện': 'phone',
    'facebook': 'facebook',
    'fb': 'facebook',
    'whatsapp': 'whatsapp',
    'wa': 'whatsapp',
    'walk-in': 'walk_in',
    'walk in': 'walk_in',
    'khách vng': 'walk_in',
    'zalo': 'zalo',
    'instagram': 'instagram',
    'ig': 'instagram',
  };
  return map[lower] || CONFIG.DEFAULT_SOURCE;
}

/**
 * Map khu vực từ tiếng Việt sang code
 */
function mapArea(value) {
  const lower = value.toLowerCase();
  const map = {
    'trong nhà': 'indoor',
    'indoor': 'indoor',
    'ngoài trời': 'outdoor',
    'outdoor': 'outdoor',
    'sân vườn': 'outdoor',
    'vip': 'vip',
    'phòng vip': 'vip',
    'sân thượng': 'rooftop',
    'rooftop': 'rooftop',
  };
  return map[lower] || '';
}

/**
 * Kiểm tra trùng lặp: cùng SĐT + cùng ngày + cùng giờ
 */
function checkDuplicate(booking) {
  if (!booking.phone || !booking.booking_date) return false;

  const url = CONFIG.SUPABASE_URL + '/rest/v1/bookings'
    + '?phone=eq.' + encodeURIComponent(booking.phone)
    + '&booking_date=eq.' + encodeURIComponent(booking.booking_date)
    + '&time=eq.' + encodeURIComponent(booking.time)
    + '&select=id'
    + '&limit=1';

  const response = UrlFetchApp.fetch(url, {
    method: 'GET',
    headers: {
      'apikey': CONFIG.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  });

  const data = JSON.parse(response.getContentText());
  return Array.isArray(data) && data.length > 0;
}

/**
 * Insert booking vào Supabase qua REST API
 */
function insertBookingToSupabase(booking) {
  const url = CONFIG.SUPABASE_URL + '/rest/v1/bookings';

  const payload = {
    customer_name: booking.customer_name,
    phone: booking.phone || null,
    email: booking.email || null,
    booking_date: booking.booking_date,
    time: booking.time,
    pax: booking.pax,
    status: booking.status,
    notes: booking.notes,
    source: booking.source,
    area: booking.area || null,
    customer_type: booking.customer_type,
    selected_menus: booking.selected_menus,
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'POST',
    headers: {
      'apikey': CONFIG.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  const body = response.getContentText();

  if (code === 201 || code === 200) {
    return { success: true, data: JSON.parse(body) };
  } else {
    return { success: false, error: 'HTTP ' + code + ': ' + body.substring(0, 100) };
  }
}

// ===================== TRIGGER & TIỆN ÍCH =====================

/**
 * Tạo menu tùy chỉnh trong Google Sheet
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔄 Supabase Sync')
    .addItem('Đồng bộ ngay', 'syncBookingsToSupabase')
    .addItem('Đặt lịch tự động (mỗi 10 phút)', 'setupAutoSync')
    .addItem('Xóa lịch tự động', 'removeAutoSync')
    .addItem('Reset trạng thái sync', 'resetSyncStatus')
    .addToUi();
}

/**
 * Đặt trigger tự động chạy mỗi 10 phút
 */
function setupAutoSync() {
  // Xóa trigger cũ trước
  removeAutoSync();
  
  ScriptApp.newTrigger('syncBookingsToSupabase')
    .timeBased()
    .everyMinutes(10)
    .create();
  
  SpreadsheetApp.getUi().alert('✅ Đã đặt tự động đồng bộ mỗi 10 phút!');
}

/**
 * Xóa tất cả trigger tự động
 */
function removeAutoSync() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'syncBookingsToSupabase') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

/**
 * Reset tất cả trạng thái sync (cho phép sync lại)
 */
function resetSyncStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const headers = sheet.getRange(CONFIG.HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  const syncColIndex = headers.indexOf(CONFIG.SYNC_STATUS_COL);
  
  if (syncColIndex === -1) {
    SpreadsheetApp.getUi().alert('Không tìm thấy cột "' + CONFIG.SYNC_STATUS_COL + '"');
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow >= CONFIG.DATA_START_ROW) {
    sheet.getRange(CONFIG.DATA_START_ROW, syncColIndex + 1, lastRow - CONFIG.DATA_START_ROW + 1, 1).clearContent();
  }
  
  SpreadsheetApp.getUi().alert('✅ Đã reset trạng thái sync cho tất cả các dòng!');
}
