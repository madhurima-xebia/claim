# Claim Management System - UI

## Components

### App.tsx
Main application component that manages:
- Form display vs. Claims list view
- API communication
- Loading states and error handling
- Success notifications

### ClaimForm.tsx
Form component for submitting new claims with:
- Real-time validation
- Error messages
- Support for all claim types
- Currency formatting for amounts

### ClaimsList.tsx
Display component for viewing claims with:
- Expandable claim cards
- Status badges with color coding
- Ability to update claim status
- Responsive grid layout

## Styling

All components use CSS modules and CSS Grid/Flexbox for responsive design.

### Color Scheme
- Background: Dark blue (#1a1f3a to #16213e)
- Primary: Green (#4caf50, #81c784)
- Secondary: Light gray (#e0e0e0, #b0bec5)
- Accents: Yellow, Red for status indicators

### Key CSS Files
- `global.css` - Global styles and animations
- `App.css` - Layout and sidebar styling
- `ClaimForm.css` - Form component styling
- `ClaimsList.css` - Claims list and cards styling

## Features

✅ Submit new insurance claims
✅ View all claims with detailed information
✅ Update claim status with workflow transitions
✅ Real-time form validation
✅ Responsive mobile design
✅ Dark theme with accent colors
✅ Loading states and error handling
✅ Expandable claim cards
✅ Status badges with color coding
