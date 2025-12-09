const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * POST /api/create-checkout
 * Creates a checkout session via Yuno API
 * Body: { amount, currency, countryCode, language }
 */
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { amount = 10000, currency = 'USD', countryCode = 'CO', language = 'en' } = req.body;

    // Call Yuno API to create checkout session
    const yunoResponse = await axios.post(
      `${process.env.YUNO_API_BASE}/sessions/checkout`,
      {
        amount,
        currency,
        country: countryCode,
        language,
        // Additional fields as per Yuno docs
        customer: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'Customer',
        },
        merchantOrderId: `order-${Date.now()}`,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.YUNO_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the checkout session to frontend
    res.json({
      checkoutSession: yunoResponse.data.session || yunoResponse.data,
      success: true,
    });
  } catch (error) {
    console.error('Error creating checkout:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to create checkout session',
    });
  }
});

/**
 * GET /api/payment/:id
 * Retrieves payment status from Yuno API
 */
app.get('/api/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const paymentResponse = await axios.get(
      `${process.env.YUNO_API_BASE}/payments/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.YUNO_SECRET_KEY}`,
        },
      }
    );

    res.json(paymentResponse.data);
  } catch (error) {
    console.error('Error fetching payment:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Failed to fetch payment',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
