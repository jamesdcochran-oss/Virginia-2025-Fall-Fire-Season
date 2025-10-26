#!/usr/bin/env python3
"""
Diagnostic Check Script for Virginia Fire Season Dashboard
Checks county correctness and color logic in dashboard.js
"""

import re
import sys
from pathlib import Path

# Virginia counties (official list)
VIRGINIA_COUNTIES = {
    'Accomack', 'Albemarle', 'Alleghany', 'Amelia', 'Amherst', 'Appomattox',
    'Arlington', 'Augusta', 'Bath', 'Bedford', 'Bland', 'Botetourt',
    'Brunswick', 'Buchanan', 'Buckingham', 'Campbell', 'Caroline', 'Carroll',
    'Charles City', 'Charlotte', 'Chesterfield', 'Clarke', 'Craig', 'Culpeper',
    'Cumberland', 'Dickenson', 'Dinwiddie', 'Essex', 'Fairfax', 'Fauquier',
    'Floyd', 'Fluvanna', 'Franklin', 'Frederick', 'Giles', 'Gloucester',
    'Goochland', 'Grayson', 'Greene', 'Greensville', 'Halifax', 'Hanover',
    'Henrico', 'Henry', 'Highland', 'Isle of Wight', 'James City', 'King and Queen',
    'King George', 'King William', 'Lancaster', 'Lee', 'Loudoun', 'Louisa',
    'Lunenburg', 'Madison', 'Mathews', 'Mecklenburg', 'Middlesex', 'Montgomery',
    'Nelson', 'New Kent', 'Northampton', 'Northumberland', 'Nottoway', 'Orange',
    'Page', 'Patrick', 'Pittsylvania', 'Powhatan', 'Prince Edward', 'Prince George',
    'Prince William', 'Pulaski', 'Rappahannock', 'Richmond', 'Roanoke', 'Rockbridge',
    'Rockingham', 'Russell', 'Scott', 'Shenandoah', 'Smyth', 'Southampton',
    'Spotsylvania', 'Stafford', 'Surry', 'Sussex', 'Tazewell', 'Warren',
    'Washington', 'Westmoreland', 'Wise', 'Wythe', 'York'
}

def check_dashboard_js():
    """Check dashboard.js for county and color logic issues"""
    dashboard_path = Path('dashboard.js')
    
    if not dashboard_path.exists():
        print("❌ ERROR: dashboard.js not found")
        return False
    
    content = dashboard_path.read_text()
    issues = []
    
    # Extract county names from dashboard.js
    county_pattern = r'["\']([A-Z][a-z]+(\s+[A-Z][a-z]+)*)["\']'
    found_counties = set(re.findall(county_pattern, content))
    found_counties = {c[0] for c in found_counties if c[0] in VIRGINIA_COUNTIES}
    
    # Check for missing counties
    missing = VIRGINIA_COUNTIES - found_counties
    if missing:
        issues.append(f"⚠️  Missing counties: {', '.join(sorted(missing))}")
    
    # Check color logic patterns
    color_checks = [
        (r'level\s*===?\s*["\']4["\']', 'Level 4 (Red)'),
        (r'level\s*===?\s*["\']3["\']', 'Level 3 (Orange)'),
        (r'level\s*===?\s*["\']2["\']', 'Level 2 (Yellow)'),
        (r'level\s*===?\s*["\']1["\']', 'Level 1 (Green)'),
    ]
    
    for pattern, desc in color_checks:
        if not re.search(pattern, content):
            issues.append(f"⚠️  Missing color logic: {desc}")
    
    # Report results
    if issues:
        print("\n⚠️  DIAGNOSTIC ISSUES FOUND:")
        for issue in issues:
            print(f"  {issue}")
        print(f"\n📊 Total counties found: {len(found_counties)}/{len(VIRGINIA_COUNTIES)}")
        return False
    else:
        print("✅ All checks passed!")
        print(f"📊 Total counties: {len(found_counties)}/{len(VIRGINIA_COUNTIES)}")
        print("🎨 Color logic verified")
        return True

if __name__ == '__main__':
    success = check_dashboard_js()
    sys.exit(0 if success else 1)
