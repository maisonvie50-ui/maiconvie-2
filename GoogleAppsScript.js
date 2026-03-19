function onEdit(e) {
    var sheet = e.source.getActiveSheet();
    // Check if we are on the correct sheet (change 'Sheet1' to your actual sheet name)
    if (sheet.getName() !== "Sheet1") return;

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
    // Map Columns to data (assuming A=1, B=2, ..., L=12 based on the screenshot)
    // A: Thời gian đồng bộ
    // B: Đối tác -> source or notes
    // C: Tên khách / Đoàn -> customerName
    // D: Mã Tour / Booking -> notes (Mã tour: XYZ)
    // E: SĐT khách -> phone
    // F: Số khách -> pax
    // G: Ngày giờ ăn -> bookingDate & time
    // H: Loại đơn / Menu -> notes (Menu: XYZ)
    // I: Yêu cầu -> notes (Yêu cầu: XYZ)
    // J: Giá tiền -> notes
    // K: Thanh toán -> notes
    // L: Ghi chú -> notes

    var rowData = sheet.getRange(rowIndex, 1, 1, 12).getValues()[0];

    if (!rowData[2]) {
        Logger.log("Row " + rowIndex + " has no customer name. Skipping.");
        return;
    }

    // Parse Ngày giờ ăn (G - index 6) -> split into Date and Time if possible
    var dateTimeStr = rowData[6] ? rowData[6].toString() : "";
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
    }

    // Construct notes from various columns
    var notesArr = [];
    if (rowData[1]) notesArr.push("Đối tác: " + rowData[1]);
    if (rowData[3]) notesArr.push("Mã Tour: " + rowData[3]);
    if (rowData[7]) notesArr.push("Loại đơn: " + rowData[7]);
    if (rowData[8]) notesArr.push("Yêu cầu: " + rowData[8]);
    if (rowData[11]) notesArr.push("Ghi chú: " + rowData[11]);

    var payload = {
        customerName: rowData[2],
        phone: rowData[4] ? rowData[4].toString() : "",
        pax: parseInt(rowData[5]) || 2,
        bookingDate: bookingDate,
        time: time,
        status: "new",
        source: "email",
        customerType: rowData[3] ? "tour" : "retail", // If there's a tour code, assume tour
        notes: notesArr
    };

    Logger.log("Sending payload: " + JSON.stringify(payload));

    // Replace with your Vercel/Node.js server URL
    // Example: "https://your-app-name.vercel.app/api/booking-sync"
    // For local testing using ngrok: "https://your-ngrok-url.ngrok-free.app/api/booking-sync"
    var apiUrl = "YOUR_SERVER_URL/api/booking-sync";

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
