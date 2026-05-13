# Payment Integration Setup Guide

## Current Payment System
This project uses **Razorpay** for real payment processing. Razorpay is one of India's leading payment gateways supporting:
- Credit/Debit Cards
- UPI (Unified Payments Interface)
- Net Banking
- Digital Wallets (Google Pay, Apple Pay, etc.)
- Prepaid Cards

## Test Mode (Current Setup)

### Test Credentials (Already Configured)
- **Razorpay Test Key ID**: `rzp_test_1DP5MMWBdH1l0Q`
- **Status**: Currently in TEST mode for development

### Test Payment Details
You can use these test card details to test payments:

**Visa Card (Success)**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Mastercard (Success)**
- Card Number: `5555 5555 5555 4444`
- Expiry: Any future date
- CVV: Any 3 digits

**Card (Failure - Optional)**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

**For UPI**: Use test UPI ID like `success@razorpay` or `failure@razorpay`

## Going Live (Production)

### Step 1: Create Razorpay Account
1. Visit https://razorpay.com
2. Sign up and complete KYC verification
3. Your account will be approved (usually within 24 hours)

### Step 2: Get Production Credentials
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Copy your **Key ID** (Production)

### Step 3: Update Code
Replace the test key in `home.html`:

**Current (Test):**
```javascript
key: 'rzp_test_1DP5MMWBdH1l0Q',
```

**Your Production Key:**
```javascript
key: 'rzp_live_YOUR_KEY_ID',
```

### Step 4: Webhooks (Optional but Recommended)
For handling payment confirmations on your backend:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yoursite.com/webhook`
3. Subscribe to events: `payment.authorized`, `payment.failed`

## Payment Flow

```
User Clicks "Pay with Razorpay"
           ↓
Payment Modal Opens
           ↓
Razorpay Checkout Appears
           ↓
User Selects Payment Method & Enters Details
           ↓
Payment Processed
           ↓
Success/Failure Response
           ↓
Order Confirmation Alert
```

## Security Notes

✅ **What's Secure:**
- PCI DSS Level 1 compliant
- SSL/TLS encryption
- No sensitive data stored locally
- Tokenization support available

⚠️ **Important:**
- Never share your Key ID publicly
- For production, use HTTPS only
- Implement server-side validation
- Store payment records securely

## Features Included

✅ Automatic amount calculation
✅ User information pre-filled
✅ Real-time payment processing
✅ Order ID generation
✅ User authentication check
✅ Error handling
✅ Success confirmations

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Contact: GN Furniture Team

---

**Last Updated**: May 13, 2026
