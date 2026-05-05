import { DeochUtils } from './DeochUtils.js';
import { DataManager } from './DataManager.js';

/**
 * @module InterfaceManager
 * @description Central authority for UI state: Navigation, HUD, Themes, and Custom Selects.
 */
export const InterfaceManager = {
    splashTimeout: null,
    initialized: false,
    wasLongPress: false,

    init(sheet, signal) {
        if (this.initialized) return;
        this.signal = signal;

        this.initNavigation();
        this.initHUD();
        this.initBulkModal();
        this.initManagementEvents();
        this.renderConditions();
        this.initGlobalListeners();
        this.initialized = true;
    },

    renderConditions() {
        const container = document.getElementById('test-conditions-grid');
        if (!container || !window.MechanicsManager) return;

        const conditions = window.MechanicsManager.CONDITIONS;
        container.innerHTML = conditions.map(c => `
            <label class="condition-item" for="${c.id}" title="${c.name}">
                <input type="checkbox" id="${c.id}" name="${c.key}">
                <span class="circle-toggle"></span> ${c.name}
            </label>
        `).join('');
    },

    // --- Navigation & Routing ---

    initNavigation() {
        window.addEventListener('hashchange', () => this.handleHashChange(), { signal: this.signal });

        const splash = document.getElementById('char-sheet-splash');
        if (splash) {
            splash.addEventListener('click', () => this.transitionSplash(), { signal: this.signal });
        }

        if (window.location.hash) {
            this.handleHashChange();
        } else {
            this.updateSplashWelcome();
        }
    },

    handleHashChange() {
        let target = window.location.hash.substring(1) || 'home';
        this.navigateTo(target);
    },

    navigateTo(targetId) {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.page-section');
        const btn = Array.from(navButtons).find(b => b.getAttribute('data-target') === targetId);

        navButtons.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        if (btn) btn.classList.add('active');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        document.body.classList.toggle('on-test-page', targetId === 'test-page');

        if (targetId === 'test-page') {
            if (typeof window.ensureTestPageInitialized === 'function') window.ensureTestPageInitialized();
            this.handleTestPageEntry();
        } else {
            document.body.classList.remove('tour-active');
            const splash = document.getElementById('char-sheet-splash');
            if (splash) splash.style.display = 'none';
            this.clearSplashTransparency();
        }

        const tour = document.getElementById('creation-tour');
        if (targetId !== 'test-page' && tour) tour.style.display = 'none';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        DeochUtils.queueIconRefresh();
    },

    handleTestPageEntry() {
        document.body.classList.add('tour-active');
        const splash = document.getElementById('char-sheet-splash');
        if (splash) {
            splash.style.display = 'flex';
            splash.classList.remove('splash-fade-out');
            this.updateSplashWelcome();

            const sheetView = document.getElementById('mobile-sheet-view');
            if (sheetView) {
                sheetView.style.display = 'none';
                sheetView.style.opacity = '0';
            }

            this.applySplashTransparency();
            if (this.splashTimeout) clearTimeout(this.splashTimeout);
            this.splashTimeout = setTimeout(() => this.transitionSplash(), 5000);
        }
    },

    updateSplashWelcome() {
        const welcomeMsg = document.getElementById('splash-welcome-msg');
        if (!welcomeMsg) return;

        const testGallery = DataManager.getJson(DataManager.KEYS.CHARACTERS, []);
        let name = null;
        if (testGallery.length > 0) {
            const lastId = DataManager.get(DataManager.KEYS.LAST_CHAR_ID);
            const char = testGallery.find(c => c.id === lastId) || testGallery[0];
            if (char?.name && !['Unknown Hero', 'Unknown Legend'].includes(char.name)) {
                name = char.name;
            }
        }

        if (name) {
            welcomeMsg.textContent = `Welcome back, ${name}`;
            welcomeMsg.style.display = 'block';
        } else {
            welcomeMsg.style.display = 'none';
        }
    },

    transitionSplash() {
        const splashEl = document.getElementById('char-sheet-splash');
        const mainContentEl = document.getElementById('mobile-sheet-view');

        if (!splashEl || splashEl.style.display === 'none' || splashEl.classList.contains('splash-fade-out')) return;

        if (this.splashTimeout) clearTimeout(this.splashTimeout);
        splashEl.classList.add('splash-fade-out');

        setTimeout(() => {
            splashEl.style.display = 'none';
            const hasChar = DataManager.getJson(DataManager.KEYS.CHARACTERS, []).length > 0;

            if (!hasChar) {
                if (window.DataManager) window.DataManager.newCharacter();
            } else if (mainContentEl) {
                document.body.classList.remove('tour-active');
                document.body.classList.add('char-sheet-active', 'on-test-page');
                this.clearSplashTransparency();
                mainContentEl.style.display = 'flex';
                setTimeout(() => { mainContentEl.style.opacity = '1'; }, 50);
                if (window.MechanicsManager) window.MechanicsManager.updateLevelFromExp();
            }
        }, 600);
    },

    toggleSplashTransparency(isActive) {
        const els = ['.global-header', '.site-footer', '#toggle-dice-btn', '.floating-vitality-orbs', '#top-mobile-hud', '.combat-utilities-wrapper'];
        els.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.classList.toggle('splash-transparent', isActive);
        });
    },

    applySplashTransparency() { this.toggleSplashTransparency(true); },
    clearSplashTransparency() { this.toggleSplashTransparency(false); },

    // --- HUD & Mobile Interaction ---

    initHUD() {
        const hud = document.getElementById('top-mobile-hud');
        if (!hud) return;

        hud.addEventListener('click', (e) => {
            const forbidden = ['button', 'input', 'summary', 'select', '.inspiration-toggle', '.hud-avatar', 'svg'];
            if (forbidden.some(sel => e.target.closest(sel))) return;
            if (e.target.closest('.top-hud-expanded-content') || e.target.closest('.stats-header-summary')) return;
            this.toggleHUD();
        }, { signal: this.signal });

        const expandBtn = hud.querySelector('.hud-menu-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleHUD();
            }, { signal: this.signal });
        }

        this.initHUDEXP();
        this.initHUDAvatar();
        this.initHUDLongPress();
        this.initThemeSwitcher();
    },

    initThemeSwitcher() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            }, { signal: this.signal });
        }
    },

    toggleHUD(force) {
        const hud = document.getElementById('top-mobile-hud');
        if (!hud) return;

        const isExpanded = force !== undefined ? !!force : !hud.classList.contains('expanded');
        hud.classList.toggle('expanded', isExpanded);
        document.body.classList.toggle('hud-expanded', isExpanded);

        const icon = document.getElementById('hud-expand-icon');
        if (icon) icon.style.transform = isExpanded ? 'rotate(180deg)' : 'rotate(0deg)';

        if (!isExpanded) hud.querySelectorAll('details').forEach(d => d.open = false);

        if (window.StatsManager) window.StatsManager.updateStatIndicators();
        DeochUtils.queueIconRefresh();
    },

    initHUDEXP() {
        const expBox = document.getElementById('test-hud-exp-box-wrapper');
        if (expBox) {
            expBox.addEventListener('click', (e) => {
                e.stopPropagation();
                const details = expBox.closest('details');
                if (details && !details.open) {
                    setTimeout(() => document.getElementById('test-add-exp-input')?.focus(), 100);
                }
            }, { signal: this.signal });
        }

        const expInput = document.getElementById('test-exp-input');
        if (expInput) {
            const sync = () => { if (window.MechanicsManager) window.MechanicsManager.updateLevelFromExp(); };
            expInput.addEventListener('input', sync, { signal: this.signal });
            expInput.addEventListener('change', sync, { signal: this.signal });
        }

        const plus = document.getElementById('test-exp-plus');
        const minus = document.getElementById('test-exp-minus');
        if (plus) plus.addEventListener('click', (e) => this.handleExpStep(e, 1), { signal: this.signal });
        if (minus) minus.addEventListener('click', (e) => this.handleExpStep(e, -1), { signal: this.signal });
    },

    handleExpStep(e, delta) {
        e.stopPropagation();
        const expInput = document.getElementById('test-exp-input');
        if (!expInput) return;
        const current = parseInt(expInput.textContent || expInput.value) || 0;
        const newVal = Math.max(0, current + delta);
        if (expInput.tagName === 'SPAN') expInput.textContent = newVal;
        else expInput.value = newVal;
        if (window.MechanicsManager) window.MechanicsManager.updateLevelFromExp();
    },

    initHUDAvatar() {
        const container = document.getElementById('test-hud-avatar');
        const upload = document.getElementById('test-avatar-upload');
        if (container && upload) {
            container.addEventListener('click', (e) => { e.stopPropagation(); upload.click(); }, { signal: this.signal });
            upload.addEventListener('change', (e) => this.handleAvatarUpload(e), { signal: this.signal });
        }
    },

    handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            this.updateAvatarDisplay(event.target.result);
            if (window.DataManager) window.DataManager.saveCharacter();
        };
        reader.readAsDataURL(file);
    },

    updateAvatarDisplay(dataUrl) {
        const img = document.getElementById('test-hud-avatar-img');
        const icon = document.getElementById('test-hud-avatar-icon');
        if (img && icon) {
            if (dataUrl) {
                img.src = dataUrl;
                img.style.display = 'block';
                icon.style.display = 'none';
            } else {
                img.src = '';
                img.style.display = 'none';
                icon.style.display = 'block';
            }
        }
    },

    updateHUDLevelDisplay(exp) {
        if (!window.MechanicsManager) return;

        const info = window.MechanicsManager.getLevelDisplayInfo(exp);

        DeochUtils.setText('test-hud-exp-display', `EXP: ${exp}`);
        DeochUtils.setText('test-exp-value-display', exp);
        DeochUtils.setText('test-hud-level', info.isMulticlass ? info.totalLevel : info.displayLevel);
        DeochUtils.setText('test-hud-level-text', `Level ${info.primaryLevel}`);
        DeochUtils.setText('test-mobile-level', info.levelText);

        const secLine = document.getElementById('test-hud-secondary-line');
        if (secLine) {
            secLine.style.display = info.isMulticlass ? 'flex' : 'none';
            if (info.isMulticlass) {
                DeochUtils.setText('test-hud-secondary-level-text', `Level ${info.secondaryLevel}`);
            }
        }

        const masteryActions = document.getElementById('test-hud-mastery-actions');
        if (masteryActions) masteryActions.style.display = info.isMaxLevel ? 'flex' : 'none';

        const nextText = document.getElementById('test-hud-next-level-text');
        if (nextText) {
            nextText.textContent = info.expNeeded ? `${info.expNeeded} Experience Needed` : 'Max Level Reached';
        }
    },

    updateEXPRing(exp, totalLevel) {
        const fill = document.getElementById('test-hud-exp-ring-fill');
        const dot = document.getElementById('test-hud-exp-dot');
        if (!fill || !window.MechanicsManager) return;

        const info = window.MechanicsManager.getLevelDisplayInfo(exp);
        const progress = info.progress;
        const isMaster = info.isMaxLevel;

        const gradient = isMaster ? 'url(#exp-mastery-gradient)' : 'url(#exp-fill-gradient)';
        fill.setAttribute('stroke', gradient);
        fill.style.stroke = gradient;

        const circ = 2 * Math.PI * 17.2;
        fill.setAttribute('stroke-dasharray', `${progress * circ}, ${circ}`);

        if (dot) {
            const angle = (progress * 2 * Math.PI) - (Math.PI / 2);
            dot.setAttribute('cx', 18 + 17.2 * Math.cos(angle));
            dot.setAttribute('cy', 18 + 17.2 * Math.sin(angle));
            dot.style.opacity = (progress > 0 && !isMaster) ? 1 : 0;
        }
    },

    // --- Global Interaction Router ---

    initGlobalListeners() {
        document.addEventListener('click', (e) => this.handleGlobalClick(e), { signal: this.signal });
    },

    handleGlobalClick(e) {
        const target = e.target;

        // 1. Navigation Targets
        const nav = target.closest('[data-nav]');
        if (nav) {
            e.preventDefault();
            this.navigateTo(nav.getAttribute('data-nav'));
            return;
        }

        // 2. Action Targets
        const action = target.closest('[data-action]');
        if (action) {
            this.handleDataAction(action.getAttribute('data-action'), e, action);
            return;
        }

        // 3. Tab Buttons
        const tab = target.closest('.test-tab-btn');
        if (tab) {
            this.handleTabSwitch(tab);
            return;
        }

        // 4. ID-based Actions (Buttons/Summaries)
        const idBtn = target.closest('button[id], summary[id]');
        if (idBtn) {
            this.handleIdAction(idBtn.id, e, idBtn);
        }
    },

    handleDataAction(action, e, target) {
        switch (action) {
            case 'scroll-top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
            case 'close-celebration': if (window.MechanicsManager) window.MechanicsManager.closeCelebration(); break;
            case 'update-max-stat': if (window.VitalsManager) window.VitalsManager.updateMaxStat(target.getAttribute('data-stat')); break;
        }
    },

    handleIdAction(id, e, btn) {
        const actions = {
            'test-save-btn': () => { if (window.DataManager) window.DataManager.saveCharacter(); },
            'test-new-btn': () => { if (window.DataManager) window.DataManager.newCharacter(); },
            'test-export-btn': () => { if (window.DataManager) window.DataManager.exportCharacter(); },
            'test-delete-btn': () => { if (window.DataManager) window.DataManager.deleteCharacter(); },
            'test-theme-btn': () => this.cycleTheme(),
            'test-hud-spend-exp-btn': () => { e.stopPropagation(); if (window.MechanicsManager) window.MechanicsManager.triggerMasteryCelebration(); },
            'test-confirm-stats': () => { e.stopPropagation(); if (window.StatsManager) window.StatsManager.confirmStatAllocation(); },
            'test-deny-stats': () => { e.stopPropagation(); if (window.StatsManager) window.StatsManager.denyStatAllocation(); },
            'test-gallery-btn': () => document.getElementById('character-gallery-dialog')?.showModal(),
            'test-import-btn-popup': () => {
                const modal = document.getElementById('test-import-export-modal');
                if (modal && typeof modal.showModal === 'function') {
                    modal.showModal();
                    const menu = document.querySelector('.management-menu');
                    if (menu) menu.open = false;
                }
            },
            'test-import-btn': () => { if (window.DataManager) window.DataManager.importFromTextarea(); },
            'test-copy-btn': () => { if (window.DataManager) window.DataManager.copyCharacterCode(); },
            'test-file-import-btn': () => document.getElementById('test-import-input')?.click()
        };
        if (actions[id]) {
            if (btn.tagName === 'BUTTON') e.preventDefault();
            actions[id]();
        }
    },

    handleTabSwitch(btn) {
        const target = btn.dataset.tab;
        const container = btn.closest('#test-tabs-card') || document.body;
        container.querySelectorAll('.test-tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.test-tab-pane').forEach(p => p.style.display = 'none');
        btn.classList.add('active');
        const pane = document.getElementById(target);
        if (pane) pane.style.display = 'block';
        DeochUtils.queueIconRefresh();
    },

    cycleTheme() {
        const themes = ['amethyst', 'crimson', 'emerald', 'abyssal', 'sapphire', 'inferno', 'voidwalker', 'royal-gold', 'rose-quartz', 'necrotic', 'frostbite', 'toxic', 'sandstorm', 'phantom', 'glitch', 'autumn', 'blizzard', 'sanguine', 'alchemist'];
        const current = document.documentElement.getAttribute('data-theme') || 'sandstorm';
        let idx = (themes.indexOf(current) + 1) % themes.length;
        this.applyTheme(themes[idx]);
    },

    initManagementEvents() {
        const settingsBtn = document.getElementById('test-settings-btn');
        const managementMenu = settingsBtn?.closest('.management-menu');
        const importExportModal = document.getElementById('test-import-export-modal');
        const importExportCloseBtn = document.getElementById('test-import-export-close');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsBtn.classList.remove('btn-clicked-spin');
                void settingsBtn.offsetWidth;
                settingsBtn.classList.add('btn-clicked-spin');
                if (window.navigator?.vibrate) window.navigator.vibrate(5);
            }, { signal: this.signal });

            document.addEventListener('click', (e) => {
                if (managementMenu && managementMenu.open) {
                    if (!managementMenu.contains(e.target)) {
                        managementMenu.open = false;
                    }
                }
            }, { signal: this.signal });
        }

        if (importExportCloseBtn && importExportModal) {
            importExportCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                importExportModal.close();
            }, { signal: this.signal });
        }
    },

    applyTheme(theme) {
        if (window.applyThemeVisuals) {
            window.applyThemeVisuals(theme);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        if (window.DataManager) {
            window.DataManager.set(window.DataManager.KEYS.THEME, theme);
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.value = theme;
    },

    // --- Custom Select Utility (from custom-select.js) ---

    initCustomSelect(wrapperId, triggerId, optionsId, selectedTextId, hiddenInputId, onSelect) {
        const wrapper = document.getElementById(wrapperId);
        const trigger = document.getElementById(triggerId);
        const options = document.getElementById(optionsId);
        if (!trigger || !wrapper) return;

        trigger.onclick = (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.toggle('open');
            this.updateSelectParentState(wrapper, isOpen);
        };

        options?.querySelectorAll('.custom-option').forEach(opt => {
            opt.onclick = () => {
                const val = opt.getAttribute('data-value');
                const txt = document.getElementById(selectedTextId);
                if (txt) txt.textContent = opt.textContent;
                const input = document.getElementById(hiddenInputId);
                if (input) {
                    input.value = val;
                    if (onSelect) onSelect(val);
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
                wrapper.classList.remove('open');
                this.updateSelectParentState(wrapper, false);
            };
        });
    },

    updateSelectParentState(wrapper, isOpen) {
        const card = wrapper.closest('.stats-card, .tabs-card');
        if (card) card.classList.toggle('has-open-select', isOpen);
    },

    // --- Long Press Utility ---

    initHUDLongPress() {
        const selectors = ['.hp-group .orb-touch-zone', '.mp-group .orb-touch-zone', '.sp-group .orb-touch-zone'];
        document.querySelectorAll(selectors.join(',')).forEach(el => {
            let timer;
            const start = (e) => {
                const stat = el.closest('.hp-group') ? 'hp' : el.closest('.mp-group') ? 'mana' : 'stamina';
                this.wasLongPress = false;
                timer = setTimeout(() => {
                    this.wasLongPress = true;
                    if (stat === 'stamina') {
                        window.mobileTargetSp = window.mobileMaxSp;
                        if (window.VitalsManager) window.VitalsManager.adjust('stamina', 0);
                    } else {
                        this.showBulkModal(stat);
                    }
                    if (navigator.vibrate) navigator.vibrate(50);
                }, 600);
            };
            const end = () => clearTimeout(timer);
            el.addEventListener('pointerdown', start, { signal: this.signal });
            el.addEventListener('pointerup', end, { signal: this.signal });
            el.addEventListener('pointerleave', end, { signal: this.signal });
        });
    },

    initBulkModal() {
        const modal = document.getElementById('bulk-adjustment-modal');
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideBulkModal();
        }, { signal: this.signal });

        const addBtn = modal.querySelector('#bulk-add-btn');
        const subBtn = modal.querySelector('#bulk-sub-btn');
        const tempBtn = modal.querySelector('#bulk-temp-btn');
        const input = modal.querySelector('#bulk-custom-val');

        if (addBtn) addBtn.onclick = (e) => { e.stopPropagation(); this.applyBulkAdjustment(1); };
        if (subBtn) subBtn.onclick = (e) => { e.stopPropagation(); this.applyBulkAdjustment(-1); };
        if (tempBtn) {
            tempBtn.onclick = (e) => {
                e.stopPropagation();
                const val = Math.abs(parseInt(input.value)) || 0;
                if (val !== 0 && window.VitalsManager) {
                    window.VitalsManager.adjust('temp-hp', val);
                    if (window.DataManager) window.DataManager.saveCharacter();
                }
                this.hideBulkModal();
            };
        }

        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter') this.applyBulkAdjustment(-1);
            };
        }
    },

    showBulkModal(stat) {
        this.currentBulkStat = stat;
        const modal = document.getElementById('bulk-adjustment-modal');
        if (!modal) return;

        const title = modal.querySelector('#bulk-title');
        const content = modal.querySelector('.bulk-adjustment-content');
        const tempBtn = modal.querySelector('#bulk-temp-btn');
        const input = modal.querySelector('#bulk-custom-val');

        if (title) {
            let label = 'ADJUST HEALTH';
            let color = '#ef4444';
            if (stat === 'mana') { label = 'ADJUST MANA'; color = '#3b82f6'; }
            if (stat === 'stamina') { label = 'ADJUST STAMINA'; color = '#fbbf24'; }
            title.textContent = label;
            title.style.color = color;
        }

        if (content) {
            let borderColor = '#ef4444';
            if (stat === 'mana') borderColor = '#3b82f6';
            if (stat === 'stamina') borderColor = '#fbbf24';
            content.style.borderColor = borderColor;
        }

        if (tempBtn) tempBtn.style.display = (stat === 'hp') ? 'flex' : 'none';
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }

        modal.classList.add('active');
    },

    hideBulkModal() {
        const modal = document.getElementById('bulk-adjustment-modal');
        if (modal) modal.classList.remove('active');
    },

    applyBulkAdjustment(multiplier) {
        const input = document.getElementById('bulk-custom-val');
        const val = Math.abs(parseInt(input?.value)) || 0;
        if (val !== 0 && window.VitalsManager) {
            window.VitalsManager.adjust(this.currentBulkStat, val * multiplier);
            if (window.DataManager) window.DataManager.saveCharacter();
        }
        this.hideBulkModal();
    },

    showClassSelection(isSecondary = false) {
        // Class selection UI logic
    },

    cleanup() {
        console.log('InterfaceManager: Cleanup called');
    }
};
