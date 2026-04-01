function onEdit(e) {
    var sheet = e.source.getActiveSheet();
    // Check if we are on the correct sheet (change 'Sheet1' to your actual sheet name)
    if (sheet.getName() !== "Bookings") return;

    var range = e.range;
    // Trigger only if a new row is added and the first column (e.g., sync time) is filled
    // Or trigger manually via a button. This simple version triggers on any edit for demonstration,
    // but a better approach is to use an "onChange" or time-driven trigger if data comes from Zapier/Make.
    // 
    // Let's create a dedicated function to sync a specific row or all unsynced rows.
}

// RUN THIS FUNCTION to test syncing the last row
function testSyncLastRow() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    syncRowToSupabase(sheet, lastRow);
}

// Function to sync a specific row to the Node.js server
function syncRowToSupabase(sheet, rowIndex) {
    // Map Columns to data (A=1, B=2, ..., O=15 based on the new table format)
    // A: Thời gian đồng bộ (index 0)
    // B: Trạng thái (index 1)
    // C: Đối tác (index 2) -> notes
    // D: Email người gửi (index 3) -> notes
    // E: Tên khách / Đoàn (index 4) -> customerName
    // F: Mã Tour / Booking (index 5) -> notes & customerType
    // G: SĐT khách / HDV (index 6) -> phone
    // H: Số khách (PAX) (index 7) -> pax
    // I: Ngày giờ ăn (index 8) -> bookingDate & time
    // J: Thực đơn / Menu (index 9) -> notes
    // K: Dị ứng / Yêu cầu (index 10) -> notes
    // L: Giá tiền (index 11) -> notes
    // M: Thanh toán (index 12) -> notes
    // N: Ghi chú (index 13) -> notes
    // O: Lần cập nhật cuối (index 14)

    var rowData = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];

    // Cột E (index 4) là Tên khách / Đoàn
    if (!rowData[4]) {
        Logger.log("Row " + rowIndex + " has no customer name. Skipping.");
        return;
    }

    // Parse Ngày giờ ăn (Cột I - index 8) -> split into Date and Time if possible
    var dateTimeStr = rowData[8] ? rowData[8].toString() : "";
    var bookingDate = "";
    var time = "";
    if (dateTimeStr.includes(" ")) {
        var parts = dateTimeStr.split(" ");
        // Assuming format DD/MM/YYYY HH:MM:SS
        var dateParts = parts[0].split("/");
        if (dateParts.length === 3) {
            bookingDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0]; // YYYY-MM-DD
        }
        time = parts[1].substring(0, 5); // HH:MM
        if (time.length <= 2) {
            time = time + ":00"; // format like "18" -> "18:00"
        }
    }

    // Construct notes from various columns (chỉ chứa thông tin bổ sung, KHÔNG chứa email và mã booking)
    var notesArr = [];
    if (rowData[2]) notesArr.push("Đối tác: " + rowData[2]);
    if (rowData[9] && rowData[9].toString().toLowerCase() !== "n/a") notesArr.push("Thực đơn/Menu: " + rowData[9]);
    if (rowData[10] && rowData[10].toString().trim().toLowerCase() !== "không") notesArr.push("Dị ứng/Yêu cầu: " + rowData[10]);
    if (rowData[11]) notesArr.push("Giá tiền: " + rowData[11]);
    if (rowData[12] && rowData[12].toString().toLowerCase() !== "n/a") notesArr.push("Thanh toán: " + rowData[12]);
    if (rowData[13]) notesArr.push("Ghi chú: " + rowData[13]);

    var payload = {
        customerName: rowData[4],
        phone: rowData[6] ? rowData[6].toString() : "",
        email: rowData[3] ? rowData[3].toString() : "",       // Email người gửi -> cột riêng
        pax: parseInt(rowData[7]) || 2,
        bookingDate: bookingDate,
        time: time,
        status: "new",
        source: "email",
        customerType: rowData[5] ? "tour" : "retail",
        bookingCode: rowData[5] ? rowData[5].toString() : "", // Mã Tour/Booking -> cột riêng
        notes: notesArr
    };

    Logger.log("Sending payload: " + JSON.stringify(payload));

    // API URL - sử dụng Vercel serverless function
    var apiUrl = "https://maison-vie-3.vercel.app/api/booking-sync";

    var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
    };

    try {
        var response = UrlFetchApp.fetch(apiUrl, options);
        Logger.log("Response Code: " + response.getResponseCode());
        Logger.log("Response Body: " + response.getContentText());
    } catch (error) {
        Logger.log("Error syncing: " + error);
    }
}

// Function to trigger on form submit or automatically when emails bring new rows
function onChangeTrigger(e) {
    // Use onChange trigger for programmatic row additions (like from Zapier/Make)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    // Call sync for the newly added row
    syncRowToSupabase(sheet, lastRow);
}
