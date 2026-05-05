/**
 * Deoch TTRPG - Main Entry Point (ES Module Version)
 * Global Script Architecture v2.0 - Authority Modules
 */
window.SUSPEND_SAVING = false;

import { DiceRoller } from './gamejs/dice-roller.js';
import { CreationTour } from './gamejs/tour.js';
import { DeochUtils } from './gamejs/DeochUtils.js';
import { DataManager } from './gamejs/DataManager.js';
import { StatManager } from './gamejs/StatManager.js';
import { VitalsManager, HealthOrbShader } from './gamejs/orbs.js';
import { GMManager } from './gamejs/GMManager.js';
import { MechanicsManager } from './gamejs/MechanicsManager.js';
import { InterfaceManager } from './gamejs/InterfaceManager.js';

// Global Bridge for Legacy/Inline Event Handlers
window.DiceRoller = DiceRoller;
window.VitalsManager = VitalsManager;
window.StatsManager = StatManager;
window.MobileActions = StatManager;
window.CreationTour = CreationTour;
window.DeochUtils = DeochUtils;
window.DataManager = DataManager;
window.HealthOrbShader = HealthOrbShader;
window.GMManager = GMManager;
window.MechanicsManager = MechanicsManager;
window.InterfaceManager = InterfaceManager;

window.navigateTo = (id) => InterfaceManager.navigateTo(id);

// Tour Bridges
window.nextTourStep = () => CreationTour.nextStep();
window.prevTourStep = () => CreationTour.prevStep();
window.finishTour = () => CreationTour.finishTour();
window.resetTour = () => CreationTour.resetTour();
window.selectTourRace = (race) => CreationTour.selectRace(race);
window.selectTourHeritage = (id, name) => CreationTour.selectHeritage(id, name);
window.rollTourAge = () => CreationTour.rollAge();
window.selectTourLanguage = (lang) => CreationTour.selectLanguage(lang);
window.selectTourTrinket = (trinket) => CreationTour.selectTrinket(trinket);
window.toggleTourTrait = (el, trait) => CreationTour.toggleTrait(el, trait);
window.selectTourFeat = (feat) => CreationTour.selectFeat(feat);

class App {
    constructor() {
        this.initialized = false;
        this.testPageInitialized = false;
        this.lifecycle = new AbortController();
        this.signal = this.lifecycle.signal;
    }

    init() {
        if (this.initialized) return;

        console.log('Deoch App: Initializing...');

        window.ensureTestPageInitialized = () => this.initTestPage();

        // 1. Core Services (DataManager MUST be first)
        DataManager.init(null, this.signal);
        InterfaceManager.init(null, this.signal); // Navigation & HUD
        
        // 2. UI Components
        DiceRoller.init(this.signal);

        // 3. Initial Data Load
        DataManager.updateLegacyGallery();
        DeochUtils.queueIconRefresh();

        this.initialized = true;
        console.log('Deoch App: Ready.');
    }

    initTestPage() {
        if (this.testPageInitialized) return;

        // Visuals can be deferred
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => this.initVisuals());
        } else {
            setTimeout(() => this.initVisuals(), 100);
        }

        // 4. Page-Specific Orchestration

        // 4. Page-Specific Orchestration
        StatManager.init(null, this.signal);
        MechanicsManager.init(null, this.signal);
        GMManager.init(null, this.signal);
        CreationTour.init(this.signal);

        if (window.VitalsManager) window.VitalsManager.init(this.signal);

        // Load the last character
        DataManager.loadLastCharacter();

        DeochUtils.queueIconRefresh();

        this.testPageInitialized = true;
    }

    initVisuals() {
        const healthCanvas = document.getElementById('health-orb-canvas');
        const hudHealthCanvas = document.getElementById('hud-health-orb-canvas');
        const manaCanvas = document.getElementById('mana-orb-canvas');
        const hudManaCanvas = document.getElementById('hud-mana-orb-canvas');
        const hudStaminaCanvas = document.getElementById('hud-stamina-orb-canvas');

        if (healthCanvas) window.healthOrbShader = new HealthOrbShader('health-orb-canvas', 'health');
        if (hudHealthCanvas) window.hudHealthOrbShader = new HealthOrbShader('hud-health-orb-canvas', 'health');
        if (manaCanvas) window.manaOrbShader = new HealthOrbShader('mana-orb-canvas', 'mana');
        if (hudManaCanvas) window.hudManaOrbShader = new HealthOrbShader('hud-mana-orb-canvas', 'mana');
        if (hudStaminaCanvas) window.hudStaminaOrbShader = new HealthOrbShader('hud-stamina-orb-canvas', 'stamina');
    }

    cleanup() {
        console.log('Deoch App: Cleaning up...');
        this.lifecycle.abort();
        
        [
            DataManager, DiceRoller, VitalsManager, StatManager, 
            CreationTour, MechanicsManager, InterfaceManager
        ].forEach(m => {
            if (m.cleanup) m.cleanup();
        });

        this.lifecycle = new AbortController();
        this.signal = this.lifecycle.signal;
        this.initialized = false;
        this.testPageInitialized = false;
    }
}

// Start the app
const deochApp = new App();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => deochApp.init(), { signal: deochApp.signal });
} else {
    deochApp.init();
}
