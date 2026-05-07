# CSS Deep Audit Results

**Total Files:** 13
**Total Selectors Analyzed:** 926
**Orphaned Selectors Found:** 52
**Duplicate Style Blocks:** 66

## Top Orphaned Selectors (Actual Cleanup Targets)
- .m-b-md (in tokens.css)
- .u-gap-sm, .gap-sm (in tokens.css)
- .u-gap-md, .gap-md (in tokens.css)
- @font-face (in shared-core.css)
- @font-face (in shared-core.css)
- @font-face (in shared-core.css)
- @font-face (in shared-core.css)
- @font-face (in shared-core.css)
- .u-fullscreen (in shared-core.css)
- .u-pr-4 (in shared-core.css)
- .u-p-0-25-0 (in shared-core.css)
- .u-max-h-180 (in shared-core.css)
- @keyframes fadeIn (in shared-core.css)
- @keyframes metallic-shimmer (in shared-core.css)
- .next-level-text (in shared-core.css)
- @keyframes statRollIn (in shared-core.css)
- @keyframes statFadeIn (in shared-core.css)
- @keyframes tooltip-float (in shared-core.css)
- .tab-nav::after (in shared-core.css)
- @keyframes fadeIn (in shared-core.css)
- @keyframes gold-flicker (in shared-core.css)
- @keyframes shake (in shared-core.css)
- @keyframes slideUpFade (in shared-core.css)
- @keyframes toastPop (in shared-core.css)
- @keyframes fadeInScale (in shared-core.css)
- @keyframes fadeInSlide (in shared-core.css)
- @keyframes spinGear (in shared-core.css)
- @keyframes popPalette (in shared-core.css)
- @keyframes slideDownFade (in shared-core.css)
- .bulk-close (in shared-core.css)
- .bulk-apply-btn (in shared-core.css)
- @keyframes statRollIn (in shared-core.css)
- @keyframes statFadeIn (in shared-core.css)
- @keyframes spinGear (in shared-core.css)
- .btn-clicked-pop i,
.btn-clicked-pop svg (in shared-core.css)
- @keyframes popPalette (in shared-core.css)
- .summary-item[data-stat="str"] :is(i, svg),
.summary-item[data-stat="dex"] :is(i, svg),
.summary-item[data-stat="con"] :is(i, svg) (in hud.css)
- .custom-select-wrapper (in home-why-deoch-classes-updates.css)
- .updates-timeline::before (in home-why-deoch-classes-updates.css)
- @keyframes orbSlosh (in orbs.css)

## Duplicate Style Blocks (Cross-file or Redundant Blocks)
- Same rules shared by: .logo-container (in navigation.css), .logo-container (in shared-core.css)
- Same rules shared by: .logo (in navigation.css), .logo (in shared-core.css)
- Same rules shared by: .logo-subtitle (in navigation.css), .logo-subtitle (in shared-core.css)
- Same rules shared by: .nav-btn:hover (in navigation.css), .nav-btn.active (in navigation.css), .tab-btn:hover (in shared-core.css), .condition-item:hover (in main-character-card.css)
- Same rules shared by: /* Chrome, Edge, and Safari */


*::-webkit-scrollbar (in shared-core.css), .secondary-stat-label i (in shared-core.css)
- Same rules shared by: .u-pl-1-75 (in shared-core.css), .updates-timeline (in home-why-deoch-classes-updates.css)
- Same rules shared by: .u-text-center (in shared-core.css), .modal-dialog.text-center (in shared-core.css), .text-center (in shared-core.css)
- Same rules shared by: .u-text-accent (in shared-core.css), .tab-btn.active i,
.tab-btn.active svg (in shared-core.css), .tab-btn.active (in shared-core.css), .privacy-inline-btn:hover (in shared-core.css), .test-gallery-card.active .char-name (in data-management.css)
- Same rules shared by: .u-relative (in shared-core.css), #tab-combat (in main-character-card.css)
- Same rules shared by: .u-p-1-25 (in shared-core.css), .contact-footer-form (in shared-core.css), .mega-card (in home-why-deoch-classes-updates.css)
- Same rules shared by: .u-border-top-glass (in shared-core.css), .u-border-top-faint (in shared-core.css)
- Same rules shared by: .u-icon-xs (in shared-core.css), .theme-switcher-header .theme-label i,
.theme-switcher-header .theme-label [data-lucide],
.theme-switcher-header .theme-label i svg (in shared-core.css), .bulk-btn.shield i (in shared-core.css)
- Same rules shared by: .u-overflow-hidden (in shared-core.css), body.tour-active (in character-creation-tour.css)
- Same rules shared by: .u-w-full (in shared-core.css), #newsletter-email (in home-why-deoch-classes-updates.css)
- Same rules shared by: .u-h-auto (in shared-core.css), #test-tabs-card .tab-pane (in main-character-card.css)
- Same rules shared by: .u-font-size-sm (in shared-core.css), .summary-item .mod (in hud.css)
- Same rules shared by: .u-font-size-base (in shared-core.css), .nav-btn (in home-why-deoch-classes-updates.css)
- Same rules shared by: .u-font-size-xl (in shared-core.css), .ethos-header (in home-why-deoch-classes-updates.css), .stamina-orb span (in orbs.css)
- Same rules shared by: .u-min-h-400 (in shared-core.css), .tab-content (in shared-core.css)
- Same rules shared by: .u-rotate-n90 (in shared-core.css), .section-toggle-btn.collapsed (in shared-core.css), body.on-test-page:not(.tour-active) #toggle-dice-btn.active i,
body.on-test-page:not(.tour-active) #toggle-dice-btn.active svg (in main-character-card.css)
- Same rules shared by: .u-pointer-events-auto (in shared-core.css), body.on-test-page #test-settings-btn,
    body.on-test-page #test-theme-btn,
    body.on-test-page #test-hud-exp-details,
    body.on-test-page #test-hud-exp-box-wrapper,
    body.on-test-page #test-hud-exp-box-wrapper summary,
    body.on-test-page #test-hud-exp-box-wrapper .clickable-input,
    body.on-test-page .inspiration-toggle,
    body.on-test-page .hud-avatar,
    body.on-test-page .management-menu-content button (in data-management.css)
- Same rules shared by: .u-pointer-events-none (in shared-core.css), .stat-rolling (in shared-core.css), .stat-rolling (in main-character-card.css), /* Icon Switching for Dice Roller */

#toggle-dice-btn i,
#toggle-dice-btn svg (in main-character-card.css), body.on-test-page:not(.tour-active) #toggle-dice-btn i,
#toggle-dice-btn svg (in main-character-card.css)
- Same rules shared by: .u-hidden (in shared-core.css), .u-tour-overlay.hidden (in character-creation-tour.css), /* Hide elements during tour handled by components */

/* Hide HUDs during Tour */

body.tour-active:not(.char-sheet-active) .global-header,
body.tour-active:not(.char-sheet-active) .top-mobile-hud,
body.tour-active:not(.char-sheet-active) .floating-vitality-orbs,
body.tour-active:not(.char-sheet-active) .combat-utilities-wrapper,
body.tour-active:not(.char-sheet-active) #toggle-dice-btn (in character-creation-tour.css)
- Same rules shared by: .u-grid-cols-2 (in shared-core.css), .languages-grid (in main-character-card.css)
- Same rules shared by: .u-mb-0-75 (in shared-core.css), /* Announcement Bar */

.feature-card-header-wrapper (in home-why-deoch-classes-updates.css), .mega-card h3.gothic-header (in home-why-deoch-classes-updates.css), body.on-test-page:not(.tour-active) .actions-panel (in main-character-card.css)
- Same rules shared by: .tour-option-grid (in shared-core.css), .action-grid-2x2 (in main-character-card.css)
- Same rules shared by: .u-grid (in shared-core.css), /* Show standard dice roller elements on the test page (identical to character sheet) */

body.on-test-page:not(.tour-active) #dice-roller-widget .dice-result-container,
body.on-test-page:not(.tour-active) #dice-roller-widget .dice-controls-row (in main-character-card.css)
- Same rules shared by: .lang-indicator-btn:hover (in shared-core.css), .legendmark-entry:hover input (in shared-core.css)
- Same rules shared by: /* Header Aesthetics (DeochRPG style) */








@media (max-width: 768px) (in shared-core.css), /* Circle Checkboxes */



















@media (min-width: 420px) (in shared-core.css), /* --- Layout Utilities --- */








@media (max-width: 600px) (in shared-core.css)
- Same rules shared by: .page-section.active (in shared-core.css), .bulk-adjustment-title (in shared-core.css), .bulk-adjustment-title (in data-management.css)
- Same rules shared by: @keyframes fadeIn (in shared-core.css), @keyframes fadeIn (in shared-core.css), @keyframes fadeInSlide (in shared-core.css)
- Same rules shared by: .primary-btn:active,
.secondary-btn:active (in shared-core.css), .bulk-adjustment-modal.active .bulk-adjustment-content (in shared-core.css), .bulk-adjustment-modal.active .bulk-adjustment-content (in data-management.css)
- Same rules shared by: .btn-prefix (in shared-core.css), summary::-webkit-details-marker (in shared-core.css), .hidden-checkbox,
.lang-checkbox (in shared-core.css), .hidden (in shared-core.css), .bulk-close (in shared-core.css)
- Same rules shared by: @keyframes statRollIn (in shared-core.css), @keyframes statRollIn (in shared-core.css)
- Same rules shared by: .stat-fade-back (in shared-core.css), .stat-fade-back (in shared-core.css)
- Same rules shared by: @keyframes statFadeIn (in shared-core.css), @keyframes statFadeIn (in shared-core.css)
- Same rules shared by: .equip-toggle-btn.open svg (in shared-core.css), #toggle-dice-btn.active i,
#toggle-dice-btn.active svg (in main-character-card.css)
- Same rules shared by: .save-status.show (in shared-core.css), .data-transfer-dialog .close-btn:hover (in data-management.css)
- Same rules shared by: /* Stats grid: stack to 2 columns (2x3) */
    .stats-grid (in shared-core.css), /* Form: less padding on tiny screens */
    .form-header (in shared-core.css), /* Updates timeline: tighten further */


    /* Info grid: Name on own line, Heritage/Age side-by-side */
    body .info-grid (in shared-core.css), .languages-grid (in main-character-card.css)
- Same rules shared by: body .info-grid .form-group.full-width (in shared-core.css), .contact-grid .full-width (in shared-core.css), .hero-actions>*:nth-child(3) (in main-character-card.css)
- Same rules shared by: .restoration-content-wrapper (in shared-core.css), .languages-wrapper (in main-character-card.css)
- Same rules shared by: .restoration-content-wrapper.expanded (in shared-core.css), .damage-calc-content-wrapper.expanded (in shared-core.css)
- Same rules shared by: .icon-toggle:hover (in shared-core.css), .exhaustion-toggle:hover i (in main-character-card.css)
- Same rules shared by: .rules-grid (in shared-core.css), .ethos-grid (in home-why-deoch-classes-updates.css), /* Test Sheet Languages Responsive Layout */

#test-tab-core .languages-grid (in main-character-card.css)
- Same rules shared by: .modifier-buttons (in shared-core.css), .dice-buttons (in main-character-card.css)
- Same rules shared by: /* Advantage / Disadvantage */




.adv-btn (in shared-core.css), .dis-btn (in shared-core.css)
- Same rules shared by: .bulk-input (in shared-core.css), .bulk-input (in shared-core.css)
- Same rules shared by: .bulk-input:focus (in shared-core.css), .bulk-input:focus (in shared-core.css)
- Same rules shared by: .btn-clicked-spin i,
.btn-clicked-spin svg (in shared-core.css), /* Management Menu Animations */
.btn-clicked-spin i,
.btn-clicked-spin svg (in shared-core.css)
- Same rules shared by: @keyframes spinGear (in shared-core.css), @keyframes spinGear (in shared-core.css)
- Same rules shared by: @keyframes popPalette (in shared-core.css), @keyframes popPalette (in shared-core.css)
- Same rules shared by: .bulk-adjustment-modal.active (in shared-core.css), .bulk-adjustment-modal.active (in data-management.css)
- Same rules shared by: /* Stat Roll Overlay Styles */
.stat-roll-result (in shared-core.css), /* Character Sheet Form */

/* Stat Roll Animation */

.stat-roll-result (in main-character-card.css)
- Same rules shared by: .splash-transparent (in deoch-splash.css), .stat-btn-hidden (in main-character-card.css)
- Same rules shared by: body.has-available-points .expanded-points-tracker (in hud.css), body.on-test-page:not(.tour-active) .top-mobile-hud (in hud.css), body.has-available-points .floating-vitality-orbs.expanded .hud-header-toggles (in orbs.css), body.on-test-page.char-sheet-active:not(.tour-active):not(.tour-active) .combat-utilities-wrapper,
body.on-test-page:not(.tour-active) .combat-utilities-wrapper (in main-character-card.css), body.on-test-page.char-sheet-active:not(.tour-active):not(.tour-active) #toggle-dice-btn,
body.on-test-page:not(.tour-active) #toggle-dice-btn (in main-character-card.css)
- Same rules shared by: /* Show Plus when points are available AND HUD is expanded */

body.hud-expanded.has-available-points .summary-item .stat-overlay-btn.plus (in hud.css), body.hud-expanded.has-session-spent .summary-item.stat-has-spent .stat-overlay-btn.minus (in hud.css)
- Same rules shared by: .newsletter-form (in home-why-deoch-classes-updates.css), .equipment-slot-header (in data-management.css)
- Same rules shared by: .mp-group (in orbs.css), /* When the Mana orb is missing, move the Skill (Stamina) orb to its position (column 3) */

.sp-group:has(~ .mp-group.hidden),
.sp-group:has(~ .mp-group[style*="display: none"]) (in orbs.css)
- Same rules shared by: .health-orb span,
.mana-orb span (in orbs.css), #dice-result-value (in main-character-card.css)
- Same rules shared by: body.on-test-page:not(.tour-active) .combat-utilities-wrapper (in main-character-card.css), body.on-test-page:not(.tour-active) .combat-utilities-wrapper (in main-character-card.css)
- Same rules shared by: .dice-controls-row (in main-character-card.css), .modifier-buttons,
    .dice-buttons (in main-character-card.css), body.on-test-page:not(.tour-active) .exhaustion-dots (in main-character-card.css)
- Same rules shared by: .dice-widget-content (in main-character-card.css), .equipment-column (in data-management.css)
- Same rules shared by: body.on-test-page:not(.tour-active) .conditions-panel,
    body.on-test-page:not(.tour-active) .restoration-panel,
    body.on-test-page:not(.tour-active) .damage-calculator (in main-character-card.css), body.on-test-page:not(.tour-active) .conditions-wrapper.expanded,
    body.on-test-page:not(.tour-active) .restoration-content-wrapper.expanded,
    body.on-test-page:not(.tour-active) .damage-calc-content-wrapper.expanded (in main-character-card.css)
- Same rules shared by: #test-tabs-card .tab-content (in main-character-card.css), #gm-monster-catalog (in bestiary.css)
- Same rules shared by: body.on-test-page:not(.tour-active) #test-tabs-card .tab-content (in main-character-card.css), body.on-test-page #gm-monster-catalog (in bestiary.css)
- Same rules shared by: .equipment-slot-header input:focus (in data-management.css), .equipment-desc-wrapper textarea:focus (in data-management.css)
