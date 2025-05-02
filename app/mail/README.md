# Email Templates

This directory contains all email templates used in the Ringard application.

## Directory Structure

```
mail/
├── auth/                    # Authentication related emails
│   ├── email-verification.html
│   ├── password-reset.html
│   ├── new-device-login.html
│   ├── account-recovery.html
│   ├── two-factor-setup.html
│   └── password-changed.html
│
├── security/               # Security related notifications
│   ├── suspicious-activity.html
│   ├── account-locked.html
│   ├── account-banned.html
│   └── account-deletion.html
│
├── billing/               # Billing and subscription related
│   ├── payment-confirmation.html
│   ├── subscription-renewal.html
│   └── subscription-expired.html
│
└── notifications/         # General notifications
    ├── content-removed.html
    ├── data-download.html
    └── update-notification.html
```

## Template Variables

Common variables used across templates:

- `{{username}}` - User's display name
- `{{email}}` - User's email address
- `{{verificationCode}}` - Verification code for email verification
- `{{resetLink}}` - Password reset link
- `{{loginLocation}}` - Location of new device login
- `{{deviceInfo}}` - Information about the device
- `{{expiryDate}}` - Expiration date for various features
- `{{amount}}` - Payment amount
- `{{planName}}` - Subscription plan name

## Styling

All templates use consistent styling defined in their respective CSS sections:

- Orange gradient theme (`#ff6b00` to `#ff9900`)
- Responsive design
- Animated elements
- Consistent typography
- Modern UI elements
