// ==================== 液体玻璃控制面板 ====================
class LiquidGlassControlPanel {
    constructor(targetElement, glassEffect) {
        this.targetElement = targetElement;
        this.glassEffect = glassEffect;
        this.panelElement = null;
        this.isVisible = true;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.createPanel();
        this.createControls();
        this.bindEvents();
    }
    
    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'liquid-glass-panel';
        panel.innerHTML = `
            <div class="liquid-glass-panel-header">
                <div class="liquid-glass-panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    液体玻璃控制台
                </div>
                <div class="liquid-glass-panel-actions">
                    <button class="liquid-glass-panel-btn" data-action="toggle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"/>
                        </svg>
                    </button>
                    <button class="liquid-glass-panel-btn" data-action="close">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="liquid-glass-panel-content">
                <div class="liquid-glass-panel-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>调整参数实时查看导航栏效果变化</span>
                </div>
                <div class="liquid-glass-panel-controls" id="liquid-glass-controls"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panelElement = panel;
    }
    
    createControls() {
        const container = this.panelElement.querySelector('#liquid-glass-controls');
        
        const controls = [
            {
                id: 'displacementScale',
                label: '位移强度',
                desc: '控制边缘扭曲和折射的强度',
                min: 0,
                max: 200,
                step: 1,
                value: this.glassEffect.options.displacementScale,
                color: 'blue'
            },
            {
                id: 'blurAmount',
                label: '模糊程度',
                desc: '控制背景模糊的强度（毛玻璃效果）',
                min: 0,
                max: 100,
                step: 1,
                value: this.glassEffect.options.blurAmount,
                color: 'green'
            },
            {
                id: 'saturation',
                label: '饱和度',
                desc: '控制背景颜色的饱和度',
                min: 100,
                max: 300,
                step: 10,
                value: this.glassEffect.options.saturation,
                color: 'purple',
                suffix: '%'
            },
            {
                id: 'aberrationIntensity',
                label: '色度像差',
                desc: '控制RGB通道分离强度（彩虹边缘效果）',
                min: 0,
                max: 20,
                step: 1,
                value: this.glassEffect.options.aberrationIntensity,
                color: 'cyan'
            },
            {
                id: 'elasticity',
                label: '弹性系数',
                desc: '控制玻璃跟随鼠标的弹性程度',
                min: 0,
                max: 1,
                step: 0.05,
                value: this.glassEffect.options.elasticity,
                color: 'orange'
            }
        ];
        
        controls.forEach(control => {
            const controlEl = document.createElement('div');
            controlEl.className = 'liquid-glass-control';
            controlEl.innerHTML = `
                <div class="liquid-glass-control-header">
                    <label class="liquid-glass-control-label">${control.label}</label>
                    <span class="liquid-glass-control-value liquid-glass-value-${control.color}" data-control="${control.id}">
                        ${this.formatValue(control.value, control)}
                    </span>
                </div>
                <input 
                    type="range" 
                    class="liquid-glass-slider" 
                    id="${control.id}" 
                    min="${control.min}" 
                    max="${control.max}" 
                    step="${control.step}" 
                    value="${control.value}"
                    data-color="${control.color}"
                />
                <p class="liquid-glass-control-desc">${control.desc}</p>
            `;
            
            container.appendChild(controlEl);
            
            // 绑定滑块事件
            const slider = controlEl.querySelector('input');
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.updateControl(control.id, value, control);
            });
        });
        
        // 添加预设按钮
        const presets = document.createElement('div');
        presets.className = 'liquid-glass-presets';
        presets.innerHTML = `
            <div class="liquid-glass-presets-title">快速预设</div>
            <div class="liquid-glass-presets-buttons">
                <button class="liquid-glass-preset-btn" data-preset="default">默认</button>
                <button class="liquid-glass-preset-btn" data-preset="strong">强效</button>
                <button class="liquid-glass-preset-btn" data-preset="subtle">柔和</button>
                <button class="liquid-glass-preset-btn" data-preset="rainbow">彩虹</button>
            </div>
        `;
        container.appendChild(presets);
    }
    
    formatValue(value, control) {
        if (control.step < 1) {
            return value.toFixed(2) + (control.suffix || '');
        }
        return Math.round(value) + (control.suffix || '');
    }
    
    updateControl(id, value, control) {
        // 更新显示值
        const valueDisplay = this.panelElement.querySelector(`[data-control="${id}"]`);
        if (valueDisplay) {
            valueDisplay.textContent = this.formatValue(value, control);
        }
        
        // 更新玻璃效果
        this.glassEffect.updateOptions({ [id]: value });
    }
    
    bindEvents() {
        // 折叠/展开
        const toggleBtn = this.panelElement.querySelector('[data-action="toggle"]');
        toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
        
        // 关闭
        const closeBtn = this.panelElement.querySelector('[data-action="close"]');
        closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        // 拖动
        const header = this.panelElement.querySelector('.liquid-glass-panel-header');
        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            this.startDrag(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.panelElement.style.cursor = '';
        });
        
        // 预设按钮
        this.panelElement.addEventListener('click', (e) => {
            const presetBtn = e.target.closest('[data-preset]');
            if (presetBtn) {
                this.applyPreset(presetBtn.dataset.preset);
            }
        });
        
        // 阻止面板内的滚动事件冒泡
        this.panelElement.addEventListener('wheel', (e) => {
            e.stopPropagation();
        });
    }
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.panelElement.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        this.panelElement.style.cursor = 'grabbing';
    }
    
    drag(e) {
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // 限制在视口内
        const maxX = window.innerWidth - this.panelElement.offsetWidth;
        const maxY = window.innerHeight - this.panelElement.offsetHeight;
        
        this.panelElement.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        this.panelElement.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        this.panelElement.style.right = 'auto';
        this.panelElement.style.bottom = 'auto';
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        const content = this.panelElement.querySelector('.liquid-glass-panel-content');
        const toggleBtn = this.panelElement.querySelector('[data-action="toggle"]');
        const toggleIcon = toggleBtn.querySelector('svg polyline');
        
        if (this.isVisible) {
            content.style.display = 'block';
            toggleIcon.setAttribute('points', '18 15 12 9 6 15');
            this.panelElement.classList.remove('collapsed');
        } else {
            content.style.display = 'none';
            toggleIcon.setAttribute('points', '6 9 12 15 18 9');
            this.panelElement.classList.add('collapsed');
        }
    }
    
    hide() {
        this.panelElement.style.display = 'none';
    }
    
    show() {
        this.panelElement.style.display = 'block';
    }
    
    applyPreset(preset) {
        const presets = {
            default: {
                displacementScale: 70,
                blurAmount: 30,
                saturation: 180,
                aberrationIntensity: 2,
                elasticity: 0.15
            },
            strong: {
                displacementScale: 150,
                blurAmount: 50,
                saturation: 250,
                aberrationIntensity: 10,
                elasticity: 0.5
            },
            subtle: {
                displacementScale: 30,
                blurAmount: 15,
                saturation: 120,
                aberrationIntensity: 0,
                elasticity: 0.05
            },
            rainbow: {
                displacementScale: 100,
                blurAmount: 40,
                saturation: 300,
                aberrationIntensity: 15,
                elasticity: 0.3
            }
        };
        
        const values = presets[preset];
        if (!values) return;
        
        // 更新滑块和显示
        Object.entries(values).forEach(([id, value]) => {
            const slider = this.panelElement.querySelector(`#${id}`);
            const valueDisplay = this.panelElement.querySelector(`[data-control="${id}"]`);
            const control = this.getControlConfig(id);
            
            if (slider) {
                slider.value = value;
            }
            if (valueDisplay && control) {
                valueDisplay.textContent = this.formatValue(value, control);
            }
        });
        
        // 更新玻璃效果
        this.glassEffect.updateOptions(values);
        
        // 添加动画反馈
        const buttons = this.panelElement.querySelectorAll('.liquid-glass-preset-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = this.panelElement.querySelector(`[data-preset="${preset}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            setTimeout(() => activeBtn.classList.remove('active'), 300);
        }
    }
    
    getControlConfig(id) {
        const configs = {
            displacementScale: { step: 1, suffix: '' },
            blurAmount: { step: 1, suffix: '' },
            saturation: { step: 10, suffix: '%' },
            aberrationIntensity: { step: 1, suffix: '' },
            elasticity: { step: 0.05, suffix: '' }
        };
        return configs[id];
    }
}

window.LiquidGlassControlPanel = LiquidGlassControlPanel;

