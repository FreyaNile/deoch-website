# CSS Comparison Audit Report (zprime25 vs current)

## Overview
A structural comparison between the pre-modularization backup (`.tmp/zprime25/css`) and the current CSS (`zprime/css`) reveals that **154 selectors are currently failing to parse or are missing**. 

## Root Cause: Syntax Corruption
The purification scripts (`purify_css_logic.py` and `purify_deep_audit.py`) utilized regex-based string slicing to move CSS blocks. This logic failed to account for nested braces (e.g., inside `@media` queries) and pseudo-classes, resulting in malformed CSS files with mismatched `{` and `}` braces. 

When a CSS file has mismatched braces, the browser's CSSOM parser breaks, causing all subsequent styles in that file to silently fail to hook up to the HTML elements.

## Affected Files (Mismatched Braces)
The following files currently contain syntax errors and are breaking the CSS cascade:
- `cards.css`: Too many closing braces
- `char-components.css`: Missing closing braces
- `combat.css`: Mismatched braces
- `dice-roller.css`: Too many closing braces
- `hud.css`: Too many closing braces (critical break)
- `site-sections.css`: Missing closing braces
- `splash.css`: Mismatched braces
- `test-page.css`: Missing closing braces

## Missing / Broken Logic
Because of the above errors, critical logic is currently detached from the UI, including:
1. **HUD Components:** `.top-mobile-hud`, `.hud-avatar`, `.hud-bar.hp`, `.floating-vitality-orbs`, and expanded states.
2. **Typography & Forms:** Core tags like `h1`, `h3`, `input`, `select`, `#char-form`.
3. **Combat & Dice:** `#combat-log-list`, `.dice-count-badge`, `#toggle-dice-btn`.
4. **Cards:** `.class-card`, `.mega-card`.

## Recommendation
The regex-based python scripts must be rewritten to use an AST parser (like `tinycss2`) or a robust token-based brace matcher to safely extract CSS. The `zprime/css` directory should be restored from the `zprime25` backup, and the modularization should be re-run with fixed scripts.