
// gsheets.js
// This file posts order data to a Google Apps Script WebApp URL (Spreadsheet).
const fetch = require('node-fetch');
const SHEET_WEBAPP_URL = process.env.SHEET_WEBAPP_URL || 'REPLACE_WITH_YOUR_DEPLOYED_WEBAPP_URL';

async function sendToSheet(order){
  if(!SHEET_WEBAPP_URL || SHEET_WEBAPP_URL.startsWith('REPLACE')){
    console.warn('gsheets: missing SHEET_WEBAPP_URL - please deploy Apps Script and set SHEET_WEBAPP_URL env var');
    return false;
  }
  try{
    const res = await fetch(SHEET_WEBAPP_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(order)
    });
    const j = await res.json();
    return j;
  }catch(e){
    console.warn('Sheet send failed', e);
    return false;
  }
}

module.exports = { sendToSheet };
