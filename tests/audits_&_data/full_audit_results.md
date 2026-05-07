# [DEOCH] Full Enhanced Diagnostic Audit Report
**Generated on:** 2026-05-06 [21:37]

## Executive Summary
* **Total Issues Flagged:** 35
* **[CRITICAL]:** 0
* **[WARNING]:** 34
* **[OPTIMIZATION]:** 1

## Detailed Findings
| Severity | Category | Location | Description | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| [WARN] | Specificity | `css/components/character-creation-tour.css` | !important flag used in selector: .u-tour-overlay | Refactor for natural cascade. |
| [WARN] | Specificity | `css/components/character-creation-tour.css` | !important flag used in selector: .u-tour-overlay.hidden | Refactor for natural cascade. |
| [WARN] | Specificity | `css/components/character-creation-tour.css` | !important flag used in selector: body.tour-active:not(.char-sheet-active) .global-header,
body.tour-active:not(.char-sheet-active) .top-mobile-hud,
body.tour-active:not(.char-sheet-active) .floating-vitality-orbs,
body.tour-active:not(.char-sheet-active) .combat-utilities-wrapper,
body.tour-active:not(.char-sheet-active) #toggle-dice-btn | Refactor for natural cascade. |
| [WARN] | Specificity | `css/components/shared-core.css` | !important flag used in selector: .u-hidden | Refactor for natural cascade. |
| [WARN] | Specificity | `css/components/shared-core.css` | !important flag used in selector: #test-settings-btn.active | Refactor for natural cascade. |
| [WARN] | Optimization | `gamejs/DataManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/DataManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/DataManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/DataManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/DataManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/GMManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/InterfaceManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/MechanicsManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/MechanicsManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/MechanicsManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/MechanicsManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/MechanicsManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/StatManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/StatManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/StatManager.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/dice-roller.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/dice-roller.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/dice-roller.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/dice-roller.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/tour.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [WARN] | Optimization | `gamejs/tour.js` | Exact duplicate logic signature found. | Abstract into shared function. |
| [OPTI] | Optimization | `Global CSS/HTML` | 96 CSS classes declared but not attached to HTML/JS. | Prune unused classes. |

## Unused CSS Classes (Candidates for Pruning)
`TTF`, `action-grid-2x2`, `action-roll-result`, `age-card`, `allocated`, `armor-stats-grid`, `attune-toggle`, `btn-clicked-pop`, `bulk-apply-btn`, `bulk-close`, `cards-grid`, `char-avatar`, `char-meta`, `char-name`, `circle-checkbox-group`, `circle-toggle`, `collapsed`, `combat-actions-grid`, `combat-mode`, `combat-side-grid`, `condition-item`, `conditions-container`, `conditions-wrapper`, `css`, `custom-option`, `custom-options`, `custom-select-trigger`, `custom-select-wrapper`, `damage-calc-content-wrapper`, `damage-calc-form-group`, `damage-calculator`, `equip-toggle-btn`, `equipment-grid`, `exhaustion-track`, `exiting`, `expanded-points-tracker`, `flex-center`, `flex-column`, `full-width-span`, `gallery-character-btn`, `gap-md`, `gap-sm`, `glass-panel`, `has-session-spent`, `health-mana-grid`, `highlight-on-rest`, `hp`, `hud-avatar-container`, `hud-bar`, `hud-header-toggles`, `info-grid`, `inspiration-form-group`, `lucide-book-open`, `m-b-md`, `mobile-bottom-nav`, `mp`, `newsletter-form`, `next-level-text`, `physical-traits-grid`, `png`, `rest-actions-grid`, `rest-toast`, `save-status`, `section-content`, `selected`, `shade-active`, `shake`, `sim-roll-val`, `size-slider`, `slot-attune-toggle`, `stat-btn`, `stat-btn-hidden`, `stat-has-spent`, `stat-notification-popup`, `stat-orb`, `stat-overlay-btn`, `stat-points-display`, `stats-card`, `stats-grid`, `test-gallery-card`, `test-scroll-content`, `tour-overlay`, `ttf`, `u-bg-black-05`, `u-bg-black-15`, `u-bg-black-25`, `u-flex-between`, `u-gap-md`, `u-gap-sm`, `u-p-0-25-0`, `u-p-0-4-0-75`, `u-pr-4`, `u-w-16`, `vitals-label`, `vitals-status-grid`, `w3`
