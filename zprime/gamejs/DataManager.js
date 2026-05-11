import { DeochUtils } from './DeochUtils.js';

/**
 * @module DataManager
 * @description Handles character persistence, saving, loading, and import/export.
 * Centralized manager for all storage interactions and gallery UI within the DEOCH system.
 */
export const DataManager = {
    activeCharId: null,
    isInitializing: false,

    /**
     * Centralized storage keys to avoid fracturing and hardcoding.
     */
    KEYS: {
        CHARACTERS: 'deoch-test-sheet-v2',
        CHARACTER_SHEET: 'deoch_character_sheet_data',
        LAST_CHAR_ID: 'test-sheet-last-id',
        THEME: 'deoch-theme-preference',
        STAT_POPUP_DISMISSED: 'deoch_has_interacted_with_stat_popup',
        LEGACY_DATA: 'deoch_character_data',
        LEGACY_GALLERY: 'deoch_character_gallery'
    },

    init(sheet, signal) {
        this.signal = signal;
        this.initLegacyForm();
        this.migrateLegacyData();
        this.renderGallery();
    },

    getCharacters() {
        return this.getJson(this.KEYS.CHARACTERS, []);
    },

    generateId() {
        return 'char_' + Date.now();
    },

    loadLastCharacter() {
        const gallery = this.getCharacters();
        if (gallery.length > 0) {
            const lastId = this.get(this.KEYS.LAST_CHAR_ID);
            const charToLoad = gallery.find(c => c.id === lastId) || gallery[0];
            this.loadCharacter(charToLoad.id);
        }
    },

    // --- Storage Delegation ---
    // --- Storage Access ---
    get: DeochUtils.Storage.get,
    set: DeochUtils.Storage.set,
    getJson: DeochUtils.Storage.getJson,
    setJson: DeochUtils.Storage.setJson,
    remove: DeochUtils.Storage.remove,
    clear: DeochUtils.Storage.clear,

    // --- High-Level Character Persistence ---
    saveCharacter() {
        if (window.SUSPEND_SAVING) return;
        if (!this.activeCharId && !confirm('No active character. Create new?')) return;

        const charData = this.gatherCurrentData();
        const gallery = this.getCharacters();
        const index = gallery.findIndex(c => c.id === charData.id);

        if (index !== -1) {
            gallery[index] = charData;
        } else {
            gallery.push(charData);
        }

        this.setJson(this.KEYS.CHARACTERS, gallery);
        this.set(this.KEYS.LAST_CHAR_ID, charData.id);
        this.activeCharId = charData.id;

        DeochUtils.showFeedback('test-save-btn', 'Saved!');

        this.renderGallery();
    },

    gatherCurrentData() {
        const getFlag = (id) => document.getElementById(id)?.value === 'true';
        const getHudText = (id, fallback) => document.getElementById(id)?.textContent || fallback;

        return {
            id: this.activeCharId || this.generateId(),
            name: getHudText('test-hud-name', 'Unknown Hero'),
            rank: getHudText('test-hud-detail-rank', 'Rank 1'),
            race: getHudText('test-hud-detail-race', 'Human'),
            age: getHudText('test-hud-detail-age', '20'),
            speed: getHudText('test-hud-detail-speed', '30ft'),
            size: getHudText('test-hud-detail-size', 'Medium'),
            level: getHudText('test-hud-level', '1'),
            exp: document.getElementById('test-exp-input')?.textContent || document.getElementById('test-exp-input')?.value || '20',
            theme: document.documentElement.getAttribute('data-theme') || 'sandstorm',
            avatar: (() => {
                const img = document.getElementById('test-hud-avatar-img');
                return (img && img.style.display !== 'none') ? img.src : null;
            })(),
            stats: window.ProgressionManager ? window.ProgressionManager.getStats() : {},
            maxHp: parseInt(document.getElementById('hud-max-hp-input')?.value) || 28,
            currentHp: window.mobileTargetHp !== undefined ? window.mobileTargetHp : (parseInt(document.getElementById('hud-max-hp-input')?.value) || 28),
            tempHp: window.mobileTargetTempHp || 0,
            maxMp: parseInt(document.getElementById('hud-max-mp-input')?.value) || 12,
            currentMp: window.mobileTargetMp !== undefined ? window.mobileTargetMp : (parseInt(document.getElementById('hud-max-mp-input')?.value) || 12),
            maxSp: parseInt(document.getElementById('mobile-max-sp-input')?.value) || 10,
            currentSp: window.mobileTargetSp !== undefined ? window.mobileTargetSp : (parseInt(document.getElementById('mobile-max-sp-input')?.value) || 10),
            primaryClass: document.getElementById('test-hud-class-text')?.dataset.primaryClass || getHudText('test-hud-class-text', 'Human'),
            secondaryClass: document.getElementById('test-hud-secondary-class-visible')?.dataset.secondaryClass || getHudText('test-hud-secondary-class-visible', ''),
            classChoiceMade: getFlag('test-class-choice-made'),
            isMulticlass: getFlag('test-is-multiclass'),
            multiclassChoiceMade: getFlag('test-multiclass-choice-made'),
            multiclassOptOut: getFlag('test-multiclass-opt-out'),
            masteryCelebrated: getFlag('test-mastery-celebrated'),
            availableStatPoints: window.ProgressionManager?.availableStatPoints || 0,
            lastSaved: new Date().toISOString()
        };
    },

    _applyVitals(char) {
        window.mobileMaxHp = char.maxHp || 28;
        window.mobileMaxMp = char.maxMp || 12;
        window.mobileMaxSp = char.maxSp || 10;

        window.mobileTargetHp = char.currentHp !== undefined ? char.currentHp : window.mobileMaxHp;
        window.mobileDisplayHp = window.mobileTargetHp;
        window.mobileTargetTempHp = char.tempHp || 0;
        window.mobileDisplayTempHp = window.mobileTargetTempHp;
        window.mobileTargetMp = char.currentMp !== undefined ? char.currentMp : window.mobileMaxMp;
        window.mobileDisplayMp = window.mobileTargetMp;
        window.mobileTargetSp = char.currentSp !== undefined ? char.currentSp : window.mobileMaxSp;
        window.mobileDisplaySp = window.mobileTargetSp;

        const hpInput = DeochUtils.getElement('hud-max-hp-input');
        if (hpInput) hpInput.value = window.mobileMaxHp;
        const mpInput = DeochUtils.getElement('hud-max-mp-input');
        if (mpInput) mpInput.value = window.mobileMaxMp;
        const spInput = DeochUtils.getElement('mobile-max-sp-input');
        if (spInput) spInput.value = window.mobileMaxSp;
    },

    _applyClassInfo(char) {
        const classText = document.getElementById('test-hud-class-text');
        if (classText) {
            const pClass = char.primaryClass || 'Human';
            classText.textContent = pClass;
            classText.dataset.primaryClass = pClass;
            const classInput = document.getElementById('char-class');
            if (classInput) classInput.value = pClass;
        }
        if (char.secondaryClass) {
            const secClass = document.getElementById('test-hud-secondary-class-visible');
            if (secClass) {
                secClass.textContent = char.secondaryClass;
                secClass.dataset.secondaryClass = char.secondaryClass;
            }
            const secInput = document.getElementById('char-class-2');
            if (secInput) secInput.value = char.secondaryClass;
        }
    },

    loadCharacter(id) {
        const gallery = this.getCharacters();
        const char = gallery.find(c => c.id === id);
        if (!char) return;

        this.isInitializing = true;
        this.activeCharId = char.id;

        // Apply basic info
        DeochUtils.setText('test-hud-name', char.name);
        DeochUtils.setText('test-hud-detail-rank', char.rank || 'Rank 1');
        DeochUtils.setText('test-hud-detail-race', char.race || 'Human');
        DeochUtils.setText('test-hud-detail-age', char.age || '20');
        DeochUtils.setText('test-hud-detail-speed', char.speed || '30ft');
        DeochUtils.setText('test-hud-detail-size', char.size || 'Medium');

        // Apply stats
        if (char.stats && window.ProgressionManager) {
            window.ProgressionManager.applyStats(char.stats);
        }

        // Apply vitals
        this._applyVitals(char);

        // Apply toggles
        if (char.inspiration !== undefined) {
            const insp = document.getElementById('test-hud-inspiration');
            if (insp) insp.checked = char.inspiration;
        }
        // Apply flags using unified utility
        ['test-class-choice-made', 'test-is-multiclass', 'test-multiclass-choice-made', 'test-multiclass-opt-out', 'test-mastery-celebrated'].forEach(id => {
            const key = id.replace('test-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            DeochUtils.smartSet(id, char[key]);
        });

        // Apply class info
        this._applyClassInfo(char);

        // Apply EXP
        DeochUtils.smartSet('test-exp-input', char.exp || 20);

        // Sync ProgressionManager tracking level BEFORE triggering UI updates
        // This prevents the "level up" logic from firing during initial load
        if (window.ProgressionManager) {
            const currentExp = parseInt(char.exp) || 20;
            window.ProgressionManager.lastProcessedLevel = window.ProgressionManager.calculateCurrentLevel(currentExp);
            window.ProgressionManager.availableStatPoints = char.availableStatPoints || 0;
        }

        // Apply Theme
        if (char.theme && window.InterfaceManager?.applyTheme) window.InterfaceManager.applyTheme(char.theme);

        this.isInitializing = false;

        // Update UI
        if (window.ProgressionManager) {
            window.ProgressionManager.updateLevelFromExp();
        }
        if (window.ProgressionManager) {
            window.ProgressionManager.updateAttributes();
            window.ProgressionManager.updateAvailablePointsUI();
            window.ProgressionManager.updateStatIndicators();
        }

        console.log('Character loaded:', char.name);
        this.renderGallery();
    },

    newCharacter() {
        const id = this.generateId();
        this.activeCharId = id;
        this.isInitializing = true;

        // Reset DOM and state to defaults BEFORE saving new character
        this.resetSheetToDefaults();

        if (window.ProgressionManager) {
            window.ProgressionManager.availableStatPoints = window.ProgressionManager.getStartingStatPoints();
            window.ProgressionManager.lastProcessedLevel = 0;
        }

        if (window.CreationTour) window.CreationTour.resetTour();



        this.renderGallery();
        this.isInitializing = false;

        if (window.ProgressionManager) {
            window.ProgressionManager.updateAvailablePointsUI();
        }
    },

    resetSheetToDefaults() {
        // Reset basic info
        DeochUtils.setText('test-hud-name', 'Unknown Hero');
        DeochUtils.setText('test-hud-detail-rank', 'Rank 1');
        DeochUtils.setText('test-hud-detail-race', 'Human');
        const startingAge = '20';
        DeochUtils.setText('test-hud-detail-age', startingAge);
        DeochUtils.setText('test-hud-detail-speed', '30ft');
        DeochUtils.setText('test-hud-detail-size', 'Medium');

        // Reset stats to base 9
        if (window.ProgressionManager) {
            window.ProgressionManager.applyStats({
                str: 9, dex: 9, con: 9, int: 9, wis: 9, cha: 9
            });
        }

        // Reset vitals
        window.mobileMaxHp = 28;
        window.mobileMaxMp = 12;
        window.mobileMaxSp = 10;
        window.mobileTargetHp = 28;
        window.mobileDisplayHp = 28;
        window.mobileTargetTempHp = 0;
        window.mobileDisplayTempHp = 0;
        window.mobileTargetMp = 12;
        window.mobileDisplayMp = 12;
        window.mobileTargetSp = 10;
        window.mobileDisplaySp = 10;
        const hpInput = document.getElementById('hud-max-hp-input');
        if (hpInput) hpInput.value = 28;
        const mpInput = document.getElementById('hud-max-mp-input');
        if (mpInput) mpInput.value = 12;
        const spInput = document.getElementById('mobile-max-sp-input');
        if (spInput) spInput.value = 10;

        // Reset flags
        ['test-class-choice-made', 'test-is-multiclass', 'test-multiclass-choice-made', 'test-multiclass-opt-out', 'test-mastery-celebrated'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 'false';
        });

        // Reset classes
        const classText = document.getElementById('test-hud-class-text');
        if (classText) {
            classText.textContent = 'Human';
            classText.dataset.primaryClass = 'Human';
        }
        const secClass = document.getElementById('test-hud-secondary-class-visible');
        if (secClass) {
            secClass.textContent = '';
            secClass.dataset.secondaryClass = '';
        }
        const classInput = document.getElementById('char-class');
        if (classInput) classInput.value = 'Human';
        const classInput2 = document.getElementById('char-class-2');
        if (classInput2) classInput2.value = '';

        // Reset EXP
        DeochUtils.smartSet('test-exp-input', 20);

        // Reset Theme to default
        if (window.InterfaceManager?.applyTheme) window.InterfaceManager.applyTheme('sandstorm');

        // Reset tooltip dismissal state
        document.body.classList.remove('stat-tooltip-dismissed');
        DeochUtils.Storage.remove('deoch_has_interacted_with_stat_popup');

        // Refresh UI dependencies
        if (window.ProgressionManager) {
            window.ProgressionManager.updateAttributes();
            window.ProgressionManager.updateStatIndicators();
        }
        if (window.ProgressionManager) {
            window.ProgressionManager.updateLevelFromExp();
        }
    },

    deleteCharacter() {
        if (!this.activeCharId) return;
        if (!confirm('Are you sure you want to delete this character?')) return;

        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
        const filtered = gallery.filter(c => c.id !== this.activeCharId);
        this.setJson(this.KEYS.CHARACTERS, filtered);

        if (filtered.length > 0) {
            this.loadCharacter(filtered[0].id);
        } else {
            this.newCharacter();
        }
        this.renderGallery();
    },

    exportCharacter() {
        const charData = this.gatherCurrentData();
        const code = JSON.stringify(charData);
        DeochUtils.smartSet('test-transfer-textarea', code);
        DeochUtils.showFeedback('test-export-btn', 'READY TO COPY', 'check');
    },

    importCharacter(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const charData = JSON.parse(e.target.result);
                this.loadCharacterFromData(charData);
            } catch (_err) {
                console.error('DataManager: Import failed', _err);
                alert('Import failed. Invalid JSON format.');
            }
        };
        reader.readAsText(file);
    },

    loadCharacterFromData(charData) {
        charData.id = 'char_' + Date.now();
        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
        gallery.push(charData);
        this.setJson(this.KEYS.CHARACTERS, gallery);

        this.loadCharacter(charData.id);
        this.renderGallery();

        const dialog = document.getElementById('import-export-dialog');
        if (dialog) dialog.close();
    },

    // --- Migration Logic ---
    migrateLegacyData() {
        const legacyData = this.get(this.KEYS.LEGACY_DATA);
        const newData = this.get(this.KEYS.CHARACTERS);

        if (legacyData && (!newData || this.getJson(this.KEYS.CHARACTERS, []).length === 0)) {
            try {
                const parsedLegacy = JSON.parse(legacyData);
                const migrated = [{
                    ...parsedLegacy,
                    id: parsedLegacy.id || 'legacy-' + Date.now(),
                    lastSaved: new Date().toISOString()
                }];
                this.setJson(this.KEYS.CHARACTERS, migrated);
                console.log('DataManager: Legacy data migrated to unified storage.');
            } catch (e) {
                console.error('DataManager: Migration failed:', e);
            }
        }
    },

    // --- Legacy Character Persistence ---
    initLegacyForm() {
        const form = document.getElementById('char-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveLegacyCharacter();
            }, { signal: this.signal });
        }
    },

    saveLegacyCharacter(showStatus = true) {
        if (window.SUSPEND_SAVING) return;
        const form = document.getElementById('char-form');
        if (!form) return;

        const idInput = document.getElementById('char-id');
        if (idInput && !idInput.value) {
            idInput.value = 'char-' + Date.now() + '-' + DeochUtils.random().toString(36).substr(2, 9);
        }

        const formData = new FormData(form);
        const charData = {};
        for (const [key, value] of formData.entries()) {
            charData[key] = value;
        }

        const hudInputs = document.querySelectorAll('#combat-utilities-container input, .floating-vitality-orbs input');
        hudInputs.forEach(el => {
            const name = el.getAttribute('name') || el.id;
            if (name) {
                if (el.type === 'checkbox') {
                    charData[name] = el.checked ? 'on' : 'off';
                } else {
                    charData[name] = el.value;
                }
            }
        });

        this.setJson(this.KEYS.CHARACTER_SHEET, charData);

        let gallery = this.getJson(this.KEYS.LEGACY_GALLERY, []);
        const charId = charData['id'];

        if (charId) {
            const idx = gallery.findIndex(c => c.id === charId);
            if (idx >= 0) {
                gallery[idx] = charData;
            } else {
                if (gallery.length >= 10) {
                    this.showLegacyStatus('Gallery full (Max 10). Delete a hero first!', true);
                    return;
                }
                gallery.push(charData);
            }
            this.setJson(this.KEYS.LEGACY_GALLERY, gallery);
        }

        this.updateLegacyGallery();
        if (showStatus) this.showLegacyStatus('Character Saved to Gallery!');
    },

    loadLegacyCharacter() {
        const data = this.getJson(this.KEYS.CHARACTER_SHEET);
        if (!data) return;
        const form = document.getElementById('character-form');
        if (!form) return;

        for (const [key, value] of Object.entries(data)) {
            const elements = form.querySelectorAll(`[name="${key}"]`);
            elements.forEach(el => {
                if (el.type === 'checkbox') {
                    el.checked = value === 'on';
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (el.type === 'radio') {
                    if (el.value === value) el.checked = true;
                } else {
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            const hudEl = document.getElementById(key);
            if (hudEl) {
                if (hudEl.type === 'checkbox') {
                    hudEl.checked = value === 'on';
                } else {
                    hudEl.value = value;
                }
                hudEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    },

    showLegacyStatus(message, isError = false) {
        const status = document.getElementById('save-status');
        if (!status) return;
        status.textContent = message;
        status.style.color = isError ? 'var(--color-danger)' : '';
        status.classList.add('show');
        setTimeout(() => {
            status.classList.remove('show');
        }, isError ? 4000 : 3000);
    },

    // --- Gallery Logic (Merged from GalleryManager.js) ---
    /**
     * Renders the test sheet character gallery.
     */
    renderGallery() {
        const characters = this.getJson(this.KEYS.CHARACTERS, []);

        // 1. Full Grid (Dialog Gallery)
        const galleryContainer = document.getElementById('test-gallery-grid');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            characters.forEach(char => {
                const card = DeochUtils.renderGalleryCard(char, { activeId: this.activeCharId });
                card.addEventListener('click', () => this.loadCharacter(char.id), { signal: this.signal });
                galleryContainer.appendChild(card);
            });

            const newCard = DeochUtils.renderGalleryCard(null, { isNew: true });
            newCard.addEventListener('click', () => {
                this.newCharacter();
                document.getElementById('character-gallery-dialog')?.close();
            }, { signal: this.signal });
            galleryContainer.appendChild(newCard);
        }

        // 2. Integrated List (Management Popup)
        const galleryList = document.getElementById('test-gallery-list');
        if (galleryList) {
            galleryList.innerHTML = '';
            if (characters.length === 0) {
                galleryList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.7rem; opacity: 0.5; padding: 0.5rem; text-align: center;">No test characters saved.</p>';
            } else {
                characters.forEach(char => {
                    const btn = DeochUtils.renderGalleryCard(char, { activeId: this.activeCharId, variant: 'glass' });
                    btn.className = 'glass-btn';
                    btn.style.width = '100%';
                    btn.style.textAlign = 'left';
                    btn.style.padding = '0.5rem 0.75rem';
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.gap = '0.75rem';
                    btn.style.fontSize = '0.75rem';
                    btn.style.justifyContent = 'flex-start';
                    btn.style.height = 'auto';

                    if (char.id === this.activeCharId) {
                        btn.style.borderColor = 'var(--accent-primary)';
                        btn.style.color = 'var(--accent-primary)';
                        btn.style.background = 'var(--accent-glow)';
                        btn.style.boxShadow = '0 0 10px var(--accent-glow)';
                    }

                    btn.addEventListener('click', () => this.loadCharacter(char.id), { signal: this.signal });
                    galleryList.appendChild(btn);
                });
            }
        }

        DeochUtils.queueIconRefresh();
    },

    // --- Legacy Gallery Logic (Merged from gallery.js) ---
    /**
     * Updates the legacy character gallery UI.
     * @param {string|null} forcedActiveId - Optional ID to highlight as active.
     */
    updateLegacyGallery(forcedActiveId = null) {
        const galleryList = document.getElementById('gallery-list');
        const galleryContainer = document.getElementById('character-gallery');
        if (!galleryList || !galleryContainer) return;

        let gallery = this.getJson(this.KEYS.LEGACY_GALLERY, []);
        const currentIdInput = document.getElementById('char-id');
        const currentId = forcedActiveId || (currentIdInput ? currentIdInput.value : '');

        let updated = false;
        gallery = gallery.filter(char => char.name?.trim() || char.id).map(char => {
            if (!char.id) {
                char.id = 'migrated-' + DeochUtils.random().toString(36).substr(2, 9) + '-' + Date.now();
                updated = true;
            }
            return char;
        });

        if (updated) {
            this.setJson(this.KEYS.LEGACY_GALLERY, gallery);
        }

        galleryContainer.style.display = 'block';
        galleryList.innerHTML = '';

        if (gallery.length === 0) {
            galleryList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0; opacity: 0.6; padding: 0.5rem 0;">No saved characters in this gallery yet.</p>';
            return;
        }

        gallery.forEach(char => {
            const btn = DeochUtils.renderGalleryCard(char, { activeId: currentId, variant: 'secondary' });
            btn.className = 'secondary-btn gallery-character-btn' + (char.id === currentId ? ' active-gallery-btn' : '');

            btn.addEventListener('click', () => {
                if (typeof window.switchCharacter === 'function') window.switchCharacter(char.id);
            }, { signal: this.signal });
            galleryList.appendChild(btn);
        });

        DeochUtils.queueIconRefresh();
    },

    importFromTextarea() {
        const textarea = document.getElementById('test-transfer-textarea');
        if (!textarea?.value) {
            alert('Please paste character data first.');
            return;
        }
        try {
            const data = JSON.parse(textarea.value);
            this.loadCharacterFromData(data);
            const modal = document.getElementById('test-import-export-modal');
            if (modal) modal.style.display = 'none';
            document.getElementById('import-export-dialog')?.close();
        } catch (_e) {
            console.error('DataManager: Invalid character data', _e);
            alert('Invalid character data.');
        }
    },

    copyCharacterCode() {
        const charData = this.gatherCurrentData();
        const code = JSON.stringify(charData);
        DeochUtils.smartSet('test-transfer-textarea', code);

        navigator.clipboard.writeText(code).then(() => {
            DeochUtils.showFeedback('test-copy-btn', 'COPIED!');
        });
    }
};