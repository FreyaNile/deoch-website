# Code Quality Audit Results
**Generated on:** 2026-05-04 [05:39]

## Unnecessary !important
- css\components\data-management.css:174
- css\components\shared-core.css:1201

## Spaghetti Code (High Complexity)
- No obvious issues detected.

## Hardcoding (Magic Numbers/Strings)
- No obvious issues detected.

## Callback Hell (Deep Nesting)
- No obvious issues detected.

## Code Smell (Suboptimal Patterns)
- No obvious issues detected.

## Memory Leak Risks
- No obvious issues detected.

## Race Condition Risks
- app.js:116 (setTimeout used)
- gamejs\character.js:140 (setTimeout used)
- gamejs\DataManager.js:36 (setTimeout used)
- gamejs\dice-roller.js:220 (setTimeout used)
- gamejs\HUDManager.js:66 (setTimeout used)
- gamejs\HUDManager.js:326 (setTimeout used)
- gamejs\HUDManager.js:364 (setTimeout used)
- gamejs\navigation.js:175 (setTimeout used)
- gamejs\navigation.js:260 (setTimeout used)
- gamejs\navigation.js:279 (setTimeout used)
- gamejs\rest.js:78 (setTimeout used)
- gamejs\rest.js:79 (setTimeout used)
- gamejs\rest.js:81 (setTimeout used)
- gamejs\StatManager.js:86 (setTimeout used)
- gamejs\stats.js:63 (setTimeout used)
- gamejs\stats.js:69 (setTimeout used)
- gamejs\stats.js:166 (setTimeout used)
- gamejs\stats.js:170 (setTimeout used)
- gamejs\test-sheet.js:176 (setTimeout used)
- gamejs\test-sheet.js:222 (setTimeout used)
- ... and 5 more instances.

## Technical Debt
- No obvious issues detected.

## Dead Code & Feature Creep
- *Note:* Static regex-based analysis for dead code and feature creep without a full AST/Bundler graph yields unreliable results. Previous orphan checks have pruned legacy dead code.
