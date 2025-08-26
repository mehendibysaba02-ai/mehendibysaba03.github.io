
Mehendi by Saba — Setup Notes
=============================

What changed
------------
- Branding updated to "Mehendi by Saba".
- Added Customer Info form on checkout.
- Added bKash/Nagad payment selection with MSISDN + TRX input (already present).
- On "Place Order", order details are sent to Google Sheets (via Apps Script web app).
- Added floating Messenger & WhatsApp buttons (bottom-right).
- Added Product Details page (product.html) with Add to Cart.
- Kept all original styles, colors, and assets intact.

WhatsApp & Messenger
--------------------
- WhatsApp opens chat: wa.me/8801797850441
- Messenger opens: m.me (replace with your page later if you have one).

Google Sheets Integration
-------------------------
1) Create a new Google Sheet. Name first sheet "Orders".
2) Open Extensions → Apps Script. Paste the following code and deploy as Web App (execute as Me, accessible to Anyone).

-------- APPS SCRIPT (Code.gs) --------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Project','Order ID','Method','MSISDN','TRXID','Total','Name','Phone','Email','City','Address','Note','Items JSON']);
    }
    sheet.appendRow([
      new Date(),
      data.project || '',
      data.orderId || '',
      data.method || '',
      data.msisdn || '',
      data.trxid || '',
      data.total || '',
      data.customer?.name || '',
      data.customer?.phone || '',
      data.customer?.email || '',
      data.customer?.city || '',
      data.customer?.address || '',
      data.customer?.note || '',
      JSON.stringify(data.items || [])
    ]);
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch(err) {
    return ContentService.createTextOutput('ERR').setMimeType(ContentService.MimeType.TEXT);
  }
}
--------------------------------------

3) After deployment, copy the Web App URL and replace it in `gsheets.js`:
   const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYED_WEBAPP_URL/exec";

Build/Run
---------
This is a static site. You can open index.html directly.
Optional Node server demo files (server.js, bkash.js, nagad.js) are kept for reference but not required.

Files Added
-----------
- product.html
- gsheets.js
- README_Mehendi_by_Saba.txt

Files Updated
-------------
- index.html
- checkout.html
- app.js
- styles.css (unchanged)
