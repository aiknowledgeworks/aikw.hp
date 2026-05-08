# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Japanese company website for AIナレッジワークス合同会社 (AI Knowledge Works LLC). The site is built as a static HTML/CSS/JavaScript website with a modern, gradient-based design and smooth animations.

**Live Site**: https://aiknowledgeworks.net  
**GitHub Pages URL**: https://aiknowledgeworks.github.io/aikw.hp

## Development Commands

### Basic Development
```bash
# Serve locally for development (using Python's built-in server)
python -m http.server 8000

# Alternative using Node.js (if available)
npx http-server -p 8000
```

### Deployment
```bash
# Deploy to GitHub Pages (automatic via GitHub Actions)
git add .
git commit -m "Update website content"
git push origin main
```

### Testing
```bash
# Validate HTML files (if html5validator is installed)
html5validator --root . --also-check-css

# Check for broken links (if linkchecker is installed)  
linkchecker http://localhost:8000
```

## Architecture & Structure

### Core Architecture
- **Static Site**: Pure HTML/CSS/JavaScript without build tools or frameworks
- **CSS-in-HTML**: All styles are embedded in `<style>` tags within each HTML file
- **Shared Components**: Common elements (header, navigation, footer) are duplicated across pages
- **Animation System**: Intersection Observer API-based reveal animations throughout
- **Japanese Language**: Primary language is Japanese with UTF-8 encoding

### Page Structure
```
index.html          # Homepage with hero section and company overview
service.html        # Services offered by the company
company.html        # Company information and team profiles  
businesspillars.html # Business pillars and core values
achievements.html   # Company achievements and success stories
contact.html        # Contact information and form
```

### Asset Organization
```
aitools/            # AI tool logos and images
images/             # Company member photos and general images
logo/               # Company logos in various formats
js/                 # JavaScript functionality
company/            # Additional company-related content and slides
```

### Styling Architecture
Each HTML file contains:
- **CSS Custom Properties**: Consistent color scheme using `:root` variables
- **Primary Gradient**: `linear-gradient(135deg, #6db5ff 0%, #a1e9d9 100%)`
- **Accent Color**: `#00c9a7` (teal green)
- **Typography**: Noto Sans JP + Nunito font stack
- **Grid Layouts**: CSS Grid for responsive card layouts
- **Animation Classes**: `.reveal`, `.active`, and transition states

### JavaScript Functionality
- **pagination.js**: Keyboard navigation system for slide-like page transitions
  - Arrow keys and Page Up/Down for navigation
  - Maintains page order in array for easy modification
- **Scroll Animations**: Intersection Observer reveals content on scroll
- **Interactive Elements**: Hover effects and card animations

### External Integrations
- **Google Analytics**: gtag.js implementation with ID `G-DWFLPN1EZH`
- **Dify Chatbot**: Custom implementation with secure API key management
- **Google Fonts**: Nunito and Noto Sans JP font families

## Common Development Patterns

### Adding New Pages
1. Copy an existing HTML file structure
2. Update `<title>` and page-specific content
3. Maintain consistent header/navigation structure
4. Add page to `js/pagination.js` array if keyboard navigation needed
5. Ensure proper meta tags and favicon references

### Updating Styles
- Modify embedded `<style>` sections in individual HTML files
- Use existing CSS custom properties for consistency
- Follow established naming conventions (kebab-case)
- Test animations with `.reveal` and `.active` classes

### Image Management
- Use descriptive file names (Japanese characters supported)
- Maintain consistent sizing for logos (44px height for header)
- Optimize images for web before adding to repository
- Use proper alt attributes for accessibility

## Deployment Notes

- **GitHub Pages**: Automatically deploys from `main` branch
- **Custom Domain**: `aiknowledgeworks.net` configured via CNAME file
- **No Build Process**: Direct deployment of static files
- **Git Credentials**: Currently uses personal access token in remote URL (should be updated for security)

## Content Management

### Text Updates
- Direct HTML editing for content changes
- Maintain Japanese language consistency
- Use semantic HTML elements for structure
- Preserve existing animation classes when updating content

### Logo and Branding
- Company logo files in `/logo` directory
- Transparent PNG versions for various use cases
- Consistent favicon implementation across all pages
- Proper Open Graph meta tags for social sharing
