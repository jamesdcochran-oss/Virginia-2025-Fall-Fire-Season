# Quick Start: Creating the Standalone Fuel Moisture Calculator Repository

## In 5 Minutes

```bash
# 1. Extract the archive
tar -xzf fuel-moisture-calculator.tar.gz
cd fuel-moisture-calculator

# 2. Validate everything works
./validate.sh

# 3. Initialize git
git init
git add .
git commit -m "Initial commit: Fuel Moisture Calculator v1.0.0"

# 4. Create repository on GitHub
# Go to https://github.com/new
# Name: fuel-moisture-calculator
# Description: Robust JavaScript library for fire weather fuel moisture calculations
# Public, no README/license/gitignore (we have them)

# 5. Push to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fuel-moisture-calculator.git
git branch -M main
git push -u origin main

# 6. Create first release
git tag -a v1.0.0 -m "v1.0.0 - Initial standalone release"
git push origin v1.0.0
```

## What You Get

### Live URLs (after publishing)
- **Demo:** `https://YOUR_USERNAME.github.io/fuel-moisture-calculator/`
- **Tests:** `https://YOUR_USERNAME.github.io/fuel-moisture-calculator/fuel-calculator-test.html`
- **CDN:** `https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js`

### Repository Features
- ✅ 11 files, 16KB total
- ✅ Zero runtime dependencies
- ✅ Works in browser, Node.js, Deno, Bun
- ✅ Automated testing with GitHub Actions
- ✅ Complete API documentation
- ✅ Interactive demo page
- ✅ NPM-ready (optional)

## Usage Examples

### Browser (CDN)
```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js"></script>
<script>
  const emc = computeEMC(85, 25);
  console.log('EMC:', emc); // ~4.1%
</script>
```

### Node.js
```javascript
const fs = require('fs');
eval(fs.readFileSync('./fuel-calculator.js', 'utf8'));

const results = runModel(10, 12, [
  { temp: 85, rh: 25, wind: 10, hours: 12 }
]);
console.log(results);
```

## Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: / (root)
4. Save
5. Visit: `https://YOUR_USERNAME.github.io/fuel-moisture-calculator/`

## Optional: Publish to NPM

```bash
npm login
npm publish
```

Then users can:
```bash
npm install fuel-moisture-calculator
```

## Link Back from This Repository

Add to your README.md:
```markdown
## Fuel Moisture Calculator

📦 **Standalone Library:** [fuel-moisture-calculator](https://github.com/YOUR_USERNAME/fuel-moisture-calculator)

🔗 **CDN:** https://cdn.jsdelivr.net/gh/YOUR_USERNAME/fuel-moisture-calculator@v1.0.0/fuel-calculator.js
```

## Support

- Full instructions: See `STANDALONE-REPO-INSTRUCTIONS.md`
- Package contents: See `README.md` in extracted folder
- Repository structure: See `validate.sh` for all files

## Next Steps After Publishing

1. ✅ Add repository topics: `fire-weather`, `javascript`, `fuel-moisture`, `wildfire`, `emc`
2. ✅ Enable GitHub Pages for live demo
3. ✅ Add link to standalone repo in this project's README
4. ✅ Star the repository
5. ⬜ (Optional) Publish to NPM
6. ⬜ (Optional) Convert this project to use CDN link

---

**Ready?** Extract `fuel-moisture-calculator.tar.gz` and follow the commands above!
