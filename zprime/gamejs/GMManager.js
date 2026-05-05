import { DeochUtils } from './DeochUtils.js';

/**
 * @module GMManager
 * @description Handles Game Master mode tools, monster catalog, and encounter management.
 */
export const GMManager = {
    init(sheet, signal) {
        this.signal = signal;
        this.bindGMModeActions();
    },

    setGMMode(isActive) {
        const tabsCard = document.getElementById('test-tabs-card');
        const tabNav = tabsCard?.querySelector('.tab-nav');
        const tabContent = tabsCard?.querySelector('.tab-content');
        const gmCatalog = document.getElementById('gm-monster-catalog');
        const gmDetail = document.getElementById('gm-monster-detail');
        const gmList = document.getElementById('gm-monster-list');

        document.body.classList.toggle('gm-mode-active', isActive);
        if (tabsCard) tabsCard.classList.toggle('gm-mode-active', isActive);
        if (tabNav) tabNav.style.display = isActive ? 'none' : '';
        if (tabContent) tabContent.style.display = isActive ? 'none' : '';
        if (gmCatalog) gmCatalog.classList.toggle('hidden', !isActive);
        if (gmList) gmList.classList.remove('hidden');
        if (gmDetail) gmDetail.classList.add('hidden');
    },

    activateGMMode() {
        this.setGMMode(true);
        if (window.InterfaceManager && window.InterfaceManager.toggleHUD) {
            window.InterfaceManager.toggleHUD(false);
        }
        DeochUtils.setText('test-hud-name', 'GM MODE');
        DeochUtils.setText('test-hud-level-text', 'Encounter Tools');
        DeochUtils.setText('test-hud-secondary-level-text', 'Monster Catalog');
        const mainContent = document.getElementById('mobile-sheet-view');
        if (mainContent) {
            mainContent.style.display = 'flex';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
        }
    },

    bindGMModeActions() {
        const monsterData = {
            goblin: {
                name: 'Goblin',
                type: 'Small Humanoid',
                ac: '12',
                hp: '7',
                mp: '0',
                speed: '30ft',
                summary: 'Skittish ambusher that relies on numbers and dirty tactics.',
                actions: ['Scimitar +3 to hit, 1d6+1 damage', 'Shortbow +3 to hit, 1d6+1 damage']
            },
            spider: {
                name: 'Spider',
                type: 'Tiny Beast',
                ac: '13',
                hp: '4',
                mp: '0',
                speed: '20ft, climb 20ft',
                summary: 'Venomous crawler suited for cramped spaces and surprise attacks.',
                actions: ['Bite +4 to hit, 1 damage, target checks against venom']
            },
            horse: {
                name: 'Horse',
                type: 'Large Beast',
                ac: '11',
                hp: '19',
                mp: '0',
                speed: '60ft',
                summary: 'Fast mount or battlefield obstacle with a strong kick.',
                actions: ['Hooves +4 to hit, 2d4+2 damage']
            }
        };

        document.querySelectorAll('.monster-card-item').forEach(card => {
            card.addEventListener('click', () => {
                const monster = monsterData[card.dataset.monster];
                const list = document.getElementById('gm-monster-list');
                const detail = document.getElementById('gm-monster-detail');
                const display = document.getElementById('monster-info-display');
                if (!monster || !list || !detail || !display) return;

                display.innerHTML = `
                    <div class="glass-panel-dark" style="padding: 1.25rem; border-radius: 16px;">
                        <h3 style="margin: 0 0 0.35rem 0; color: var(--accent-primary); letter-spacing: 0.08em;">${monster.name}</h3>
                        <div style="font-size: 0.72rem; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem;">${monster.type}</div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                            <div><strong>AC</strong> ${monster.ac}</div>
                            <div><strong>HP</strong> ${monster.hp}</div>
                            <div><strong>MP</strong> ${monster.mp}</div>
                            <div><strong>Speed</strong> ${monster.speed}</div>
                        </div>
                        <p style="margin: 0 0 1rem 0; line-height: 1.5; opacity: 0.9;">${monster.summary}</p>
                        <div style="display: grid; gap: 0.5rem;">
                            ${monster.actions.map(action => `<div class="glass-panel-dark" style="padding: 0.7rem 0.9rem; border-radius: 12px;">${action}</div>`).join('')}
                        </div>
                    </div>
                `;

                list.classList.add('hidden');
                detail.classList.remove('hidden');
                DeochUtils.queueIconRefresh();
            }, { signal: this.signal });
        });

        const backBtn = document.getElementById('gm-back-to-catalog');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('gm-monster-list')?.classList.remove('hidden');
                document.getElementById('gm-monster-detail')?.classList.add('hidden');
            }, { signal: this.signal });
        }
    },

    cleanup() {
        console.log('GMManager: Cleanup called');
    }
};
