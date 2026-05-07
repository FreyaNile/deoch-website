import { DataManager } from './DataManager.js';
import { DeochUtils } from './DeochUtils.js';

/**
 * @module MechanicsManager
 * @description Central authority for game rules: Leveling, Resting, Exhaustion, and Conditions.
 */
export const MechanicsManager = {
    initialized: false,
    availableStatPoints: 0,
    allocatedThisLevel: [],
    preAllocationStats: {},
    lastProcessedLevel: -1,

    CONDITIONS: [
        { id: 'cond-blinded', name: 'Blinded', key: 'cond_blinded' },
        { id: 'cond-bloodied', name: 'Bloodied', key: 'cond_bloodied' },
        { id: 'cond-charmed', name: 'Charmed', key: 'cond_charmed' },
        { id: 'cond-deafened', name: 'Deafened', key: 'cond_deafened' },
        { id: 'cond-frightened', name: 'Frightened', key: 'cond_frightened' },
        { id: 'cond-grappled', name: 'Grappled', key: 'cond_grappled' },
        { id: 'cond-grappler', name: 'Grappler', key: 'cond_grappler' },
        { id: 'cond-hidden', name: 'Hidden', key: 'cond_hidden' },
        { id: 'char-ill', name: 'Ill', key: 'cond_ill' },
        { id: 'cond-invisible', name: 'Invisible', key: 'cond_invisible' },
        { id: 'cond-petrified', name: 'Petrified', key: 'cond_petrified' },
        { id: 'cond-prone', name: 'Prone', key: 'cond_prone' },
        { id: 'cond-restrained', name: 'Restrained', key: 'cond_restrained' },
        { id: 'cond-slowed', name: 'Slowed', key: 'cond_slowed' },
        { id: 'cond-stunned', name: 'Stunned', key: 'cond_stunned' },
        { id: 'cond-surprised', name: 'Surprised', key: 'cond_surprised' },
        { id: 'cond-unconscious', name: 'Unconscious', key: 'cond_unconscious' },
        { id: 'cond-wounded', name: 'Wounded', key: 'cond_wounded' },
        { id: 'char-hungry', name: 'Hungry', key: 'cond_hungry' },
        { id: 'char-thirst', name: 'Thirsty', key: 'cond_thirsty' }
    ],

    init(sheet, signal) {
        if (this.initialized) return;
        this.signal = signal;

        this.initRestListeners();
        this.initExhaustionListeners();
        this.initConditionListeners();
        this.initMulticlassListeners();
        this.initLevelingListeners();
        
        // Synchronize initial level state
        const expInput = document.getElementById('test-exp-input');
        if (expInput) {
            const exp = parseInt(expInput.textContent || expInput.value) || 0;
            this.lastProcessedLevel = this.calculateCurrentLevel(exp);
        }

        this.initialized = true;
    },

    // --- Core Mechanics Math ---

    calculateMod: (val) => DeochUtils.calculateMod(val),
    calculateLevelFromExp: (exp) => DeochUtils.calculateLevelFromExp(exp),
    calculateExpForLevel: (level) => DeochUtils.calculateExpForLevel(level),

    getLevelDisplayInfo(exp) {
        const totalLevel = this.calculateCurrentLevel(exp);
        const isMulticlass = document.getElementById('test-is-multiclass')?.value === 'true';

        let displayLevel = totalLevel;
        let primaryLevel = totalLevel;
        let secondaryLevel = 0;
        let displayClass = document.getElementById('test-hud-class-text')?.textContent || 'Human';
        let secondaryClass = document.getElementById('test-hud-secondary-class-visible')?.textContent || '';

        if (isMulticlass) {
            primaryLevel = 5;
            secondaryLevel = Math.max(1, totalLevel - 5);
            displayLevel = secondaryLevel;
            displayClass = secondaryClass || displayClass;
        }

        const isMaxLevel = isMulticlass ? (secondaryLevel >= 5) : (totalLevel >= 10);
        const currentLvlExp = this.calculateExpForLevel(totalLevel);
        const nextLvlThreshold = isMaxLevel ? null : this.calculateExpForLevel(totalLevel + 1);
        const expNeeded = isMaxLevel ? null : (nextLvlThreshold - exp);
        const progress = isMaxLevel ? 1 : Math.min(1, Math.max(0, (exp - currentLvlExp) / (nextLvlThreshold - currentLvlExp)));

        return {
            totalLevel,
            displayLevel,
            primaryLevel,
            secondaryLevel,
            displayClass,
            isMulticlass,
            isMaxLevel,
            nextLvlThreshold,
            expNeeded,
            progress,
            levelText: isMulticlass ? `LVL 5/${secondaryLevel}` : `LVL ${totalLevel}`
        };
    },

    /**
     * @returns {number} The starting stat points for a new character.
     */
    getStartingStatPoints() {
        return 3; // 3 base
    },

    /**
     * Calculates secondary stats (AC, Initiative) based on current attributes.
     */
    updateSecondaryStats() {
        if (!window.StatsManager) return;

        const dexValue = window.StatsManager.getStatValue('dex');
        const wisValue = window.StatsManager.getStatValue('wis');

        const dexMod = Math.floor((dexValue - 10) / 2);
        const wisMod = Math.floor((wisValue - 10) / 2);

        // Deoch Rules: AC = 8 + DEX Mod
        const ac = 8 + dexMod;
        // Update HUD
        DeochUtils.setText('char-ac-display', ac);
        const initStr = (wisMod >= 0 ? '+' : '') + wisMod;
        DeochUtils.setText('char-init-display', initStr);

        // Update Data Bridge
        const acInput = document.getElementById('char-ac-value');
        const initInput = document.getElementById('char-init-value');
        if (acInput) acInput.value = ac;
        if (initInput) initInput.value = initStr;
    },

    initLevelingListeners() {
        const testAddExp = document.getElementById('test-add-exp-input');
        if (testAddExp) {
            testAddExp.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleManualExpAdd(testAddExp);
            }, { signal: this.signal });
        }
    },

    handleManualExpAdd(input) {
        const val = parseInt(input.value) || 0;
        const expInput = document.getElementById('test-exp-input');
        if (expInput && val > 0) {
            const currentExp = parseInt(expInput.textContent || expInput.value) || 0;
            const newExp = currentExp + val;
            if (expInput.tagName === 'SPAN') expInput.textContent = newExp;
            else expInput.value = newExp;
            this.updateLevelFromExp();
            input.value = '';
        }
    },

    // --- Leveling Logic ---

    updateLevelFromExp(isMasteryAction = false) {
        const expInput = document.getElementById('test-exp-input');
        if (!expInput) return;

        const exp = parseInt(expInput.textContent || expInput.value) || 0;
        const totalLevel = this.calculateCurrentLevel(exp);

        const oldLevelText = document.getElementById('test-hud-level')?.textContent;
        const oldLevel = parseInt(oldLevelText) || 0;

        const isInitializing = window.DataManager ? window.DataManager.isInitializing : false;

        if (!isInitializing && this.lastProcessedLevel >= 0 && totalLevel > this.lastProcessedLevel) {
            const levelDiff = totalLevel - this.lastProcessedLevel;
            this.availableStatPoints += levelDiff * 2;
        }
        
        this.lastProcessedLevel = totalLevel;

        this.syncLevelToMainForm(totalLevel);

        if (!isMasteryAction) {
            this.checkLevelUpEvents(totalLevel, oldLevel);
        }

        if (window.InterfaceManager) {
            window.InterfaceManager.updateHUDLevelDisplay(exp);
            window.InterfaceManager.updateEXPRing(exp, totalLevel);
        }

        if (window.StatsManager) {
            window.StatsManager.updateAvailablePointsUI();
            window.StatsManager.updateStatIndicators();
        }
    },

    calculateCurrentLevel(exp) {
        const celebrated = document.getElementById('test-mastery-celebrated');
        if (celebrated && celebrated.value === 'true') return 10;
        return this.calculateLevelFromExp(exp);
    },

    syncLevelToMainForm(totalLevel) {
        const mainLevelInput = document.getElementById('char-level');
        if (mainLevelInput) {
            mainLevelInput.value = totalLevel;
            mainLevelInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },

    checkLevelUpEvents(totalLevel, oldLevel) {
        const isInitializing = window.DataManager ? window.DataManager.isInitializing : false;
        if (isInitializing) return;

        // 1. Initial Class Selection (Priority)
        const classChoiceMade = document.getElementById('test-hud-class-choice-made');
        if (totalLevel >= 1 && classChoiceMade && classChoiceMade.value === 'false') {
            this.showClassSelection();
            return;
        }

        // 2. Multiclass Trigger
        const multiclassChoiceMade = document.getElementById('test-multiclass-choice-made');
        const multiclassDialog = document.getElementById('multiclass-dialog');
        if (totalLevel >= 6 && multiclassChoiceMade && multiclassChoiceMade.value === 'false') {
            if (multiclassDialog) multiclassDialog.showModal();
            return;
        }

        // 3. Mastery Trigger
        const celebratedEl = document.getElementById('test-mastery-celebrated');
        if (totalLevel >= 10 && celebratedEl && celebratedEl.value === 'false') {
            this.triggerMasteryCelebration();
        }
    },

    initMulticlassListeners() {
        const yes = document.getElementById('test-multiclass-yes');
        const no = document.getElementById('test-multiclass-no');
        if (yes) {
            yes.addEventListener('click', () => {
                document.getElementById('test-multiclass-choice-made').value = 'true';
                document.getElementById('test-is-multiclass').value = 'true';
                document.getElementById('multiclass-dialog')?.close();
                
                // Refactored from setTimeout to custom event for deterministic timing
                window.dispatchEvent(new CustomEvent('deoch:request-class-selection', { 
                    detail: { isSecondary: true } 
                }));
            }, { signal: this.signal });
        }
        
        // Listen for the request
        window.addEventListener('deoch:request-class-selection', (e) => {
            this.showClassSelection(e.detail.isSecondary);
        }, { signal: this.signal });
        if (no) {
            no.addEventListener('click', () => {
                document.getElementById('test-multiclass-choice-made').value = 'true';
                document.getElementById('test-multiclass-opt-out').value = 'true';
                document.getElementById('multiclass-dialog')?.close();
                if (window.DataManager) window.DataManager.saveCharacter();
            }, { signal: this.signal });
        }
    },

    showClassSelection(isSecondary = false) {
        const dialog = document.getElementById('class-selection-dialog');
        const optionsContainer = document.getElementById('test-class-options');
        if (!dialog || !optionsContainer) return;

        const classes = [
            { name: 'Barbarian', icon: 'swords', desc: 'Instinctive' },
            { name: 'Fighter', icon: 'shield', desc: 'Combat Tactician' },
            { name: 'Rogue', icon: 'venetian-mask', desc: 'Expert' },
            { name: 'Wizard', icon: 'wand-2', desc: 'Academic' },
            { name: 'Sorcerer', icon: 'sparkles', desc: 'Avatar' },
            { name: 'Druid', icon: 'paw-print', desc: 'Naturalist' },
            { name: 'Paladin', icon: 'sword', desc: 'Faithful' },
            { name: 'Ranger', icon: 'arrow-up-right', desc: 'Tracker' },
            { name: 'Monk', icon: 'hand', desc: 'Disciplined' },
            { name: 'Psychic', icon: 'brain', desc: 'Cognitive' }
        ];

        optionsContainer.innerHTML = '';
        classes.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'glass-btn';
            btn.innerHTML = `
                <i data-lucide="${c.icon}"></i>
                <div>${c.name}</div>
                <div class="desc">${c.desc}</div>
            `;
            btn.onclick = () => this.handleClassSelection(c.name, isSecondary, dialog);
            optionsContainer.appendChild(btn);
        });

        DeochUtils.queueIconRefresh();
        dialog.showModal();
    },

    handleClassSelection(className, isSecondary, dialog) {
        if (isSecondary) {
            const secClass = document.getElementById('test-hud-secondary-class-visible');
            if (secClass) {
                secClass.textContent = className;
                secClass.dataset.secondaryClass = className;
            }
            document.getElementById('char-class-2').value = className;
        } else {
            const classText = document.getElementById('test-hud-class-text');
            if (classText) {
                classText.textContent = className;
                classText.dataset.primaryClass = className;
            }
            document.getElementById('test-hud-class-choice-made').value = 'true';
            document.getElementById('char-class').value = className;
        }
        dialog.close();
        this.updateLevelFromExp();
        if (window.DataManager) window.DataManager.saveCharacter();
    },

    // --- Mastery Logic ---

    triggerMasteryCelebration() {
        const overlay = document.getElementById('test-mastery-celebration');
        if (!overlay) return;

        const refreshModal = () => {
            const expInput = document.getElementById('test-exp-input');
            const expDisplay = document.getElementById('mastery-exp-display');
            const currentExp = parseInt(expInput.textContent || expInput.value) || 0;

            if (expDisplay) expDisplay.textContent = currentExp;

            const stats = ['hp', 'mp', 'str', 'dex', 'con', 'int', 'wis', 'cha'];
            const currentLevel = this.calculateCurrentLevel(currentExp);
            const currentLevelThreshold = this.calculateExpForLevel(currentLevel);

            stats.forEach(stat => {
                const btn = document.getElementById(`test-cel-mastery-${stat}-btn`);
                const costDisplay = document.getElementById(`test-cel-mastery-${stat}-cost`);
                if (!btn || !costDisplay) return;

                const cost = this.calculateMasteryCost(stat);
                costDisplay.textContent = `Cost: ${cost} EXP`;

                const canAfford = (currentExp - cost) >= currentLevelThreshold;
                btn.disabled = !canAfford;
                btn.style.opacity = canAfford ? '1' : '0.4';

                btn.onclick = (e) => this.handleMasteryPurchase(e, stat, cost, currentExp, currentLevelThreshold, expInput, refreshModal);
            });
        };

        this.initSparkles();
        refreshModal();

        overlay.classList.remove('u-hidden');
        overlay.style.display = 'flex';
        DeochUtils.queueIconRefresh();

        const dialog = document.getElementById('mastery-celebration-dialog');
        if (dialog) dialog.showModal();
    },

    initSparkles() {
        const container = document.getElementById('spark-container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 50; i++) {
            const spark = document.createElement('div');
            spark.className = 'mastery-spark';
            spark.style.left = Math.random() * 100 + 'vw';
            spark.style.bottom = '-10px';
            spark.style.animationDelay = Math.random() * 3 + 's';
            spark.style.opacity = Math.random();
            container.appendChild(spark);
        }
    },

    calculateMasteryCost(stat) {
        if (stat === 'hp') return (window.mobileMaxHp || 28) * 50;
        if (stat === 'mp') return (window.mobileMaxMp || 12) * 100;
        const base = window.StatsManager ? window.StatsManager.getStatValue(stat) : 9;
        const mod = Math.floor((base - 10) / 2);
        return base * Math.max(1, mod) * 125;
    },

    handleMasteryPurchase(e, stat, cost, currentExp, threshold, expInput, refresh) {
        e.stopPropagation();
        if ((currentExp - cost) < threshold) return;

        const newExp = currentExp - cost;
        if (expInput.tagName === 'SPAN') expInput.textContent = newExp;
        else expInput.value = newExp;

        this.applyMasteryBonus(stat);
        this.updateLevelFromExp(true);
        refresh();
    },

    applyMasteryBonus(stat) {
        if (stat === 'hp' || stat === 'mp') {
            const id = (stat === 'hp') ? 'hud-max-hp-input' : 'hud-max-mp-input';
            const input = document.getElementById(id);
            if (input) input.value = (parseInt(input.value) || 0) + 1;
            if (window.VitalsManager) {
                window.VitalsManager.updateMaxStat(stat);
                window.VitalsManager.adjust(stat, 1);
            }
        } else {
            const newVal = (window.StatsManager ? window.StatsManager.getStatValue(stat) : 9) + 1;
            if (window.StatsManager) window.StatsManager.setStatValue(stat, newVal);
        }
    },

    closeCelebration() {
        const overlay = document.getElementById('test-mastery-celebration');
        const dialog = document.getElementById('mastery-celebration-dialog');
        if (dialog) dialog.close();
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.add('u-hidden');
        }
        const celebrated = document.getElementById('test-mastery-celebrated');
        if (celebrated) celebrated.value = 'true';
        if (window.DataManager) window.DataManager.saveCharacter();
    },

    // --- Rest & Healing Logic ---

    initRestListeners() {
        const rollHealingBtns = document.querySelectorAll('.roll-h-die');
        rollHealingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sides = parseInt(btn.getAttribute('data-sides'));
                this.rollHealing(sides);
            }, { signal: this.signal });
        });

        const applyHp = document.getElementById('apply-healing-hp');
        if (applyHp) applyHp.addEventListener('click', () => this.applyRestoration('hp'), { signal: this.signal });

        const applyMana = document.getElementById('apply-healing-mana');
        if (applyMana) applyMana.addEventListener('click', () => this.applyRestoration('mana'), { signal: this.signal });
    },

    rollHealing(sides) {
        const healingDiceInput = document.getElementById('char-healing-dice');
        const healingResultSpan = document.getElementById('healing-roll-result');
        const diceBadge = document.getElementById('healing-dice-badge');

        let count = parseInt(healingDiceInput?.value) || 0;
        if (count <= 0) {
            this.showRestToast('No Healing Dice available!', healingDiceInput);
            return;
        }

        const roll = Math.floor(Math.random() * sides) + 1;
        if (healingResultSpan) healingResultSpan.textContent = roll;

        count--;
        if (healingDiceInput) healingDiceInput.value = count;
        if (diceBadge) diceBadge.textContent = count;

        this.showRestToast(`Rolled ${roll}!`, healingResultSpan);
    },

    applyRestoration(type) {
        const healingResultSpan = document.getElementById('healing-roll-result');
        const rollValue = parseInt(healingResultSpan?.textContent) || 0;
        if (rollValue <= 0) return;

        if (type === 'hp') {
            const hpInput = document.getElementById('char-hp');
            const maxHp = parseInt(document.getElementById('char-hp-max')?.value) || 0;
            let current = parseInt(hpInput?.value) || 0;
            hpInput.value = Math.min(maxHp, current + rollValue);
            hpInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            const manaInput = document.getElementById('char-mana');
            const maxMana = parseInt(document.getElementById('char-mana-max')?.value) || 0;
            let current = parseInt(manaInput?.value) || 0;
            manaInput.value = Math.min(maxMana, current + rollValue);
            manaInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (healingResultSpan) healingResultSpan.textContent = '0';
    },

    showRestToast(message, element) {
        const toast = document.createElement('div');
        toast.className = 'rest-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        const rect = element.getBoundingClientRect();
        toast.style.top = `${rect.top - 40}px`;
        toast.style.left = `${rect.left + (rect.width / 2)}px`;

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // --- Exhaustion & Conditions ---

    initExhaustionListeners() {
        const inputs = document.querySelectorAll('.exhaustion-dots input');
        inputs.forEach((input, index) => {
            input.addEventListener('change', (e) => {
                this.handleExhaustionChange(e.target.checked, index + 1, inputs);
                if (window.DataManager) window.DataManager.saveCharacter();
            }, { signal: this.signal });
        });
    },

    handleExhaustionChange(isChecking, targetLevel, exhaustionInputs) {
        if (isChecking) {
            for (let i = 0; i < targetLevel; i++) {
                if (exhaustionInputs[i]) exhaustionInputs[i].checked = true;
            }
        } else {
            for (let i = targetLevel; i < exhaustionInputs.length; i++) {
                if (exhaustionInputs[i]) exhaustionInputs[i].checked = false;
            }
        }
        this.updateConditionsBadge();
    },

    initConditionListeners() {
        const inputs = document.querySelectorAll('.condition-item input');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateConditionsBadge();
                if (window.DataManager) window.DataManager.saveCharacter();
            }, { signal: this.signal });
        });
        this.updateConditionsBadge();
    },

    updateConditionsBadge() {
        const count = document.querySelectorAll('.condition-item input:checked, .exhaustion-dots input:checked').length;
        const badge = document.getElementById('condition-count');
        if (badge) badge.textContent = count;

        const summary = document.getElementById('conditions-active-summary');
        if (summary) {
            summary.classList.toggle('hidden', count === 0);
        }
    },

    /**
     * Calculates HP and TempHP changes based on Deoch rules.
     */
    calculateHPChange(currentHp, currentTemp, delta, maxHp) {
        let newHp = currentHp;
        let newTemp = currentTemp;

        if (delta > 0) {
            const potential = currentHp + delta;
            if (potential > maxHp) {
                newHp = maxHp;
                newTemp = Math.min(maxHp * 2, newTemp + (potential - maxHp));
            } else {
                newHp = potential;
            }
        } else if (delta < 0) {
            if (newTemp > 0) {
                const remaining = newTemp + delta;
                if (remaining < 0) {
                    newTemp = 0;
                    newHp = Math.max(0, newHp + remaining);
                } else {
                    newTemp = remaining;
                }
            } else {
                newHp = Math.max(0, newHp + delta);
            }
        }

        return { hp: newHp, temp: newTemp };
    },

    /**
     * Checks if a character has died and returns the death configuration.
     */
    checkDeathState(currentHp, lastHp, isInspired) {
        if (currentHp === 0 && lastHp > 0) {
            return isInspired ? 'mercy' : 'death';
        }
        return null;
    },

    getDeathConfig(state) {
        const isMercy = state === 'mercy';
        return {
            isMercy,
            title: isMercy ? 'MERCY' : 'YOU ARE DEAD',
            message: isMercy
                ? 'Inspiration has saved you from the brink. You cling to life with 1 HP remaining.'
                : 'The darkness claims your soul. This character has met their end.',
            icon: isMercy ? 'sparkles' : 'skull',
            themeClass: isMercy ? 'mercy-state' : 'death-state'
        };
    },

    cleanup() {
        console.log('MechanicsManager: Cleanup called');
    }
};
