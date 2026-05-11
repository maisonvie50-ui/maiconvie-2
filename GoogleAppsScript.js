const SUPABASE_URL = "https://pzqlqnmxalutgodjsmig.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qrp4vSqhfHRd6GaKN9C4BA_ryrCFA8d";
const DB_SYNC_COL = 16; // Cột P: trạng thái đồng bộ database

function onEdit(e) {
    var sheet = e.source.getActiveSheet();
    if (sheet.getName() !== "Bookings") return;

    var row = e.range.getRow();
    if (row <= 1) return;

    var customerName = sheet.getRange(row, 5).getValue();
    if (!customerName) return;

    syncRowToSupabase(sheet, row);
}

// RUN THIS FUNCTION to test syncing the last row
function testSyncLastRow() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bookings") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    syncRowToSupabase(sheet, lastRow);
}

function syncRowToSupabase(sheet, rowIndex) {
    var rowData = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];

    if (!rowData[4]) {
        Logger.log("Row " + rowIndex + " has no customer name. Skipping.");
        return false;
    }

    var dateTimeStr = rowData[8] ? rowData[8].toString() : "";
    var bookingCode = cleanSheetText_(rowData[5] || "");
    var statusText = String(rowData[1] || "");

    var notesArr = [];
    if (rowData[2]) notesArr.push("Đối tác: " + rowData[2]);
    if (rowData[9] && rowData[9].toString().toLowerCase() !== "n/a") notesArr.push("Thực đơn/Menu: " + rowData[9]);
    if (rowData[10] && rowData[10].toString().trim().toLowerCase() !== "không") notesArr.push("Dị ứng/Yêu cầu: " + rowData[10]);
    if (rowData[11]) notesArr.push("Giá tiền: " + cleanSheetText_(rowData[11]));
    if (rowData[12] && rowData[12].toString().toLowerCase() !== "n/a") notesArr.push("Thanh toán: " + rowData[12]);
    if (rowData[13]) notesArr.push("Ghi chú: " + rowData[13]);
    if (statusText.includes("hủy")) notesArr.push("ĐÃ HỦY từ Google Sheets");

    var payload = {
        customer_name: rowData[4],
        phone: rowData[6] ? cleanSheetText_(rowData[6]) : null,
        email: rowData[3] ? rowData[3].toString() : null,
        pax: parseInt(rowData[7], 10) || 2,
        booking_date: parseSupabaseDate_(dateTimeStr),
        time: parseSupabaseTime_(dateTimeStr),
        status: statusText.includes("hủy") ? "cancelled" : "new",
        source: "email",
        customer_type: bookingCode ? "tour" : "retail",
        booking_code: bookingCode || null,
        notes: notesArr,
        lang: "vi",
        updated_at: new Date().toISOString()
    };

    Logger.log("Sending Supabase payload: " + JSON.stringify(payload));

    try {
        var existingId = null;
        if (payload.booking_code) {
            var lookupResponse = UrlFetchApp.fetch(
                SUPABASE_URL + "/rest/v1/bookings?select=id&booking_code=eq." + encodeURIComponent(payload.booking_code) + "&limit=1",
                { method: "get", headers: buildSupabaseHeaders_(), muteHttpExceptions: true }
            );
            if (lookupResponse.getResponseCode() === 200) {
                var found = JSON.parse(lookupResponse.getContentText() || "[]");
                if (found && found.length > 0) existingId = found[0].id;
            }
        }

        var isUpdate = !!existingId;
        var url = isUpdate
            ? SUPABASE_URL + "/rest/v1/bookings?id=eq." + encodeURIComponent(existingId)
            : SUPABASE_URL + "/rest/v1/bookings";

        var response = UrlFetchApp.fetch(url, {
            method: isUpdate ? "patch" : "post",
            contentType: "application/json",
            headers: Object.assign(buildSupabaseHeaders_(), { "Prefer": "return=representation" }),
            payload: JSON.stringify(payload),
            muteHttpExceptions: true
        });

        var code = response.getResponseCode();
        Logger.log("Response Code: " + code);
        Logger.log("Response Body: " + response.getContentText());

        if (code === 200 || code === 201 || code === 204) {
            sheet.getRange(rowIndex, DB_SYNC_COL).setValue("✅ DB " + new Date().toLocaleString("vi-VN"));
            return true;
        }

        sheet.getRange(rowIndex, DB_SYNC_COL).setValue("❌ " + code + ": " + response.getContentText().substring(0, 90));
        return false;
    } catch (error) {
        Logger.log("Error syncing: " + error);
        sheet.getRange(rowIndex, DB_SYNC_COL).setValue("❌ " + String(error.message || error).substring(0, 90));
        return false;
    }
}

// Sync tất cả dòng chưa có cờ DB hoặc có lỗi.
function retrySyncToDatabase() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bookings");
    if (!sheet || sheet.getLastRow() <= 1) return;

    var retried = 0;
    for (var i = 2; i <= sheet.getLastRow(); i++) {
        var customerName = sheet.getRange(i, 5).getValue();
        var syncFlag = String(sheet.getRange(i, DB_SYNC_COL).getValue() || "");
        if (customerName && (!syncFlag || syncFlag.includes("❌"))) {
            syncRowToSupabase(sheet, i);
            retried++;
            Utilities.sleep(300);
        }
    }
    Logger.log("Retry sync completed: " + retried + " rows");
}

function onChangeTrigger(e) {
    retrySyncToDatabase();
}

function setupAutoSyncTrigger() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        if (["onChangeTrigger", "retrySyncToDatabase"].includes(triggers[i].getHandlerFunction())) {
            ScriptApp.deleteTrigger(triggers[i]);
        }
    }

    ScriptApp.newTrigger("onChangeTrigger")
        .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
        .onChange()
        .create();

    ScriptApp.newTrigger("retrySyncToDatabase")
        .timeBased()
        .everyMinutes(30)
        .create();

    Logger.log("✅ Đã cài đặt trigger sync Supabase trực tiếp.");
}

function buildSupabaseHeaders_() {
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    };
}

function cleanSheetText_(value) {
    if (!value) return "";
    return String(value).trim().replace(/^'/, "");
}

function parseSupabaseDate_(dateTime) {
    var value = String(dateTime || "");
    var match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return match[3] + "-" + match[2] + "-" + match[1];
    return new Date().toISOString().split("T")[0];
}

function parseSupabaseTime_(dateTime) {
    var value = String(dateTime || "");
    var exact = value.match(/\d{2}\/\d{2}\/\d{4}\s+(\d{2}:\d{2})/);
    if (exact) return exact[1];
    var anyTime = value.match(/\b(\d{1,2}:\d{2})\b/);
    if (anyTime) {
        var parts = anyTime[1].split(":");
        return String(parseInt(parts[0], 10)).padStart(2, "0") + ":" + parts[1];
    }
    return "18:00";
}
