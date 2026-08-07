# Creating Standalone Fuel Moisture Calculator Repository

## Overview

The Fuel Moisture Calculator has been prepared as a standalone repository. All necessary files are included in `fuel-moisture-calculator.tar.gz`.

## What's Included

The standalone repository contains:

### Core Files
- **fuel-calculator.js** - The hardened calculator library
- **fuel-calculator-test.html** - Comprehensive test suite
- **index.html** - Interactive demo page

### Documentation
- **README.md** - Complete API documentation and usage guide
- **CONTRIBUTING.md** - Guidelines for contributors
- **LICENSE** - MIT License
- **SETUP.md** - Detailed setup instructions

### Development
- **package.json** - NPM package configuration
- **.gitignore** - Git ignore rules
- **.github/workflows/test.yml** - Automated testing with GitHub Actions
- **examples/node-example.js** - Node.js usage examples

## Quick Start

### Extract and Review

```bash
# Extract the archive
tar -xzf fuel-moisture-calculator.tar.gz
cd fuel-moisture-calculator

# Review the structure
ls -la

# Test the library
node examples/node-example.js

# Open demo in browser
# Double-click index.html or serve with: python3 -m http.server 8000
```

### Create GitHub Repository

1. **Create new repository on GitHub:**
   - Name: `fuel-moisture-calculator`
   - Description: "Robust JavaScript library for fire weather fuel moisture calculations"
   - Public repository
   - **Don't** initialize with README (we have one)

2. **Push the code:**
   ```bash
   cd fuel-moisture-calculator
   git init
   git add .
   git commit -m "Initial commit: Fuel Moisture Calculator v1.0.0"
   git remote add origin https://github.com/YOUR_USERNAME/fuel-moisture-calculator.git
   git branch -M main
   git push -u origin main
   ```

3. **Create release:**
   ```bash
   git tag -a v1.0.0 -m "v1.0.0 - Initial standalone release"
   git push origin v1.0.0
   ```

### Usage Examples

#### Browser (CDN)
```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js"></script>
<script>
  const emc = computeEMC(85, 25);
  console.log('EMC:', emc);
</script>
```

#### Node.js
```javascript
const fs = require('fs');
eval(fs.readFileSync('./fuel-calculator.js', 'utf8'));

const results = runModel(10, 12, [
  { temp: 85, rh: 25, wind: 10, hours: 12 }
]);
console.log(results);
```

#### NPM (after publishing)
```bash
npm install fuel-moisture-calculator
```

## Linking Back to This Repository

After creating the standalone repository, you can link to it from this project:

### Option 1: Add a Reference Section

Add to your main README.md:

```markdown
## Components

### Fuel Moisture Calculator

The fuel moisture calculator is maintained as a standalone library:

📦 **Repository:** [fuel-moisture-calculator](https://github.com/YOUR_USERNAME/fuel-moisture-calculator)

🔗 **CDN:** `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js`

📖 **Documentation:** See the [standalone repository](https://github.com/YOUR_USERNAME/fuel-moisture-calculator#readme)
```

### Option 2: Use as Git Submodule

Replace the local files with a submodule:

```bash
# In this repository
git rm fuel-calculator.js fuel-calculator-test.html
git submodule add https://github.com/YOUR_USERNAME/fuel-moisture-calculator.git lib/fuel-calculator
git commit -m "Use fuel-calculator as submodule"

# Update HTML references
# Change: <script src="fuel-calculator.js"></script>
# To: <script src="lib/fuel-calculator/fuel-calculator.js"></script>
```

### Option 3: Use CDN Link

Update index.html to use the CDN version:

```html
<!-- Replace local script tag -->
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js"></script>
```

This ensures the main repository always uses the stable, released version.

## Features of Standalone Repository

✅ **Self-contained** - No dependencies on parent repository  
✅ **NPM-ready** - Can be published to npm registry  
✅ **CDN-ready** - Can be served via jsDelivr, unpkg  
✅ **CI/CD** - GitHub Actions for automated testing  
✅ **Comprehensive docs** - README, API reference, examples  
✅ **Test suite** - Browser and Node.js tests included  
✅ **Versioned** - Proper semantic versioning via git tags  
✅ **Open source** - MIT licensed  

## Repository Statistics

- **Total files:** 11
- **Main library:** fuel-calculator.js (217 lines)
- **Test suite:** fuel-calculator-test.html (285 lines)
- **Documentation:** ~15KB of markdown
- **Zero runtime dependencies**
- **Works in:** Browser, Node.js, Deno, Bun

## Demo Links (After Publishing)

- **Live demo:** `https://YOUR_USERNAME.github.io/fuel-moisture-calculator/`
- **Test suite:** `https://YOUR_USERNAME.github.io/fuel-moisture-calculator/fuel-calculator-test.html`
- **NPM package:** `https://www.npmjs.com/package/fuel-moisture-calculator`
- **jsDelivr CDN:** `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator/`

## Maintenance

To update the standalone repository with changes from this project:

```bash
# In this repository, after making changes to fuel-calculator.js
cp fuel-calculator.js /path/to/fuel-moisture-calculator/
cd /path/to/fuel-moisture-calculator/

# Commit and tag new version
git add fuel-calculator.js
git commit -m "Update fuel calculator"
git tag -a v1.0.1 -m "v1.0.1 - Bug fixes"
git push origin main v1.0.1
```

## Support

For questions or issues with the standalone repository:
- Open issues in the standalone repository
- See CONTRIBUTING.md for development guidelines
- Check README.md for API documentation

---

**Next Steps:**
1. Extract `fuel-moisture-calculator.tar.gz`
2. Review the files
3. Create GitHub repository
4. Push code and create v1.0.0 release
5. Link back to standalone repo from this project
