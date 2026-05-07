"""
modularize_css.py
Splits zprime/css/base.css into component modules under css/components/.
Rewrites base.css as an @import manifest preserving cascade order exactly.
Zero visual deviation — no selectors added, removed, or reordered globally.
"""

import os
import re

BASE_CSS  = r"C:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime\css\base.css"
COMP_DIR  = r"C:\Users\molti\.gemini\antigravity\scratch\deoch-website\zprime\css\components"

os.makedirs(COMP_DIR, exist_ok=True)

with open(BASE_CSS, "r", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

total = len(lines)
print(f"Read {total} lines from base.css")

# ---------------------------------------------------------------------------
# Component map: list of (filename, [(start_1based, end_1based), ...])
# Ranges are INCLUSIVE on both ends.
# All 6470 lines must be covered exactly once.
# ---------------------------------------------------------------------------
COMPONENTS = [
    # --- foundational -------------------------------------------------------
    ("reset",            [(1,   94)]),   # @font-face, scrollbar, autumn/blizzard early
    ("tokens-base",      [(95,  166)]),  # :root vars, .splash-transparent, transition group
    ("global",           [(167, 208)]),  # *, body, html, body::before
    ("typography",       [(209, 235)]),  # gradient-text, h1-h6
    ("glass",            [(236, 249)]),  # glass-panel-dark
    # --- utilities ----------------------------------------------------------
    ("utilities",        [(250, 569)]),  # u-* classes, modal-dialog embedded, scroll-top-btn
    # --- component primitives -----------------------------------------------
    ("component-classes",[(570, 825)]),  # icon-btn-circle, management-menu, monster-card
    ("tabs-early",       [(826, 957)]),  # tab-nav (first), tab-btn (first, with nested bug)
    ("section-parts",    [(958, 1058)]), # section-header-compact, language-item (early), attr-box-compact
    ("equipment",        [(1059,1206)]), # equipment-card/slot, lore, legendmarks, dice-result, management-menu summary
    # --- site header --------------------------------------------------------
    ("header",           [(1207,1409)]), # global-header, social bar, theme-switcher, logo, nav-btn, custom-select
    # --- layout & page structure -------------------------------------------
    ("layout",           [(1410,1438)]), # content-wrapper, page-section, fadeIn
    # --- tour ---------------------------------------------------------------
    ("tour",             [(1439,1603)]), # creation tour, tour-option-btn, tour-check-label, tour animations
    # --- buttons ------------------------------------------------------------
    ("buttons",          [(1604,1689)]), # primary-btn, secondary-btn, metallic-shimmer
    # --- hero ---------------------------------------------------------------
    ("hero",             [(1690,1785)]), # hero section
    # --- cards & content panels --------------------------------------------
    ("cards",            [(1786,2098)]), # announcement-bar, badge, ethos-card, newsletter, feature-*
    # --- orbs & HUD ---------------------------------------------------------
    ("orbs-hud",         [(2099,3339)]), # orb styles, hud, floating-vitality-orbs, top-mobile-hud,
                                         # stat-points-tooltip, tooltip, hud-avatar, combat-mode
    # --- updates timeline ---------------------------------------------------
    ("updates",          [(3340,3426)]), # updates-timeline, update-card, details/summary, changelog
    # --- responsive grid + global media ------------------------------------
    ("responsive",       [(3427,3781)]), # all @media blocks through 600px
    # --- combat panels ------------------------------------------------------
    ("combat",           [(3782,3898)]), # combat-actions-grid, restoration-panel, conditions-panel, age-card
    # --- tabs (full defs) ---------------------------------------------------
    ("tabs",             [(3899,4021)]), # tab-nav (full), tab-btn (full), tab-content, tab-pane
    # --- character components -----------------------------------------------
    ("char-components",  [(4022,4171)]), # circle-checkbox, languages (full), icon-toggle, clickable-input
    # --- dice roller --------------------------------------------------------
    ("dice-roller",      [(4172,4521)]), # combat-utilities-wrapper, floating-widget, toggle-dice-btn, dice-controls
    # --- aesthetics ---------------------------------------------------------
    ("aesthetic",        [(4522,4682)]), # gothic-header, survivor-quote, watermark-icon, lock-watermark,
                                         # newsletter-section second def, mega-card second def, shake, sim-roll-val
    # --- dice buttons -------------------------------------------------------
    ("dice-buttons",     [(4683,4765)]), # mod-btn, dice-btn, adv-btn, dis-btn
    # --- conditions ---------------------------------------------------------
    ("conditions",       [(4766,4960)]), # conditions container/grid/item, exhaustion, sleep-shade, rest-toast, section-toggles
    # --- footer & contact ---------------------------------------------------
    ("footer",           [(4961,5291)]), # site-footer, privacy, contact, discord-link, footer-bottom
    # --- splash screen ------------------------------------------------------
    ("splash",           [(5292,5412)]), # char-splash-overlay, fadeInScale, splash-fade-out, mega-card refinements
    # --- premium interactive & modal overlay --------------------------------
    ("premium-modal",    [(5413,5613)]), # tour-overlay, combat-log scrollbar, premium-interactive, expandable-card,
                                         # modal-overlay, gallery-character-btn, stat-btn-hidden
    # --- test page ----------------------------------------------------------
    ("test-page",        [(5614,5858)]), # body.on-test-page everything, tour-active orbs hide
    # --- orbs layout (bottom HUD defs) -------------------------------------
    ("orbs-layout",      [(5859,6059)]), # floating-vitality-orbs second full def, orbs-layout, orb-group, orb-container,
                                         # orb-frame-overlay, orb-value-overlay, orb-touch-zone
    # --- bulk adjustment modal ---------------------------------------------
    ("bulk-adjustment",  [(6060,6166)]), # bulk-adjustment-modal, bulk-btn, bulk-input, hide-HUDs-tour
    # --- actions & stat allocation -----------------------------------------
    ("actions-stat-alloc",[(6167,6470)]),# test-sheet animations, actions-panel, action-item, glass-btn-circle,
                                          # action-rolling, stat-overlay-btn, stat-confirm-bar, stat-notification,
                                          # lore legendmarks focus
]

# ---------------------------------------------------------------------------
# Validate: every line covered exactly once
# ---------------------------------------------------------------------------
covered = [False] * total
for (name, ranges) in COMPONENTS:
    for (s, e) in ranges:
        for i in range(s - 1, e):   # convert to 0-based
            if i >= total:
                print(f"WARNING: {name} references line {i+1} which exceeds file length {total}")
                continue
            if covered[i]:
                print(f"OVERLAP at line {i+1} in component '{name}'")
            covered[i] = True

uncovered = [i+1 for i, c in enumerate(covered) if not c]
if uncovered:
    print(f"UNCOVERED LINES ({len(uncovered)}): {uncovered[:20]}{'...' if len(uncovered)>20 else ''}")
else:
    print("Coverage check PASSED — all lines covered exactly once.")

# ---------------------------------------------------------------------------
# Write component files
# ---------------------------------------------------------------------------
import_lines = []
for (name, ranges) in COMPONENTS:
    filepath = os.path.join(COMP_DIR, f"{name}.css")
    chunks = []
    for (s, e) in ranges:
        chunk = lines[s-1:e]   # 0-based slice
        chunks.append("".join(chunk))
    content = "\n".join(chunks)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    import_lines.append(f'@import "components/{name}.css";')
    print(f"  WROTE {name}.css ({sum(e-s+1 for s,e in ranges)} lines)")

# ---------------------------------------------------------------------------
# Rewrite base.css as @import manifest
# ---------------------------------------------------------------------------
manifest = (
    "/* base.css — CSS Module Manifest\n"
    " * Auto-generated by modularize_css.py\n"
    " * Cascade order preserved from original base.css\n"
    " * DO NOT edit this file; edit the component files directly.\n"
    " */\n\n"
    + "\n".join(import_lines)
    + "\n"
)
with open(BASE_CSS, "w", encoding="utf-8") as f:
    f.write(manifest)
print(f"\nREWROTE base.css as @import manifest ({len(import_lines)} imports)")
print("DONE.")
