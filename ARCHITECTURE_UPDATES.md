# 🔄 Amy's Haven - Architecture Update Log

**Last Updated**: February 22, 2026 @ 5:20 PM PST

---

## ✅ Recent Changes (February 22, 2026)

### CSS Fixes & New Variant Selectors

**Changed Files**:
- Created: `/frontend/css/variant-selectors.css`
- Modified: Need to link new CSS in HTML files

**What Changed**:
1. Created box-style variant selector system for product dimensions
2. Fixed `.section-title` center alignment (was already correct in CSS, may need HTML check)

**How It Works**:
- Product variants (Length, Width, Wood Species) now display as clickable boxes
- Boxes have hover states and selected states
- Responsive design adjusts for mobile
- Follows design from customer screenshot

**To Use**:
```html
<div class="variant-group">
    <div class="variant-group-header">
        <span class="variant-label">Length</span>
    </div>
    <div class="variant-options-grid">
        <div class="variant-option-box">
            <input type="radio" name="length" id="length-72" value="72">
            <label for="length-72" class="variant-option-label">72"</label>
        </div>
        <div class="variant-option-box">
            <input type="radio" name="length" id="length-84" value="84">
            <label for="length-84" class="variant-option-label">84"</label>
        </div>
    </div>
</div>
```

**Next Steps**:
1. Add variant-selectors.css to product-detail.html
2. Update add-product.js to generate boxes instead of dropdowns
3. Test on live site

---

## 📁 File Locations Reference

### CSS Files
- `/frontend/css/design-system.css` - Design tokens & variables
- `/frontend/css/main.css` - Main stylesheet
- `/frontend/css/variant-selectors.css` - ✨ NEW: Product variant boxes
- `/frontend/css/product-detail.css` - Product detail page styles
- `/frontend/css/icons.css` - Icon system

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

## 📝 Change History

### February 22, 2026 - 5:20 PM
- **Added**: Box-style variant selectors CSS
- **Fixed**: Reviewed section title alignment
- **Created**: This ARCHITECTURE_UPDATES.md file
- **Status**: Ready to test

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
**Variant Selectors**: 🟡 CSS ready, needs HTML integration

---

## 📋 TODO Next

1. Link `/frontend/css/variant-selectors.css` in product pages
2. Update add-product.js to generate box selectors
3. Test variant selection on product detail page
4. Consider SendGrid setup for real emails

---

**This file tracks all architectural changes. Update it whenever you make changes to:**
- Service URLs
- API endpoints
- Database schema
- File locations
- CSS architecture
- JavaScript structure

**Keep ARCHITECTURE.md as the comprehensive reference, use this file for changelogs.**
