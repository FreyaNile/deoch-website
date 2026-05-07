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

    loadLastCharacter() {
        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
        if (gallery.length > 0) {
            const lastId = this.get(this.KEYS.LAST_CHAR_ID);
            const charToLoad = gallery.find(c => c.id === lastId) || gallery[0];
            this.loadCharacter(charToLoad.id);
        }
    },

    // --- Storage Delegation ---
    get: (key, def) => DeochUtils.Storage.get(key, def),
    set: (key, val) => DeochUtils.Storage.set(key, val),
    getJson: (key, def) => DeochUtils.Storage.getJson(key, def),
    setJson: (key, val) => DeochUtils.Storage.setJson(key, val),
    remove: (key) => DeochUtils.Storage.remove(key),
    clear: () => DeochUtils.Storage.clear(),

    // --- High-Level Character Persistence ---
    saveCharacter() {
        if (window.SUSPEND_SAVING) return;
        if (!this.activeCharId && !confirm('No active character. Create new?')) return;

        const charData = this.gatherCurrentData();
        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
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
        return {
            id: this.activeCharId || 'char_' + Date.now(),
            name: document.getElementById('test-hud-name')?.textContent || 'Unknown Hero',
            rank: document.getElementById('test-hud-detail-rank')?.textContent || 'Rank 1',
            race: document.getElementById('test-hud-detail-race')?.textContent || 'Human',
            age: document.getElementById('test-hud-detail-age')?.textContent || '20',
            speed: document.getElementById('test-hud-detail-speed')?.textContent || '30ft',
            size: document.getElementById('test-hud-detail-size')?.textContent || 'Medium',
            level: document.getElementById('test-hud-level')?.textContent || '1',
            exp: document.getElementById('test-exp-input')?.textContent || document.getElementById('test-exp-input')?.value || '20',
            theme: document.documentElement.getAttribute('data-theme') || 'sandstorm',
            avatar: (() => {
                const img = document.getElementById('test-hud-avatar-img');
                return (img && img.style.display !== 'none') ? img.src : null;
            })(),
            stats: window.StatsManager ? window.StatsManager.getStats() : {},
            maxHp: parseInt(document.getElementById('hud-max-hp-input')?.value) || 28,
            currentHp: window.mobileTargetHp !== undefined ? window.mobileTargetHp : (parseInt(document.getElementById('hud-max-hp-input')?.value) || 28),
            tempHp: window.mobileTargetTempHp || 0,
            maxMp: parseInt(document.getElementById('hud-max-mp-input')?.value) || 12,
            currentMp: window.mobileTargetMp !== undefined ? window.mobileTargetMp : (parseInt(document.getElementById('hud-max-mp-input')?.value) || 12),
            maxSp: parseInt(document.getElementById('mobile-max-sp-input')?.value) || 10,
            currentSp: window.mobileTargetSp !== undefined ? window.mobileTargetSp : (parseInt(document.getElementById('mobile-max-sp-input')?.value) || 10),
            primaryClass: document.getElementById('test-hud-class-text')?.dataset.primaryClass || document.getElementById('test-hud-class-text')?.textContent || 'Human',
            classChoiceMade: document.getElementById('test-hud-class-choice-made')?.value || 'false',
            isMulticlass: document.getElementById('test-is-multiclass')?.value || 'false',
            secondaryClass: document.getElementById('test-hud-secondary-class-visible')?.dataset.secondaryClass || document.getElementById('test-hud-secondary-class-visible')?.textContent || '',
            multiclassChoiceMade: document.getElementById('test-multiclass-choice-made')?.value || 'false',
            multiclassOptOut: document.getElementById('test-multiclass-opt-out')?.value || 'false',
            masteryCelebrated: document.getElementById('test-mastery-celebrated')?.value || 'false',
            availableStatPoints: window.MechanicsManager ? window.MechanicsManager.availableStatPoints : 0,
            lastSaved: new Date().toISOString()
        };
    },

    loadCharacter(id) {
        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
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
        if (char.stats && window.StatsManager) {
            window.StatsManager.applyStats(char.stats);
        }

        // Apply vitals
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

        const hpInput = document.getElementById('hud-max-hp-input');
        if (hpInput) hpInput.value = window.mobileMaxHp;
        const mpInput = document.getElementById('hud-max-mp-input');
        if (mpInput) mpInput.value = window.mobileMaxMp;
        const spInput = document.getElementById('mobile-max-sp-input');
        if (spInput) spInput.value = window.mobileMaxSp;

        // Apply toggles
        if (char.inspiration !== undefined) {
            const insp = document.getElementById('test-hud-inspiration');
            if (insp) insp.checked = char.inspiration;
        }
        // Apply flags
        const setFlag = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val === true || val === 'true' ? 'true' : 'false';
        };
        setFlag('test-hud-class-choice-made', char.classChoiceMade);
        setFlag('test-is-multiclass', char.isMulticlass);
        setFlag('test-multiclass-choice-made', char.multiclassChoiceMade);
        setFlag('test-multiclass-opt-out', char.multiclassOptOut);
        setFlag('test-mastery-celebrated', char.masteryCelebrated);

        // Apply class info
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

        // Apply EXP
        DeochUtils.smartSet('test-exp-input', char.exp || 20);

        // Apply Theme
        if (char.theme && window.InterfaceManager?.applyTheme) window.InterfaceManager.applyTheme(char.theme);

        // Update UI
        if (window.MechanicsManager) {
            window.MechanicsManager.availableStatPoints = char.availableStatPoints || 0;
            window.MechanicsManager.updateLevelFromExp();
        }
        if (window.StatsManager) {
            window.StatsManager.updateSecondaryStats();
            window.StatsManager.updateAvailablePointsUI();
            window.StatsManager.updateStatIndicators();
        }

        this.isInitializing = false;
        console.log('Character loaded:', char.name);
        this.renderGallery();
    },

    newCharacter() {
        const id = 'char_' + Date.now();
        this.activeCharId = id;
        this.isInitializing = true;

        // Reset DOM and state to defaults BEFORE saving new character
        this.resetSheetToDefaults();

        if (window.MechanicsManager) {
            window.MechanicsManager.availableStatPoints = window.MechanicsManager.getStartingStatPoints();
        }

        if (window.CreationTour) window.CreationTour.resetTour();

        // Save the newly initialized default data
        this.saveCharacter();

        this.renderGallery();
        this.isInitializing = false;

        if (window.StatsManager) {
            window.StatsManager.updateAvailablePointsUI();
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
        if (window.StatsManager) {
            window.StatsManager.applyStats({
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
        ['test-hud-class-choice-made', 'test-is-multiclass', 'test-multiclass-choice-made', 'test-multiclass-opt-out', 'test-mastery-celebrated'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = 'false';
        });

        // Reset classes
        DeochUtils.setText('test-hud-class-text', 'Human');
        DeochUtils.setText('test-hud-secondary-class-visible', '');
        const classInput = document.getElementById('char-class');
        if (classInput) classInput.value = 'Human';
        const classInput2 = document.getElementById('char-class-2');
        if (classInput2) classInput2.value = '';

        // Reset EXP
        DeochUtils.smartSet('test-exp-input', 20);

        // Reset Theme to default
        if (window.InterfaceManager?.applyTheme) window.InterfaceManager.applyTheme('sandstorm');

        // Refresh UI dependencies
        if (window.StatsManager) {
            window.StatsManager.updateSecondaryStats();
            window.StatsManager.updateStatIndicators();
        }
        if (window.MechanicsManager) {
            window.MechanicsManager.updateLevelFromExp();
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
        const gallery = this.getJson(this.KEYS.CHARACTERS, []);
        const char = gallery.find(c => c.id === this.activeCharId);
        if (!char) return;

        const dataStr = JSON.stringify(char);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `${char.name.replace(/\s+/g, '_')}_deoch.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
            idInput.value = 'char-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
                const card = document.createElement('div');
                card.className = 'test-gallery-card' + (char.id === this.activeCharId ? ' active' : '');
                card.innerHTML = `
                    <div class="card-bg"></div>
                    <div class="card-content">
                        <div class="char-avatar"><i data-lucide="user"></i></div>
                        <div class="char-info">
                            <div class="char-name">${char.name}</div>
                            <div class="char-meta">Level ${char.level} ${char.primaryClass || 'Hero'}</div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    this.loadCharacter(char.id);
                }, { signal: this.signal });
                galleryContainer.appendChild(card);
            });

            // Add "New Character" card
            const newCard = document.createElement('div');
            newCard.className = 'test-gallery-card new-char';
            newCard.innerHTML = `
                <div class="card-bg"></div>
                <div class="card-content">
                    <div class="char-avatar"><i data-lucide="plus"></i></div>
                    <div class="char-info">
                        <div class="char-name">Create New</div>
                        <div class="char-meta">Begin a new journey</div>
                    </div>
                </div>
            `;
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
                    const btn = document.createElement('button');
                    btn.type = 'button';
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

                    btn.innerHTML = `<i data-lucide="user" style="width: 14px; height: 14px;"></i> ${char.name || 'Unknown Hero'}`;
                    btn.addEventListener('click', () => {
                        this.loadCharacter(char.id);
                    }, { signal: this.signal });
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
                char.id = 'migrated-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
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
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'secondary-btn gallery-character-btn';
            if (char.id === currentId) btn.classList.add('active-gallery-btn');

            btn.innerHTML = `<i data-lucide="user" style="width: 14px; height: 14px;"></i> ${char.name || 'New Character'}`;
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