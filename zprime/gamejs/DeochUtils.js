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

    smartSet: (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            el.textContent = value;
        }
    },

    showFeedback: (id, message, iconName = 'check') => {
        const btn = document.getElementById(id);
        if (!btn) return;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="${iconName}"></i> ${message}`;
        DeochUtils.queueIconRefresh();
        setTimeout(() => {
            btn.innerHTML = originalText;
            DeochUtils.queueIconRefresh();
        }, 2000);
    },

    toggleDisplay: (id, isVisible, visibleValue = 'block') => {
        const el = typeof id === 'string' ? document.getElementById(id) : id;
        if (el) el.style.display = isVisible ? visibleValue : 'none';
    },

    // --- Storage Wrappers ---

    Storage: {
        get: (key, defaultValue = null) => {
            try {
                const val = localStorage.getItem(key);
                return val !== null ? val : defaultValue;
            } catch (e) {
                console.error(`DeochUtils: Storage error reading "${key}"`, e);
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.error(`DeochUtils: Storage error writing "${key}"`, e);
                return false;
            }
        },
        getJson: (key, defaultValue = null) => {
            const val = DeochUtils.Storage.get(key);
            if (!val) return defaultValue;
            try {
                return JSON.parse(val);
            } catch (e) {
                return defaultValue;
            }
        },
        setJson: (key, value) => DeochUtils.Storage.set(key, JSON.stringify(value)),
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
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
