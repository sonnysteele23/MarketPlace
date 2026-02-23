# 🔄 Amy's Haven - Architecture Update Log

**Last Updated**: February 22, 2026 @ 6:00 PM PST

---

## ✅ Recent Changes (February 22, 2026 - Session 3)

### Dimension Fields Added to Product Form

**Changed Files**:
- Modified: `/artist-cms/add-product.html`

**What Changed**:
1. **REMOVED**: Entire "Product Variants" section
2. **ADDED**: Individual dimension fields (Length, Width, Height) in Product Details section
3. Dimensions display as a 3-column row with "inches" suffix

**HTML Structure Added**:
```html
<div class="form-row">
    <div class="form-group">
        <label for="length">Length</label>
        <div class="input-with-suffix">
            <input type="number" id="length" name="length" step="0.1" placeholder="0.0">
            <span class="suffix">inches</span>
        </div>
    </div>
    <!-- Width and Height follow same pattern -->
</div>
```

**Product Details Section Now Includes**:
1. Materials Used (text)
2. **Length** (number + inches)
3. **Width** (number + inches)  
4. **Height** (number + inches)
5. Weight (number + lbs)
6. Care Instructions (textarea)

**Reason**: Simplified product creation - artists enter actual dimensions rather than variant options. This matches the product detail page design where dimensions are displayed as specifications.

---

## ✅ Recent Changes (February 22, 2026 - Session 2)

### Section Title Centering Fix

**Changed Files**:
- Modified: `/frontend/css/main.css`

**What Changed**:
Added centering properties to `.section-title` class:
```css
.section-title {
  text-align: center !important;
  /* ... existing properties ... */
  width: 100%;          /* NEW */
  display: block;       /* NEW */
  margin-left: auto;    /* NEW */
  margin-right: auto;   /* NEW */
}
```

**Result**: "Shop by Category" and all section titles now properly centered.

---

## ✅ Recent Changes (February 22, 2026 - Session 1)

### CSS Fixes & New Variant Selectors

**Changed Files**:
- Created: `/frontend/css/variant-selectors.css`
- Modified: `/frontend/css/main.css`

**What Changed**:
1. Created box-style variant selector system for product dimensions  
2. Fixed `.section-title` center alignment

**How It Works**:
- Product variants (for future use) display as clickable boxes
- Boxes have hover states and selected states
- Responsive design adjusts for mobile
- Currently NOT in use (replaced by dimension fields)

---

## 📁 File Locations Reference

### CSS Files
- `/frontend/css/design-system.css` - Design tokens & variables
- `/frontend/css/main.css` - Main stylesheet ✏️ (updated today)
- `/frontend/css/variant-selectors.css` - ✨ NEW: Product variant boxes (not currently in use)
- `/frontend/css/product-detail.css` - Product detail page styles
- `/frontend/css/icons.css` - Icon system

### HTML Files Updated Today
- `/artist-cms/add-product.html` - ✏️ Added dimension fields, removed variants

### Where API URLs Live
- `/frontend/js/main.js` - Line 12: `apiUrl: 'https://marketplace-production-336b.up.railway.app/api'`
- `/artist-cms/js/dashboard.js` - Line 7-9: Conditional API URL
- `/artist-cms/js/add-product.js` - Line 10-12: Conditional API URL
- `/artist-cms/js/my-products.js` - Line 7-9: Conditional API URL
- `/artist-cms/js/orders.js` - Line 7-9: Conditional API URL
- `/artist-cms/js/profile.js` - Line 7-9: Conditional API URL

---

## 🔗 Service URLs (Current)

| Service | URL | Last Updated |
|---------|-----|--------------|
| Production Site | https://amyshaven.com | Active |
| Railway API | https://marketplace-production-336b.up.railway.app | Feb 22, 2026 |
| Supabase DB | https://hgzshxoshmsvwrrdgriv.supabase.co | Active |
| Railway Dashboard | https://railway.app/dashboard | - |
| Supabase Dashboard | https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv | - |

---

## 📝 Complete Change History

### February 22, 2026 - 6:00 PM
- **Removed**: Product Variants section from add-product.html
- **Added**: Length, Width, Height fields to Product Details
- **Updated**: Form structure for cleaner dimension entry
- **Status**: Ready to test

### February 22, 2026 - 5:30 PM
- **Fixed**: Section title centering issue
- **Added**: Additional CSS properties for proper alignment
- **Status**: Deployed and working

### February 22, 2026 - 5:20 PM
- **Added**: Box-style variant selectors CSS (not currently in use)
- **Fixed**: Reviewed section title alignment
- **Created**: This ARCHITECTURE_UPDATES.md file
- **Status**: CSS ready but not integrated

### February 22, 2026 - 5:00 PM  
- **Updated**: All API URLs to new Railway backend
- **Fixed**: Database schema (ran FIX-DATABASE-COPY-THIS.sql)
- **Added**: Automated email system
- **Deployed**: Railway backend live
- **Tested**: Health check passing ✅

---

## 🎯 Current State

**Backend**: ✅ Live on Railway  
**Frontend**: ✅ Live on GitHub Pages  
**Database**: ✅ Supabase schema updated  
**Emails**: ✅ System active (dev mode)  
**Section Titles**: ✅ Centered  
**Add Product Form**: ✅ Updated with dimension fields

---

## 📋 TODO Next

1. Test add-product form with new dimension fields
2. Update database to store length, width, height values
3. Display dimensions on product detail page
4. Consider SendGrid setup for real emails

---

**This file tracks all architectural changes. Update it whenever you make changes to:**
- Service URLs
- API endpoints
- Database schema
- File locations
- CSS architecture
- JavaScript structure
- HTML form structure

**Keep ARCHITECTURE.md as the comprehensive reference, use this file for changelogs.**
