import { DeochUtils } from './DeochUtils.js';

/**
 * @class HealthOrbShader
 * @description Ultra-Premium Health/Mana Orb Shader. Spherical UV Projection, Domain Warping FBM, and Dual-Layer Colors.
 */
export class HealthOrbShader {
    constructor(canvasId, type = 'health') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        const rect = this.canvas.getBoundingClientRect();
        const baseWidth = rect.width || parseInt(this.canvas.getAttribute('width')) || 110;
        const baseHeight = rect.height || parseInt(this.canvas.getAttribute('height')) || 110;

        this.canvas.width = baseWidth * dpr;
        this.canvas.height = baseHeight * dpr;
        this.canvas.style.width = `${baseWidth}px`;
        this.canvas.style.height = `${baseHeight}px`;

        this.gl = this.canvas.getContext('webgl', { alpha: true });
        if (!this.gl) return;

        this.type = type;
        this.health = 0.5;
        this.tempHealth = 0.0;
        this.targetHealth = 0.5;
        this.targetTempHealth = 0.0;
        this.time = 0;

        this.colors = {
            health: {
                base: [0.2, 0, 0],
                deep: [0.2, 0.0, 0.0],
                glow: [1, 0.3, 0.3],
                temp: [0.0, 0.7, 0.15],
                tempGlow: [0.4, 1.0, 0.6]
            },
            mana: {
                base: [0.0, 0.1, 0.4],
                deep: [0.0, 0.02, 0.1],
                glow: [0.3, 0.8, 1.0],
                temp: [0.0, 0.0, 0.0],
                tempGlow: [0.0, 0.0, 0.0]
            },
            stamina: {
                base: [0.0, 0.0, 0.0],
                deep: [0, 0, 0],
                glow: [1, 1, 1],
                temp: [0.0, 0.0, 0.0],
                tempGlow: [0.0, 0.0, 0.0]
            }
        }[type];

        this.init();
        this.animate();
    }

    init() {
        const vs = `
            attribute vec2 position;
            varying vec2 v_uv;
            void main() {
                v_uv = position * 0.5 + 0.5;
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fs = `
            precision highp float;
            varying vec2 v_uv;
            uniform float u_time;
            uniform float u_health;
            uniform float u_tempHealth;
            uniform vec3 u_colBase;
            uniform vec3 u_colDeep;
            uniform vec3 u_colGlow;
            uniform vec3 u_colTemp;
            uniform vec3 u_colTempGlow;

            #define PI 3.14159265359

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                for (int i = 0; i < 4; i++) {
                    v += a * noise(p);
                    p *= 2.1;
                    a *= 0.5;
                }
                return v;
            }

            float pattern(vec2 p) {
                vec2 q = vec2(fbm(p + vec2(0.0, 0.0)), fbm(p + vec2(5.2, 1.3)));
                vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2)), fbm(p + 4.0 * q + vec2(8.3, 2.8)));
                return fbm(p + 4.0 * r);
            }

            void main() {
                vec2 uv = v_uv;
                vec2 p = (uv - 0.5) * 2.0; 
                float r = length(p);

                if (r > 0.98) discard;

                float z = sqrt(max(0.0, 1.0 - r * r));
                vec2 sphereUv = vec2(atan(p.x, z) / PI + 0.5, asin(p.y) / PI + 0.5);

                vec3 colBackdrop = mix(vec3(0.05, 0.0, 0.02), vec3(0.1, 0.02, 0.05), p.y * 0.5 + 0.5);
                float motion = pattern(sphereUv * 3.0 + vec2(u_time * 0.4, u_time * 0.2));
                float wave = sin(p.x * 4.0 + u_time * 1.2) * 0.015;
                float thresholdTemp = (u_tempHealth * 2.0) - 1.0 + (wave * 1.1) + (motion * 0.08);
                float fillLevel = max(u_health, u_tempHealth);
                float threshold = (fillLevel * 2.0) - 1.0 + wave + motion * 0.05;
                
                float softness = 0.25;
                float isLiquid = smoothstep(softness, -softness, p.y - threshold);
                
                vec3 colVapor = u_colGlow * 0.3 * pattern(sphereUv * 3.0 + u_time * 0.15);
                vec3 colEmpty = mix(colBackdrop, colVapor, 0.4);

                vec3 colLiquid = vec3(0.0);
                if (isLiquid > 0.0) {
                    float depth = smoothstep(threshold, -1.0, p.y);
                    vec3 redCol = mix(u_colBase, u_colDeep, depth);
                    vec3 greenCol = mix(u_colTemp, vec3(0.0, 0.1, 0.02), depth);
                    float isTempZone = smoothstep(softness, -softness, p.y - thresholdTemp);
                    colLiquid = mix(redCol, greenCol, isTempZone);
                    
                    float churn = pattern(sphereUv * 8.0 - u_time * 0.8);
                    float glowWeight = clamp((u_tempHealth - u_health) * 10.0 + 0.5, 0.0, 1.0);
                    vec3 currentGlow = mix(u_colGlow, u_colTempGlow, glowWeight);
                    
                    colLiquid += currentGlow * churn * 0.8 * (1.0 - depth);
                    float surfaceFactor = smoothstep(0.1, 0.0, abs(p.y - threshold));
                    colLiquid += currentGlow * surfaceFactor * (1.2 + churn * 1.2);
                    
                    float bubbleNoise = fbm(sphereUv * 25.0 - vec2(0.0, u_time * 2.0));
                    float bubble = smoothstep(0.6, 1.0, bubbleNoise) * smoothstep(1.0, 0.0, depth);
                    colLiquid += currentGlow * bubble * 1.0;
                }

                vec3 color = mix(colEmpty, colLiquid, isLiquid);
                float nz = sqrt(max(0.0, 1.0 - dot(p, p)));
                vec3 normal = normalize(vec3(p.x, p.y, nz));
                vec3 viewDir = vec3(0.0, 0.0, 1.0);
                vec3 lightDir = normalize(vec3(0.65, 0.7, 0.6));
                vec3 halfVec  = normalize(lightDir + viewDir);
                float NdotL   = max(0.0, dot(normal, lightDir));
                float NdotH   = max(0.0, dot(normal, halfVec));
                float NdotV   = max(0.0, dot(normal, viewDir));

                color *= mix(0.5, 1.0, NdotL);
                float edgeDarken = pow(NdotV, 0.4);
                color *= edgeDarken;

                float specWide = pow(NdotH, 12.0);
                color += vec3(1.0, 0.97, 0.93) * specWide * 0.12;
                float specTight = pow(NdotH, 90.0);
                color += vec3(1.0, 0.99, 0.98) * specTight * 0.55;

                vec3 causticLight = normalize(vec3(0.55, 0.8, 0.6));
                vec3 causticHalf  = normalize(causticLight + viewDir);
                float causticNdotH = max(0.0, dot(normal, causticHalf));
                float causticRing = pow(causticNdotH, 8.0) * (1.0 - pow(causticNdotH, 35.0));
                color += vec3(1.0, 0.96, 0.9) * causticRing * 0.135;

                float fresnel = pow(1.0 - NdotV, 2.5);
                color += u_colGlow * fresnel * 0.25;

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.program = this.createProgram(vs, fs);
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), this.gl.STATIC_DRAW);
    }

    createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vsSource);
        gl.compileShader(vs);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    }

    setHealth(val, temp = 0.0) {
        this.targetHealth = val;
        this.targetTempHealth = temp;
    }

    animate() {
        this.time += 0.016;
        this.health += (this.targetHealth - this.health) * 0.2;
        this.tempHealth += (this.targetTempHealth - this.tempHealth) * 0.2;

        const gl = this.gl;
        if (!gl) return;
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);

        const posLoc = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(gl.getUniformLocation(this.program, 'u_time'), this.time);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_health'), this.health);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_tempHealth'), this.tempHealth);

        gl.uniform3fv(gl.getUniformLocation(this.program, 'u_colBase'), this.colors.base);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'u_colDeep'), this.colors.deep);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'u_colGlow'), this.colors.glow);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'u_colTemp'), this.colors.temp);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'u_colTempGlow'), this.colors.tempGlow);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * @module VitalsManager
 * @description Orchestrates health, mana, and stamina state and synchronization with orbs.
 */
export const VitalsManager = {
    lastKnownHP: null,
    isAnimating: false,

    init(signal) {
        this.signal = signal;
        if (this.signal) {
            this.signal.addEventListener('abort', () => this.cleanup(), { signal: this.signal });
        }
        this.initListeners();
        if (!this.isAnimating) {
            this.isAnimating = true;
            this._runAnimation();
        }
    },

    initListeners() {
        const container = document.getElementById('floating-vitality-orbs');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.orb-control-btn, .orb-touch-zone');
            if (!btn) return;

            const stat = btn.getAttribute('data-stat');
            const delta = parseInt(btn.getAttribute('data-delta')) || 0;
            if (stat && delta !== 0) {
                this.adjust(stat, delta);
            }
        }, { signal: this.signal });
    },

    _runAnimation() {
        if (!this.isAnimating) return;
        this.animateOrbs();
        this._animationId = requestAnimationFrame(() => this._runAnimation());
    },

    cleanup() {
        this.isAnimating = false;
        if (this._animationId) cancelAnimationFrame(this._animationId);
        console.log('VitalsManager: Cleanup called');
    },

    adjust(type, delta) {
        if (type === 'hp' || type === 'health') {
            this.adjustHP(delta);
            this.triggerSlosh('.health-orb');
            this.checkDeathStatus();
        } else if (type === 'temp-hp') {
            const max = window.mobileMaxHp || 24;
            window.mobileTargetTempHp = Math.max(0, Math.min(max * 2, (window.mobileTargetTempHp || 0) + delta));
        } else if (type === 'stamina' || type === 'sp') {
            const max = window.mobileMaxSp || 10;
            window.mobileTargetSp = Math.max(0, Math.min(max, (window.mobileTargetSp || 0) + delta));
            this.triggerSlosh('.stamina-orb');
        } else if (type === 'mana' || type === 'mp') {
            const max = window.mobileMaxMp || 12;
            window.mobileTargetMp = Math.max(0, Math.min(max, (window.mobileTargetMp || 0) + delta));
            this.triggerSlosh('.mana-orb');
        }
        this.syncToMainSheet();
        if (window.DataManager) window.DataManager.saveCharacter();
    },

    adjustHP(delta) {
        if (!window.MechanicsManager) return;
        const max = window.mobileMaxHp || 24;
        const currentHp = window.mobileTargetHp || 0;
        const currentTemp = window.mobileTargetTempHp || 0;
        
        const result = window.MechanicsManager.calculateHPChange(currentHp, currentTemp, delta, max);
        window.mobileTargetHp = result.hp;
        window.mobileTargetTempHp = result.temp;
    },

    updateMaxStat(stat) {
        if (stat === 'hp') {
            const input = document.getElementById('hud-max-hp-input');
            if (!input) return;
            const val = Math.max(1, parseInt(input.value) || 1);
            window.mobileMaxHp = val;
            if (window.mobileTargetHp === undefined) window.mobileTargetHp = val;
            if (window.mobileDisplayHp === undefined) window.mobileDisplayHp = val;
            if (window.mobileDisplayTempHp === undefined) window.mobileDisplayTempHp = 0;
            if (window.mobileTargetHp > val) { window.mobileTargetHp = val; window.mobileDisplayHp = val; }
        } else if (stat === 'sp') {
            const input = document.getElementById('mobile-max-sp-input');
            if (!input) return;
            const val = parseInt(input.value) || 0;
            window.mobileMaxSp = val;
            const spOrb = document.querySelector('.orb-group.sp-group');
            if (spOrb) spOrb.style.display = val > 0 ? 'flex' : 'none';
            if (val > 0) {
                if (window.mobileTargetSp === undefined) window.mobileTargetSp = val;
                if (window.mobileTargetSp > val) window.mobileTargetSp = val;
            }
        } else if (stat === 'mp') {
            const input = document.getElementById('hud-max-mp-input');
            if (!input) return;
            const val = parseInt(input.value) || 0;
            window.mobileMaxMp = val;
            const mpOrb = document.querySelector('.orb-group.mp-group');
            if (mpOrb) mpOrb.style.display = val > 0 ? 'flex' : 'none';
            if (val > 0) {
                if (window.mobileTargetMp === undefined) window.mobileTargetMp = val;
                if (window.mobileDisplayMp === undefined) window.mobileDisplayMp = val;
                if (window.mobileTargetMp > val) { window.mobileTargetMp = val; window.mobileDisplayMp = val; }
            }
        }
        this.syncToMainSheet();
        if (window.DataManager) window.DataManager.saveCharacter();
    },

    triggerSlosh(selector) {
        const orbContainer = document.querySelector(selector);
        if (orbContainer) {
            orbContainer.classList.remove('sloshing');
            void orbContainer.offsetWidth;
            orbContainer.classList.add('sloshing');
        }
    },

    syncToMainSheet() {
        const hpInput = document.getElementById('char-hp');
        const mpInput = document.getElementById('char-mana');
        if (hpInput) { hpInput.value = window.mobileTargetHp; hpInput.dispatchEvent(new Event('change', { bubbles: true })); }
        if (mpInput) { mpInput.value = window.mobileTargetMp; mpInput.dispatchEvent(new Event('change', { bubbles: true })); }
    },

    animateOrbs() {
        window.mobileDisplayHp = window.mobileDisplayHp || 0;
        window.mobileTargetHp = window.mobileTargetHp || 0;
        window.mobileDisplayHp += (window.mobileTargetHp - window.mobileDisplayHp) * 0.1;
        if (Math.abs(window.mobileDisplayHp - window.mobileTargetHp) < 0.05) window.mobileDisplayHp = window.mobileTargetHp;
        
        window.mobileDisplayTempHp = window.mobileDisplayTempHp || 0;
        window.mobileTargetTempHp = window.mobileTargetTempHp || 0;
        window.mobileDisplayTempHp += (window.mobileTargetTempHp - window.mobileDisplayTempHp) * 0.1;
        if (Math.abs(window.mobileDisplayTempHp - window.mobileTargetTempHp) < 0.05) window.mobileDisplayTempHp = window.mobileTargetTempHp;

        window.mobileDisplayMp = window.mobileDisplayMp || 0;
        window.mobileTargetMp = window.mobileTargetMp || 0;
        window.mobileDisplayMp += (window.mobileTargetMp - window.mobileDisplayMp) * 0.1;
        if (Math.abs(window.mobileDisplayMp - window.mobileTargetMp) < 0.05) window.mobileDisplayMp = window.mobileTargetMp;

        window.mobileDisplaySp = window.mobileDisplaySp || 0;
        window.mobileTargetSp = window.mobileTargetSp || 0;
        window.mobileDisplaySp += (window.mobileTargetSp - window.mobileDisplaySp) * 0.1;
        if (Math.abs(window.mobileDisplaySp - window.mobileTargetSp) < 0.05) window.mobileDisplaySp = window.mobileTargetSp;

        const maxHp = window.mobileMaxHp || 1;
        const maxMp = window.mobileMaxMp || 1;
        const maxSp = window.mobileMaxSp || 1;

        if (window.healthOrbShader) window.healthOrbShader.setHealth(window.mobileDisplayHp / maxHp, window.mobileDisplayTempHp / maxHp);
        if (window.hudHealthOrbShader) window.hudHealthOrbShader.setHealth(window.mobileDisplayHp / maxHp, window.mobileDisplayTempHp / maxHp);
        if (window.hudManaOrbShader) window.hudManaOrbShader.setHealth(window.mobileDisplayMp / maxMp);
        if (window.hudStaminaOrbShader) window.hudStaminaOrbShader.setHealth(window.mobileDisplaySp / maxSp);
        
        const totalHp = Math.round(window.mobileDisplayHp + window.mobileDisplayTempHp);
        const hpText = document.getElementById('hud-hp-text');
        if (hpText) {
            hpText.textContent = totalHp;
            hpText.style.color = window.mobileDisplayTempHp > 0.5 ? '#16a34a' : '#ffffff';
        }
        const mpText = document.getElementById('hud-mp-text');
        if (mpText) mpText.textContent = Math.round(window.mobileDisplayMp);
        const spText = document.getElementById('hud-sp-text');
        if (spText) spText.textContent = Math.round(window.mobileDisplaySp);
    },

    showDeathPrompt(isMercy) {
        const dialog = document.getElementById('death-mercy-dialog');
        const deathTitle = document.getElementById('death-mercy-title');
        const deathText = document.getElementById('death-mercy-text');
        const deathIconContainer = document.getElementById('death-mercy-icon-container');
        const deathClose = document.getElementById('death-mercy-close');

        if (!dialog) return;

        const config = isMercy ? {
            title: 'MERCY', titleColor: 'var(--accent-primary)', titleShadow: '0 0 20px var(--accent-glow)',
            message: 'Inspiration has saved you from the brink. You cling to life with 1 HP remaining.',
            icon: 'sparkles', iconColor: 'var(--accent-primary)', borderColor: 'var(--accent-primary)',
            boxShadow: '0 0 50px var(--accent-glow)', closeText: 'I LIVE ON', closeBg: 'var(--accent-primary)',
        } : {
            title: 'YOU ARE DEAD', titleColor: 'var(--color-danger)', titleShadow: '0 0 20px var(--color-danger-glow-strong)',
            message: 'The darkness claims your soul. This character has met their end.',
            icon: 'skull', iconColor: 'var(--color-danger)', borderColor: 'var(--color-danger)',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.3)', closeText: 'ACCEPT FATE', closeBg: 'var(--color-danger)',
        };

        if (deathTitle) {
            deathTitle.textContent = config.title;
            deathTitle.style.color = config.titleColor;
            deathTitle.style.textShadow = config.titleShadow;
        }
        if (deathText) deathText.textContent = config.message;
        if (deathClose) {
            deathClose.textContent = config.closeText;
            deathClose.style.background = config.closeBg;
        }
        dialog.style.borderColor = config.borderColor;
        dialog.style.boxShadow = config.boxShadow;
        
        const currentIcon = deathIconContainer?.querySelector('i, svg');
        if (currentIcon) currentIcon.setAttribute('data-lucide', config.icon);
        if (deathIconContainer) deathIconContainer.style.color = config.iconColor;

        if (isMercy) {
            window.mobileTargetHp = 1;
            this.syncToMainSheet();
            const inspCheckbox = document.getElementById('test-hud-inspiration') || document.getElementById('char-insp-1');
            if (inspCheckbox) {
                inspCheckbox.checked = false;
                inspCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
            this.lastKnownHP = 1;
        }

        DeochUtils.queueIconRefresh();
        dialog.showModal();
    },

    checkDeathStatus() {
        const currentHP = window.mobileTargetHp;
        if (this.lastKnownHP === null) { this.lastKnownHP = currentHP; return; }
        if (currentHP === 0 && this.lastKnownHP > 0) {
            const isInspired = document.getElementById('test-insp-1')?.checked;
            this.showDeathPrompt(isInspired);
        }
        this.lastKnownHP = currentHP;
    }
};
