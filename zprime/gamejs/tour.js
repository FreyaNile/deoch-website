export const CreationTour = {
    currentStep: 0,
    totalSteps: 6,
    data: {
        race: '',
        language: '',
        trinket: '',
        traits: [],
        feat: ''
    },

    init(signal) {
        this.signal = signal;
        const tourContainer = document.getElementById('creation-tour');
        if (!tourContainer) return;

        tourContainer.style.display = 'none';

        // --- Event Delegation ---
        tourContainer.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-tour-action]');
            if (!actionTarget) return;

            const action = actionTarget.getAttribute('data-tour-action');
            this.handleTourAction(action, e, actionTarget);
        }, { signal: this.signal });

        tourContainer.addEventListener('change', (e) => {
            const actionTarget = e.target.closest('[data-tour-action]');
            if (!actionTarget) return;

            const action = actionTarget.getAttribute('data-tour-action');
            this.handleTourAction(action, e, actionTarget);
        }, { signal: this.signal });

        const nameInput = document.getElementById('tour-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', () => this.syncName(), { signal: this.signal });
            nameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.nextStep();
                }
            }, { signal: this.signal });
        }
    },

    /**
     * @memberof CreationTour
     * @description Centralized handler for tour actions.
     */
    handleTourAction(action, event, target) {
        switch (action) {
            case 'select-heritage': {
                const id = target.getAttribute('data-heritage-id');
                const name = target.getAttribute('data-heritage-name');
                this.selectHeritage(id, name);
                break;
            }
            case 'roll-age':
                this.rollAge();
                break;
            case 'select-language':
                this.selectLanguage(target.value);
                break;
            case 'select-trinket':
                this.selectTrinket(target.getAttribute('data-trinket'));
                break;
            case 'toggle-trait':
                this.toggleTrait(target, target.getAttribute('data-trait'));
                break;
            case 'select-feat':
                this.selectFeat(target.getAttribute('data-feat'));
                break;
            case 'prev-step':
                this.prevStep();
                break;
            case 'next-step':
                this.nextStep();
                break;
            case 'finish-tour':
                this.finishTour();
                break;
        }
    },


    showStep(n) {
        const steps = document.querySelectorAll('.tour-step');
        steps.forEach(step => {
            step.style.display = 'none';
            step.classList.remove('active');
        });

        const currentStepEl = document.querySelector(`.tour-step[data-step="${n}"]`);
        if (currentStepEl) {
            currentStepEl.style.display = 'block';
            setTimeout(() => currentStepEl.classList.add('active'), 10);
            
            // SPE: Auto-focus name input on first slide for immediate typing
            if (n === 0) {
                const nameInput = document.getElementById('tour-name-input');
                if (nameInput) setTimeout(() => nameInput.focus(), 150);
            }
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('tour-prev');
        const nextBtn = document.getElementById('tour-next');
        const finishBtn = document.getElementById('tour-finish');

        if (prevBtn) prevBtn.style.display = n > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = n < this.totalSteps ? 'block' : 'none';
        if (finishBtn) finishBtn.style.display = n === this.totalSteps ? 'block' : 'none';

        // Update progress bar
        const progress = document.getElementById('tour-progress');
        if (progress) {
            progress.style.width = `${((n + 1) / (this.totalSteps + 1)) * 100}%`;
        }

        this.currentStep = n;
    },

    nextStep() {
        if (this.currentStep === 0) {
            this.syncName();
            if (this.data.name === '1') {
                this.finishTour(true);
                return;
            }
            if (this.data.name === '2') {
                this.finishTour(false);
                return;
            }
        }
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    },

    prevStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    },

    resetTour() {
        this.currentStep = 0;
        this.data = {
            name: '',
            race: '',
            language: '',
            trinket: '',
            traits: [],
            feat: ''
        };
        
        // Reset UI inputs
        const selects = document.querySelectorAll('#creation-tour select');
        selects.forEach(s => s.selectedIndex = 0);
        
        const checks = document.querySelectorAll('#creation-tour input[type="checkbox"], #creation-tour input[type="radio"]');
        checks.forEach(c => c.checked = false);

        const nameInput = document.getElementById('tour-name-input');
        if (nameInput) nameInput.value = ''; // SPE: Rely on placeholder "Name your legend..." instead of hardcoded text

        const tourContainer = document.getElementById('creation-tour');
        const mainContent = document.getElementById('mobile-sheet-view');
        if (tourContainer) {
            tourContainer.classList.remove('hidden');
            tourContainer.style.display = 'flex';
            tourContainer.style.opacity = '1';
            document.body.classList.add('tour-active');
        }
        if (mainContent) {
            mainContent.style.display = 'none';
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateY(16px)';
        }

        this.syncName();
        this.showStep(0);
    },

    syncName() {
        const nameInput = document.getElementById('tour-name-input');
        const trimmedName = nameInput?.value?.trim();
        const finalName = trimmedName || 'Unknown'; // SPE: Fallback to "Unknown" if input is empty
        this.data.name = finalName;
        const nameDisplay = document.getElementById('test-hud-name');
        if (nameDisplay) nameDisplay.textContent = finalName;
    },

    selectRace(race) {
        this.selectHeritage(null, race);
    },

    selectHeritage(id, name) {
        this.data.race = name;
        const raceDisplay = document.getElementById('test-hud-detail-race');
        if (raceDisplay) raceDisplay.textContent = name;
        this.nextStep();
    },

    rollAge() {
        const age = Math.floor(Math.random() * 40) + 16;
        this.data.age = age;
        const display = document.getElementById('tour-age-display');
        if (display) {
            display.textContent = age;
            display.classList.add('stat-roll-result');
            setTimeout(() => display.classList.remove('stat-roll-result'), 1000);
        }
        
        const rollBtn = document.getElementById('tour-roll-age');
        if (rollBtn) {
            rollBtn.textContent = 'CONTINUE';
            rollBtn.dataset.tourAction = 'next-step';
        }
    },

    selectLanguage(lang) {

        this.data.language = lang;
        this.nextStep();
    },

    selectTrinket(trinket) {
        this.data.trinket = trinket;
        this.nextStep();
    },

    toggleTrait(el, trait) {
        if (el.checked) {
            this.data.traits.push(trait);
        } else {
            this.data.traits = this.data.traits.filter(t => t !== trait);
        }
    },

    selectFeat(feat) {
        this.data.feat = feat;
    },

    finishTour(isGMMode = false) {
        this.syncName();
        
        // SPE: Sync rolled age to sheet and set starting EXP equal to age
        if (this.data.age) {
            const ageDisplay = document.getElementById('test-hud-detail-age');
            if (ageDisplay) ageDisplay.textContent = this.data.age;
            
            const expInput = document.getElementById('test-exp-input');
            if (expInput) {
                if (expInput.tagName === 'SPAN') expInput.textContent = this.data.age;
                else expInput.value = this.data.age;
            }

            const expValDisplay = document.getElementById('test-exp-value-display');
            if (expValDisplay) expValDisplay.textContent = this.data.age;
            
            if (window.MechanicsManager) {
                window.MechanicsManager.updateLevelFromExp();
            }
        }

        const tour = document.getElementById('creation-tour');
        if (!tour) return;

        tour.style.opacity = '0';
        setTimeout(() => this._completeTourCleanup(isGMMode), 500);
    },

    _completeTourCleanup(isGMMode) {
        const tour = document.getElementById('creation-tour');
        const mainContent = document.getElementById('mobile-sheet-view');
        if (!tour) return;

        tour.style.display = 'none';
        document.body.classList.remove('tour-active');
        if (!mainContent) return;

        if (window.InterfaceManager?.clearSplashTransparency) window.InterfaceManager.clearSplashTransparency();
        document.body.classList.add('char-sheet-active', 'on-test-page');
        if (window.InterfaceManager?.toggleHUD) window.InterfaceManager.toggleHUD(false);
        document.body.classList.remove('hud-expanded');
        
        mainContent.style.display = 'flex';
        setTimeout(() => this._finalizeSheetDisplay(isGMMode, mainContent), 50);
    },

    _finalizeSheetDisplay(isGMMode, mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
        
        if (isGMMode && window.GMManager?.activateGMMode) {
            window.GMManager.activateGMMode();
        } else if (window.GMManager?.setGMMode) {
            window.GMManager.setGMMode(false);
        }
        
        // Re-init listeners once sheet is visible
        if (window.StatsManager) window.StatsManager.init(this.signal);
        if (window.MobileActions) window.MobileActions.init(this.signal);
    },

    cleanup() {
        console.log('CreationTour: Cleanup called');
    }
};
