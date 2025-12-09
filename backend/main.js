// Configuration
const PUBLIC_KEY = 'your_public_key_here'; // Replace with your PUBLIC_KEY
const BACKEND_URL = 'http://localhost:4000'; // Change to deployed URL in production

// For production (when hosted):
// const BACKEND_URL = 'https://your-backend.onrender.com';

let yunoInstance = null;

/**
 * Initialize Yuno SDK on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Initializing Yuno SDK...');
    
    // Initialize Yuno with your public key
    yunoInstance = Yuno.initialize(PUBLIC_KEY);
    
    console.log('✓ Yuno SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Yuno:', error);
    showStatus('Failed to initialize payment SDK. Please refresh the page.', 'error');
  }
});

/**
 * Handle payment button click
 */
async function handlePayment() {
  try {
    const button = document.getElementById('pay-button');
    button.disabled = true;

    showLoading(true);
    
    console.log('Creating checkout session...');

    // Step 1: Call backend to create checkout session
    const response = await fetch(`${BACKEND_URL}/api/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 10000, // $100.00 in minor units (cents)
        currency: 'USD',
        countryCode: 'CO', // Match your routing config
        language: 'en',
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Checkout session created:', data);

    showLoading(false);

    // Step 2: Start Yuno checkout with the session
    console.log('Starting Yuno checkout...');

    yuno.startCheckout({
      checkoutSession: data.checkoutSession, // Session from backend
      countryCode: 'CO', // Match routing
      language: 'en',
      elementSelector: '#yuno-checkout', // Embed here (no redirect)
      onPaymentCompleted: handlePaymentSuccess,
      onError: handlePaymentError,
    });

    console.log('✓ Yuno checkout rendered');
  } catch (error) {
    console.error('Error initiating payment:', error);
    showLoading(false);
    showStatus(`Error: ${error.message}`, 'error');
    document.getElementById('pay-button').disabled = false;
  }
}

/**
 * Callback when payment succeeds
 */
function handlePaymentSuccess(paymentData) {
  console.log('✓ Payment completed:', paymentData);
  showStatus(
    `✓ Payment Successful! Transaction ID: ${paymentData?.transactionId || 'N/A'}`,
    'success'
  );
  document.getElementById('pay-button').disabled = true;
}

/**
 * Callback when payment fails
 */
function handlePaymentError(error) {
  console.error('✗ Payment error:', error);
  showStatus(
    `✗ Payment Failed: ${error?.message || 'Unknown error'}`,
    'error'
  );
  document.getElementById('pay-button').disabled = false;
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
  const loading = document.querySelector('.loading');
  loading.style.display = show ? 'block' : 'none';
}

/**
 * Show status message
 */
function showStatus(message, type) {
  const statusEl = document.getElementById('status-message');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}
