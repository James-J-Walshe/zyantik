# Zyantik Website - Setup Instructions

## File Structure

Your website consists of:
- `index.html` - Product landing page
- `knowledge-centre.html` - Documentation hub
- `styles.css` - Shared stylesheet
- `assets/` - Directory for images and media

## Logo Setup

Both pages reference a logo file at: `assets/zyantik-logo.png`

### To add your logo:

1. **Place your logo PNG file** in the `assets/` folder
2. **Rename it to:** `zyantik-logo.png`
3. **Recommended dimensions:** 
   - Height: 40-60px (will auto-scale to 40px)
   - Width: Proportional to height
   - Format: PNG with transparent background
   - File size: Keep under 50KB for fast loading

### Logo appears in two locations:
1. **Landing page** (index.html) - Shows logo + "Zyantik" text
2. **Knowledge Centre** (knowledge-centre.html) - Shows logo + "📚 Knowledge Centre" text

### If you don't have a logo yet:

You can temporarily:
- Use text-only branding (remove the `<img>` tag from both files)
- Create a simple logo using free tools like:
  - Canva (canva.com)
  - Logo.com
  - Figma (figma.com)

## Customizing Colors

All colors are defined in `styles.css` using CSS variables. Find and modify:

```css
:root {
    --primary-color: #0066cc;      /* Main brand color */
    --primary-dark: #0052a3;       /* Darker shade */
    --secondary-color: #667eea;    /* Accent color 1 */
    --accent-color: #764ba2;       /* Accent color 2 */
}
```

## Deploying Your Website

### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Your site will be live at: `username.github.io/repository-name`

### Option 2: Netlify (Free)
1. Drag and drop your folder to netlify.com/drop
2. Instant deployment with custom domain support

### Option 3: Traditional Web Hosting
1. Upload all files via FTP to your hosting provider
2. Maintain the file structure (keep CSS and assets folders intact)

## Browser Compatibility

This website works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For questions about the Project Estimating Tool itself, refer to the Knowledge Centre documentation at `knowledge-centre.html`.

For website technical issues:
- Check browser console for errors (F12)
- Verify all files are in correct locations
- Ensure `styles.css` is in same directory as HTML files
- Confirm `assets/` folder contains your logo

---

**Version:** 1.0  
**Last Updated:** October 2024
