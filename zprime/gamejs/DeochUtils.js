/**
 * @module DeochUtils
 * @description Pure, stateless shared utility functions for DOM manipulation, math, and icons.
 */
export const DeochUtils = {
    _iconRefreshScheduled: false,

    /**
     * Schedules a Lucide icon refresh on the next animation frame.
     */
    queueIconRefresh: () => {
        if (DeochUtils._iconRefreshScheduled) return;
        if (!window.lucide || typeof window.lucide.createIcons !== 'function') return;

        DeochUtils._iconRefreshScheduled = true;
        requestAnimationFrame(() => {
            DeochUtils._iconRefreshScheduled = false;
            window.lucide.createIcons();
        });
    },

    // --- DOM Helpers ---

    getElement: (id) => document.getElementById(id),

    setText: (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    setValue: (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },

    setChecked: (id, checked) => {
        const el = document.getElementById(id);
        if (el) el.checked = checked;
    },

    toggleDisplay: (id, isVisible, visibleValue = 'block') => {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.style.display = isVisible ? visibleValue : 'none';
    },

    // --- Deoch Rule Formulas (Pure) ---

    calculateMod: (val) => Math.floor((val - 10) / 2),

    calculateLevelFromExp: (exp) => {
        return Math.floor((-1 + Math.sqrt(1 + exp / 62.5)) / 2);
    },

    calculateExpForLevel: (level) => {
        return 250 * level * (level + 1);
    }
};
