/**
 * @module DeochUtils
 * @description Pure, stateless shared utility functions for DOM manipulation, math, and icons.
 */
export const DeochUtils = {
    saveCharacter() {
        if (window.DataManager && typeof window.DataManager.saveCharacter === 'function') {
            window.DataManager.saveCharacter();
        } else {
            console.warn('DeochUtils: DataManager not ready for save.');
        }
    },
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
    qs: (sel, scope = document) => scope.querySelector(sel),
    qsa: (sel, scope = document) => Array.from(scope.querySelectorAll(sel)),

    addEvent: (sel, event, handler, options = {}) => {
        const el = typeof sel === 'string' ? document.getElementById(sel) : sel;
        if (el) el.addEventListener(event, handler, options);
    },

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

    getInt: (id, def = 0) => {
        const el = document.getElementById(id);
        if (!el) return def;
        const val = (el.textContent || el.value || '').toString().replace(/,/g, '');
        return parseInt(val) || def;
    },

    getFloat: (id, def = 0) => {
        const el = document.getElementById(id);
        if (!el) return def;
        return parseFloat(el.textContent || el.value) || def;
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
            } catch (_e) {
                console.warn('DeochUtils: JSON parse error for key ' + key, _e);
                return defaultValue;
            }
        },
        setJson: (key, value) => DeochUtils.Storage.set(key, JSON.stringify(value)),
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    },

    // --- Deoch Rule Formulas (Pure) ---

    calculateMod: (val) => Math.floor((val - 10) / 2),

    /**
     * Cryptographically secure random number between 0 (inclusive) and 1 (exclusive).
     */
    random: () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296,

    /**
     * Helper for smooth opacity transitions after display changes.
     */
    safeTransition: (el, display = 'block', opacity = '1', delay = 50) => {
        const target = typeof el === 'string' ? document.getElementById(el) : el;
        if (!target) return;
        target.style.display = display;
        setTimeout(() => { target.style.opacity = opacity; }, delay);
    },

    /**
     * Standardized character card rendering to unify Unified and Legacy galleries.
     */
    renderGalleryCard: (char, { activeId = null, variant = 'modern', isNew = false } = {}) => {
        const isActive = char?.id === activeId;
        const name = isNew ? 'Create New' : (char?.name || 'Unknown Hero');
        const meta = isNew ? 'Begin a new journey' : `Level ${char?.level || '1'} ${char?.primaryClass || 'Hero'}`;
        const icon = isNew ? 'plus' : 'user';

        if (variant === 'modern') {
            const card = document.createElement('div');
            card.className = 'test-gallery-card' + (isNew ? ' new-char' : '') + (isActive ? ' active' : '');
            card.innerHTML = `
                <div class="card-bg"></div>
                <div class="card-content">
                    <div class="char-avatar"><i data-lucide="${icon}"></i></div>
                    <div class="char-info">
                        <div class="char-name">${name}</div>
                        <div class="char-meta">${meta}</div>
                    </div>
                </div>
            `;
            return card;
        } else {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = `<i data-lucide="${icon}" style="width: 14px; height: 14px;"></i> ${name}`;
            return btn;
        }
    },

    /**
     * Unified character creation trigger.
     */
    newHero: () => {
        if (window.DataManager) window.DataManager.newCharacter();
    },

    /**
     * Unified character save trigger.
     */
    saveHero: () => {
        if (window.DataManager) window.DataManager.saveCharacter();
    }
};
