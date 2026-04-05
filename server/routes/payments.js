const express = require('express');
const https = require('https');
require('dotenv').config();

const router = express.Router();

// Verify Paystack transaction
router.post('/verify', async (req, res) => {
  const { reference } = req.body;
  
  if (!reference) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  try {
    const options = {
      hostname: 'api.paystack.co',
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const result = JSON.parse(data);
        
        if (result.status && result.data.status === 'success') {
          // Transaction is verified - return success
          res.json({
            success: true,
            data: {
              reference: result.data.reference,
              amount: result.data.amount,
              currency: result.data.currency,
              payment_type: result.data.channel,
              customer: {
                email: result.data.customer.email,
                phone: result.data.metadata?.phone_number
              }
            }
          });
        } else {
          // Transaction failed or not found
          res.status(400).json({
            success: false,
            error: 'Transaction verification failed',
            message: result.message || 'Payment could not be verified'
          });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Paystack verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment verification service unavailable'
      });
    });

    request.end();
    
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during verification'
    });
  }
});

// Webhook endpoint (optional but recommended)
router.post('/webhook', (req, res) => {
  const event = req.body;
  
  // Verify webhook signature here in production
  if (event.event === 'charge.success') {
    // Payment was successful - update database
    console.log('Payment webhook received:', event.data);
  }
  
  res.status(200).send('OK');
});

module.exports = router;
