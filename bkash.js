
// bkash.js (PLACEHOLDER)
// This file contains example endpoints for handling bkash payment confirmations.
// IMPORTANT: You must replace the placeholder variables below with your real bkash credentials
// (app_key, app_secret, gateway URLs). This code is a template — DO NOT use in production until tested.
const express = require('express');
const router = express.Router();

// === CONFIGURE THESE ===
const BkashConfig = {
  APP_KEY: process.env.BKASH_APP_KEY || 'REPLACE_APP_KEY',
  APP_SECRET: process.env.BKASH_APP_SECRET || 'REPLACE_APP_SECRET',
  MERCHANT_NO: process.env.BKASH_MERCHANT_NO || 'REPLACE_MERCHANT_NO',
  // Add sandbox/live endpoints as needed
};
// =======================

// Example: receive a confirmation POST from frontend after user paid via bkash
router.post('/confirm', async (req, res) => {
  try {
    const { orderId, trxId, msisdn } = req.body;
    if(!orderId || !trxId) return res.status(400).json({error:'missing orderId or trxId'});

    // TODO: verify txn with bkash server-side API using BkashConfig credentials.
    // For now we return a mock success — replace with real verification.
    console.log('Bkash confirm received', {orderId, trxId, msisdn});

    // Update your order store / notify GSHEET endpoint etc.
    res.json({ok:true, message:'mock confirmed - replace with real bkash verification'});
  } catch(e){
    console.error(e);
    res.status(500).json({error:'server error'});
  }
});

module.exports = router;
