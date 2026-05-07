import { DeochUtils } from './DeochUtils.js';

/**
 * @module StatManager
 * @description Handles stat point allocation, validation, rolling, and mobile actions.
 */
export const StatManager = {
    initialized: false,

    init(sheet, signal) {
        this.sheet = sheet;
        this.signal = signal;
        
        if (!this.initialized) {
            this.initStatTooltip();
            this.initStatRolling();
            this.initMobileActions();
            this.initialized = true;
        }
    },

    // --- Allocation Logic ---
    getStatValue(stat) {
        const input = document.getElementById(`stat-${stat}`);
        return parseInt(input?.value || input?.textContent) || 9;
    },

    setStatValue(stat, value) {
        DeochUtils.smartSet(`stat-${stat}`, value);
        DeochUtils.smartSet(`char-${stat}`, value);

        // Update summaries
        document.querySelectorAll(`.summary-item[data-stat="${stat}"] .val, .attr-box[data-stat="${stat}"] .val`).forEach(el => {
            el.textContent = value;
        });

        const mod = DeochUtils.calculateMod(value);
        document.querySelectorAll(`.summary-item[data-stat="${stat}"] .mod, .attr-box[data-stat="${stat}"] .mod`).forEach(el => {
            el.textContent = `(${(mod >= 0 ? '+' : '')}${mod})`;
        });

        this.updateSecondaryStats();
        this.pulseStatIncrease(stat);
    },

    getStats() {
        const stats = {};
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
            stats[stat] = this.getStatValue(stat);
        });
        return stats;
    },

    applyStats(stats) {
        if (!stats) return;
        Object.entries(stats).forEach(([stat, value]) => {
            this.setStatValue(stat, value);
        });
    },

    updateSecondaryStats() {
        const dexValue = this.getStatValue('dex');
        const wisValue = this.getStatValue('wis');

        const dexMod = Math.floor((dexValue - 10) / 2);
        const wisMod = Math.floor((wisValue - 10) / 2);

        // Deoch Rules: AC = 8 + DEX Mod
        if (window.MechanicsManager) {
            window.MechanicsManager.updateSecondaryStats();
        }
    },

    pulseStatIncrease(stat) {
        const selectors = [
            `.summary-item[data-stat="${stat}"]`,
            `.attr-box[data-stat="${stat}"]`,
            `.test-stat-val[data-stat="${stat}"]`
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.remove('stat-allocated-flash');
                void el.offsetWidth;
                el.classList.add('stat-allocated-flash');
                setTimeout(() => el.classList.remove('stat-allocated-flash'), 650);
            });
        });
    },

    handleStatAllocation(stat) {
        const points = window.MechanicsManager ? window.MechanicsManager.availableStatPoints : 0;
        if (points <= 0) return;

        // Backup original values if this is the first allocation in a batch
        if (window.MechanicsManager && window.MechanicsManager.allocatedThisLevel.length === 0) {
            const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
            stats.forEach(s => {
                window.MechanicsManager.preAllocationStats[s] = this.getStatValue(s);
            });
        }

        const currentVal = this.getStatValue(stat);
        this.setStatValue(stat, currentVal + 1);
        if (window.MechanicsManager) {
            window.MechanicsManager.availableStatPoints--;
            window.MechanicsManager.allocatedThisLevel.push(stat);
        }

        this.updateAvailablePointsUI();
        this.updateStatIndicators();
        const updatedPoints = window.MechanicsManager ? window.MechanicsManager.availableStatPoints : 0;
        if (updatedPoints === 0) {
            this.showStatConfirmation(true);
        }

        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(10);
    },

    confirmStatAllocation() {
        if (window.MechanicsManager) {
            window.MechanicsManager.allocatedThisLevel = [];
            window.MechanicsManager.preAllocationStats = {};
        }
        this.showStatConfirmation(false);
        this.updateAvailablePointsUI();
        this.updateStatIndicators();
        if (window.DataManager) window.DataManager.saveCharacter();
    },

    denyStatAllocation() {
        if (window.MechanicsManager && window.MechanicsManager.preAllocationStats && Object.keys(window.MechanicsManager.preAllocationStats).length > 0) {
            Object.entries(window.MechanicsManager.preAllocationStats).forEach(([stat, value]) => {
                this.setStatValue(stat, value);
            });
            window.MechanicsManager.availableStatPoints += window.MechanicsManager.allocatedThisLevel.length;
            window.MechanicsManager.allocatedThisLevel = [];
            window.MechanicsManager.preAllocationStats = {};
        }
        this.showStatConfirmation(false);
        this.updateStatIndicators();
        this.updateAvailablePointsUI();
    },

    updateAvailablePointsUI() {
        const pointsEl = document.getElementById('available-points');
        const indicator = document.getElementById('stat-points-indicator');
        const points = window.MechanicsManager ? window.MechanicsManager.availableStatPoints : 0;
        const hasPoints = points > 0;

        if (pointsEl) pointsEl.textContent = points;
        if (indicator) {
            indicator.style.display = hasPoints ? 'flex' : 'none';
            if (hasPoints) indicator.classList.add('pulsate-glow');
            else indicator.classList.remove('pulsate-glow');
        }

        // Toggle popup visibility
        const hasInteracted = localStorage.getItem('deoch_has_interacted_with_stat_popup') === 'true';
        const isDismissed = document.body.classList.contains('stat-tooltip-dismissed');
        document.body.classList.toggle('has-available-points', hasPoints && !hasInteracted && !isDismissed);

        // Reset dismissal state when points are cleared so it can reappear on next grant
        if (!hasPoints) {
            document.body.classList.remove('stat-tooltip-dismissed');
            localStorage.removeItem('deoch_has_interacted_with_stat_popup');
        }
    },

    updateStatIndicators() {
        const hud = document.getElementById('top-mobile-hud');
        const isExpanded = hud?.classList.contains('expanded');
        const points = window.MechanicsManager ? window.MechanicsManager.availableStatPoints : 0;
        const hasPoints = points > 0;

        document.querySelectorAll('.summary-item, .attr-box').forEach(el => {
            const stat = el.dataset.stat;
            if (!stat) return;
            if (isExpanded && hasPoints) el.classList.add('can-increase');
            else el.classList.remove('can-increase');
        });
    },

    showStatConfirmation(visible) {
        const bar = document.getElementById('stat-allocation-confirm');
        if (bar) {
            if (visible) bar.classList.add('active');
            else bar.classList.remove('active');
        }
    },

    // --- Rolling Logic (Merged from stats.js) ---
    initStatRolling() {
        document.addEventListener('click', (e) => {
            const el = e.target.closest('.attr-box, .summary-item');
            if (el) this.handleStatClick(e, el);
        }, { signal: this.signal });
    },

    handleStatClick(e, el) {
        if (el.closest('#floating-vitality-orbs')) return;
        const stat = el.getAttribute('data-stat') || 'str';
        if (e.target.closest('.hud-header-toggles')) return;

        if (el.classList.contains('can-increase')) {
            this.handleStatAllocation(stat);
            return;
        }

        if (el.classList.contains('stat-rolling') || !window.DiceRoller) return;

        const mod = this.getStatMod(stat);
        const total = window.DiceRoller.rollCheck(mod, stat.toUpperCase());

        el.classList.add('stat-rolling');
        if (window.navigator?.vibrate) window.navigator.vibrate(10);

        const resultDiv = document.createElement('div');
        resultDiv.className = 'stat-roll-result';
        resultDiv.textContent = total;
        resultDiv.style.position = 'absolute';
        resultDiv.style.top = '0';
        resultDiv.style.left = '0';
        resultDiv.style.width = '100%';
        resultDiv.style.height = '100%';
        resultDiv.style.display = 'flex';
        resultDiv.style.alignItems = 'center';
        resultDiv.style.justifyContent = 'center';
        resultDiv.style.background = 'rgba(0,0,0,0.8)';
        resultDiv.style.borderRadius = 'inherit';
        resultDiv.style.zIndex = '10';

        const originalPosition = el.style.position;
        if (!originalPosition || originalPosition === 'static') el.style.position = 'relative';
        el.appendChild(resultDiv);

        setTimeout(() => {
            el.classList.remove('stat-rolling');
            resultDiv.remove();
            el.style.position = originalPosition;
            el.classList.add('stat-fade-back');
            setTimeout(() => el.classList.remove('stat-fade-back'), 400);
            DeochUtils.queueIconRefresh();
        }, 2000);
    },

    // --- Mobile Actions (Merged from stats.js) ---
    initMobileActions() {
        const actionsList = document.getElementById('test-actions-list');
        const addActionBtn = document.getElementById('add-action-btn');

        if (!actionsList || !addActionBtn) return;

        actionsList.addEventListener('click', (e) => {
            const actionItem = e.target.closest('.action-item');
            if (!actionItem) return;

            const type = actionItem.getAttribute('data-action-type');

            if (type === 'unarmed') {
                const choice = prompt('Unarmed Attack: Use Strength (S) or Dexterity (D)?', 'S');
                if (!choice) return;
                const stat = choice.toLowerCase().startsWith('d') ? 'dex' : 'str';
                const mod = this.getStatMod(stat);
                this.rollAction(actionItem, 'Unarmed Attack', mod, (m) => Math.max(1, 1 + m));
            } else if (type === 'custom') {
                const name = actionItem.getAttribute('data-action-name');
                const bonus = parseInt(actionItem.getAttribute('data-action-bonus')) || 0;
                this.rollAction(actionItem, name, bonus);
            }
        }, { signal: this.signal });

        addActionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showAddActionPrompt();
        }, { signal: this.signal });
    },

    getStatMod(stat) {
        const val = this.getStatValue(stat);
        return window.MechanicsManager ? window.MechanicsManager.calculateMod(val) : Math.floor((val - 10) / 2);
    },

    rollAction(el, name, bonus, damageFormula = null) {
        if (el.classList.contains('action-rolling')) return;

        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + bonus;

        const bonusDisplay = el.querySelector('.action-bonus');
        if (!bonusDisplay) return;

        const originalBonus = bonusDisplay.innerHTML;
        el.classList.add('action-rolling');
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(15);

        let resultHTML = `<span class="action-roll-result">${total}</span>`;
        if (damageFormula) {
            const dmg = damageFormula(bonus);
            resultHTML = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; line-height: 1;">
                    <span class="action-roll-result">${total}</span>
                    <span style="font-size: 0.5rem; opacity: 0.8; margin-top: 1px;">DMG: ${dmg}</span>
                </div>
            `;
        }

        bonusDisplay.innerHTML = resultHTML;

        setTimeout(() => {
            el.classList.remove('action-rolling');
            bonusDisplay.innerHTML = originalBonus;
            el.classList.add('stat-fade-back');
            setTimeout(() => el.classList.remove('stat-fade-back'), 400);
        }, 2500);
    },

    showAddActionPrompt() {
        const name = prompt('Action Name:', 'Attack');
        if (!name) return;
        const bonusStr = prompt('Bonus to Roll (e.g. 5):', '0');
        const bonus = parseInt(bonusStr) || 0;

        const actionsList = document.getElementById('test-actions-list');
        const newItem = document.createElement('div');
        newItem.className = 'action-item';
        newItem.setAttribute('data-action-type', 'custom');
        newItem.setAttribute('data-action-name', name);
        newItem.setAttribute('data-action-bonus', bonus);

        newItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="action-icon-circle"><i data-lucide="sword" style="width: 14px; height: 14px; color: var(--accent-primary);"></i></div>
                <div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #fff;">${name}</div>
                    <div style="font-size: 0.65rem; opacity: 0.5;">Custom Action</div>
                </div>
            </div>
            <div class="action-bonus-display"><div class="action-bonus">${bonus >= 0 ? '+' : ''}${bonus}</div></div>
        `;

        actionsList.appendChild(newItem);
        DeochUtils.queueIconRefresh();
    },

    initStatTooltip() {
        const tooltip = document.getElementById('stat-points-tooltip');
        if (tooltip) {
            tooltip.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.setItem('deoch_has_interacted_with_stat_popup', 'true');
                document.body.classList.add('stat-tooltip-dismissed');
                if (window.InterfaceManager) window.InterfaceManager.toggleHUD(true);
            }, { signal: this.signal });
        }
    },

    cleanup() {
        this.initialized = false;
        console.log('StatManager: Cleanup called');
    }
};
