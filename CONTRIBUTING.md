# Contributing to Five Forks Fire Weather Dashboard

Thank you for your interest in contributing to the Five Forks Fire Weather Dashboard! This document provides guidelines and instructions for contributing to the project.

## 🚀 Quick Start

### Prerequisites

- Python 3.x
- Node.js (for JavaScript syntax checking)
- Git
- A GitHub account

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/Virginia-2025-Fall-Fire-Season.git
   cd Virginia-2025-Fall-Fire-Season
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run diagnostics**
   ```bash
   python diagnostic_check.py
   ```

4. **Open diagnostics page**
   ```bash
   # Serve locally (Python 3)
   python -m http.server 8000
   # Then open http://localhost:8000/diagnostics.html
   ```

## 📂 Project Structure

```
Virginia-2025-Fall-Fire-Season/
├── index.html              # Main dashboard
├── fuel-calculator.js      # Fuel moisture calculator (minimal version)
├── scripts/
│   └── dashboard.js        # Main dashboard logic with county loading
├── data/
│   └── counties.json       # County list with coordinates
├── briefs/
│   ├── index.html          # Briefs index page
│   └── *.docx              # Generated daily briefs
├── diagnostics.html        # Diagnostic testing page
├── diagnostic_check.py     # Python diagnostic script
├── .github/workflows/
│   ├── ci.yml              # CI smoke tests
│   ├── update-data.yml     # Weather data updates
│   └── daily-brief.yml     # Daily brief generation
└── README.md
```

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style
   - Test changes locally
   - Run diagnostics

3. **Test locally**
   ```bash
   # Run Python diagnostics
   python diagnostic_check.py
   
   # Check JavaScript syntax
   node -c fuel-calculator.js
   node -c scripts/dashboard.js
   
   # Validate JSON
   python -m json.tool data/counties.json
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**

## 🧪 Testing

### Manual Testing

1. **Open diagnostics page**
   - Navigate to `http://localhost:8000/diagnostics.html`
   - Run all diagnostic tests
   - Verify all tests pass

2. **Test dashboard functionality**
   - Open `index.html`
   - Verify county data loads
   - Test fuel calculator modal
   - Check map displays correctly
   - Test theme toggle

### Automated Testing

The CI workflow (`.github/workflows/ci.yml`) runs automatically on push and PR:

- File existence checks
- JSON validation
- JavaScript syntax checks
- County data structure validation
- Diagnostic script execution

## 📋 Code Style Guidelines

### JavaScript

- Use ES6+ features
- Defensive programming (check for null/undefined)
- Clear variable names
- Comment complex logic
- Use async/await for promises

Example:
```javascript
async function loadCountyList() {
  try {
    const response = await fetch('data/counties.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const counties = await response.json();
    console.log('✅ Loaded counties:', counties.length);
  } catch (error) {
    console.warn('⚠️ Failed to load counties:', error.message);
  }
}
```

### Python

- Follow PEP 8 style guide
- Use type hints where appropriate
- Clear function and variable names
- Docstrings for functions

### HTML/CSS

- Semantic HTML5
- Mobile-first responsive design
- CSS variables for theming
- Accessible markup (ARIA labels)

## 🔍 Diagnostics & Debugging

### Running Diagnostics

```bash
# Python diagnostics
python diagnostic_check.py

# Open browser diagnostics
python -m http.server 8000
# Navigate to http://localhost:8000/diagnostics.html
```

### Common Issues

**Counties not loading?**
- Check `data/counties.json` exists and is valid JSON
- Verify fetch path in `scripts/dashboard.js`
- Check browser console for errors

**Fuel calculator not working?**
- Verify `fuel-calculator.js` is loaded
- Check for JavaScript errors in console
- Test functions in diagnostics page

**Map tiles not loading?**
- Tile provider fallback should activate automatically
- Check network tab for tile requests
- Verify Leaflet.js is loaded

## 🚀 Deployment

The dashboard is automatically deployed via GitHub Pages when changes are pushed to `main`:

1. GitHub Actions workflows run on schedule and on push
2. Weather data is fetched from NWS API
3. Daily briefs are generated as .docx files
4. Dashboard updates are deployed to GitHub Pages

### Manual Deployment Test

```bash
# Build and test locally
python -m http.server 8000

# Push to trigger deployment
git push origin main
```

## 📝 Documentation

When adding new features:

1. Update README.md if needed
2. Add comments to code
3. Update diagnostics.html with new tests
4. Document new dependencies in requirements.txt

## 🐛 Reporting Issues

When reporting issues:

1. Check existing issues first
2. Provide clear reproduction steps
3. Include browser/OS information
4. Attach screenshots if applicable
5. Include console errors

## 💡 Feature Requests

Feature requests are welcome! Please:

1. Check if similar request exists
2. Describe the use case
3. Explain expected behavior
4. Consider implementation complexity

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Questions?

- Open an issue for bugs or questions
- Check diagnostics page for system health
- Review existing code for examples

---

**Thank you for contributing to Five Forks Fire Weather Dashboard!** 🔥
