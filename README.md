# GN Furniture - Project Documentation

## Project Overview
GN Furniture is a modern web application for browsing and purchasing premium furniture online. It features Google authentication, product collections, and Google Pay integration for seamless checkout.

## Project Structure

```
Gn_Furniture/
├── index.html                 # Main login/welcome page
├── css/
│   └── style.css             # Global stylesheet
├── js/
│   ├── firebase-config.js    # Firebase configuration
│   ├── script-index.js       # Login page functionality
│   ├── script-home.js        # Home page with Google Pay
│   └── script-about.js       # About/Other pages functionality
├── pages/
│   ├── home.html             # Home page with products
│   ├── about.html            # About us page
│   ├── products.html         # Products listing
│   └── contact.html          # Contact information
├── assets/
│   └── (images and media)   # Placeholder for furniture images
├── PAYMENT_SETUP.md          # Payment configuration guide
├── README.md                 # This file
└── gn.txt                    # Notes file
```

## File Organization

### Root Directory
- **index.html** - Entry point with Google authentication
- **PAYMENT_SETUP.md** - Payment setup instructions
- **README.md** - Project documentation

### CSS Directory (`/css`)
- **style.css** - Contains all styling for the application including:
  - Responsive design (mobile, tablet, desktop)
  - Popup and modal styles
  - Header and footer styles
  - Product card layouts
  - Payment modal styles

### JavaScript Directory (`/js`)
- **firebase-config.js** - Firebase project configuration (shared across all pages)
- **script-index.js** - Login page with Google authentication
- **script-home.js** - Home page with product display and Google Pay integration
- **script-about.js** - Authentication check for protected pages

### Pages Directory (`/pages`)
- **home.html** - Main page after login with furniture collections
- **about.html** - Company information and details
- **products.html** - Product listing (expandable)
- **contact.html** - Contact information and support

### Assets Directory (`/assets`)
- Store all images and media files here:
  - Furniture product images
  - Background images
  - Icons and logos

## Key Features

### 1. Authentication
- Google OAuth login via Firebase
- Session-based persistence
- Automatic logout on session end
- User profile display

### 2. Payment Integration
- Google Pay integration
- Secure payment processing
- Order summary display
- Payment confirmation

### 3. Product Showcase
- Responsive product grid
- Furniture collection categories
- Price display
- Image galleries
- Automatic carousel on home page

### 4. Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop enhancement
- Flexible navigation

## Firebase Configuration

The Firebase project uses:
- **Project ID**: gn-furniture
- **Authentication**: Google OAuth
- **Database**: Firestore (ready for expansion)

Configuration is stored in `js/firebase-config.js`

## How to Use

### For Users
1. Open `index.html` in a web browser
2. Click "Sign in with Google"
3. Complete Google authentication
4. Browse furniture collections on home page
5. Use the "Shop" button to proceed with checkout
6. Select payment method
7. Complete transaction

### For Developers

#### Adding a New Page
1. Create new HTML file in `/pages/`
2. Copy the header and footer from existing pages
3. Create a new JavaScript file in `/js/` (e.g., `script-newpage.js`)
4. Import Firebase config and auth functions
5. Link the JavaScript file at the bottom of the HTML

#### Adding New Products
- Update the product cards in `pages/home.html`
- Add product images to `/assets/`
- Update the product card HTML with new items

#### Modifying Styles
- Edit `css/style.css`
- All responsive breakpoints are documented
- Mobile: below 600px
- Tablet: 600px - 768px
- Tablet+: 769px - 1024px
- Desktop: 1025px and above

## Dependencies

### External Libraries
- Firebase (v10.12.2)
  - Authentication
  - Real-time database ready
- Google Pay API
- Bootstrap (Not used - custom CSS)

### Browser Requirements
- Modern browser with ES6 support
- JavaScript enabled
- Cookies enabled for authentication

## Deployment

### Before Deployment
1. Verify Firebase configuration
2. Test all authentication flows
3. Test responsive design on multiple devices
4. Verify Google Pay integration
5. Update contact information if needed

### Hosting Options
- GitHub Pages (static hosting)
- Firebase Hosting
- Netlify
- Vercel
- Traditional web hosting

## Security Notes

⚠️ **Important**: 
- Firebase credentials are public (API key visible in frontend)
- Implement Firestore security rules
- Use environment variables for sensitive data
- Never commit API keys in production code

## Future Enhancements

- [ ] Product database with Firestore
- [ ] Shopping cart functionality
- [ ] User profile management
- [ ] Order history
- [ ] Product reviews and ratings
- [ ] Payment history
- [ ] Email notifications
- [ ] Admin dashboard

## Contact & Support

For issues or questions:
- **Email**: ammomin009@gmail.com
- **Phone**: +91 9726029382
- **Address**: Porda wada ni chali, Near S.S hospital. Petlad-388450

## License

© GN Furniture. All rights reserved.

---

**Last Updated**: May 2026
**Version**: 1.0
