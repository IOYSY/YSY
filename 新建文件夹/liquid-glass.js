// ==================== 液体玻璃效果系统 ====================
class LiquidGlassEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            displacementScale: options.displacementScale || 70,
            blurAmount: options.blurAmount || 30,
            saturation: options.saturation || 180,
            aberrationIntensity: options.aberrationIntensity || 2,
            elasticity: options.elasticity || 0.15,
            mode: options.mode || 'standard',
            ...options
        };
        
        this.mousePos = { x: 0, y: 0 };
        this.mouseOffset = { x: 0, y: 0 };
        this.isHovered = false;
        this.filterId = `liquid-glass-filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.init();
    }
    
    init() {
        // 添加liquid-glass类
        this.element.classList.add('liquid-glass-container');
        
        // 创建SVG滤镜
        this.createSVGFilter();
        
        // 创建玻璃层
        this.createGlassLayers();
        
        // 应用样式
        this.applyStyles();
        
        // 绑定事件
        this.bindEvents();
    }
    
    createSVGFilter() {
        // 创建SVG元素
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.setAttribute('aria-hidden', 'true');
        
        // 获取位移贴图URL
        const displacementMapUrl = this.getDisplacementMap();
        
        // 创建滤镜定义
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // 边缘遮罩渐变
        const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        radialGradient.setAttribute('id', `${this.filterId}-edge-mask`);
        radialGradient.setAttribute('cx', '50%');
        radialGradient.setAttribute('cy', '50%');
        radialGradient.setAttribute('r', '50%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', 'black');
        stop1.setAttribute('stop-opacity', '0');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', `${Math.max(30, 80 - this.options.aberrationIntensity * 2)}%`);
        stop2.setAttribute('stop-color', 'black');
        stop2.setAttribute('stop-opacity', '0');
        
        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('stop-color', 'white');
        stop3.setAttribute('stop-opacity', '1');
        
        radialGradient.appendChild(stop1);
        radialGradient.appendChild(stop2);
        radialGradient.appendChild(stop3);
        
        // 创建滤镜
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', this.filterId);
        filter.setAttribute('x', '-35%');
        filter.setAttribute('y', '-35%');
        filter.setAttribute('width', '170%');
        filter.setAttribute('height', '170%');
        filter.setAttribute('color-interpolation-filters', 'sRGB');
        
        // 位移贴图图像
        const feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
        feImage.setAttribute('x', '0');
        feImage.setAttribute('y', '0');
        feImage.setAttribute('width', '100%');
        feImage.setAttribute('height', '100%');
        feImage.setAttribute('result', 'DISPLACEMENT_MAP');
        feImage.setAttribute('href', displacementMapUrl);
        feImage.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        
        // 边缘强度
        const feColorMatrix1 = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrix1.setAttribute('in', 'DISPLACEMENT_MAP');
        feColorMatrix1.setAttribute('type', 'matrix');
        feColorMatrix1.setAttribute('values', `0.3 0.3 0.3 0 0
                                                0.3 0.3 0.3 0 0
                                                0.3 0.3 0.3 0 0
                                                0 0 0 1 0`);
        feColorMatrix1.setAttribute('result', 'EDGE_INTENSITY');
        
        // 边缘遮罩
        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        feComponentTransfer.setAttribute('in', 'EDGE_INTENSITY');
        feComponentTransfer.setAttribute('result', 'EDGE_MASK');
        
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'discrete');
        feFuncA.setAttribute('tableValues', `0 ${this.options.aberrationIntensity * 0.05} 1`);
        feComponentTransfer.appendChild(feFuncA);
        
        // 中心原图
        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('in', 'SourceGraphic');
        feOffset.setAttribute('dx', '0');
        feOffset.setAttribute('dy', '0');
        feOffset.setAttribute('result', 'CENTER_ORIGINAL');
        
        // 红色通道位移
        const feDisplacementMapR = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        feDisplacementMapR.setAttribute('in', 'SourceGraphic');
        feDisplacementMapR.setAttribute('in2', 'DISPLACEMENT_MAP');
        feDisplacementMapR.setAttribute('scale', String(-this.options.displacementScale));
        feDisplacementMapR.setAttribute('xChannelSelector', 'R');
        feDisplacementMapR.setAttribute('yChannelSelector', 'B');
        feDisplacementMapR.setAttribute('result', 'RED_DISPLACED');
        
        const feColorMatrixR = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixR.setAttribute('in', 'RED_DISPLACED');
        feColorMatrixR.setAttribute('type', 'matrix');
        feColorMatrixR.setAttribute('values', `1 0 0 0 0
                                                0 0 0 0 0
                                                0 0 0 0 0
                                                0 0 0 1 0`);
        feColorMatrixR.setAttribute('result', 'RED_CHANNEL');
        
        // 绿色通道位移
        const feDisplacementMapG = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        feDisplacementMapG.setAttribute('in', 'SourceGraphic');
        feDisplacementMapG.setAttribute('in2', 'DISPLACEMENT_MAP');
        feDisplacementMapG.setAttribute('scale', String(-this.options.displacementScale - this.options.aberrationIntensity * 0.05 * this.options.displacementScale));
        feDisplacementMapG.setAttribute('xChannelSelector', 'R');
        feDisplacementMapG.setAttribute('yChannelSelector', 'B');
        feDisplacementMapG.setAttribute('result', 'GREEN_DISPLACED');
        
        const feColorMatrixG = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixG.setAttribute('in', 'GREEN_DISPLACED');
        feColorMatrixG.setAttribute('type', 'matrix');
        feColorMatrixG.setAttribute('values', `0 0 0 0 0
                                                0 1 0 0 0
                                                0 0 0 0 0
                                                0 0 0 1 0`);
        feColorMatrixG.setAttribute('result', 'GREEN_CHANNEL');
        
        // 蓝色通道位移
        const feDisplacementMapB = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        feDisplacementMapB.setAttribute('in', 'SourceGraphic');
        feDisplacementMapB.setAttribute('in2', 'DISPLACEMENT_MAP');
        feDisplacementMapB.setAttribute('scale', String(-this.options.displacementScale - this.options.aberrationIntensity * 0.1 * this.options.displacementScale));
        feDisplacementMapB.setAttribute('xChannelSelector', 'R');
        feDisplacementMapB.setAttribute('yChannelSelector', 'B');
        feDisplacementMapB.setAttribute('result', 'BLUE_DISPLACED');
        
        const feColorMatrixB = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        feColorMatrixB.setAttribute('in', 'BLUE_DISPLACED');
        feColorMatrixB.setAttribute('type', 'matrix');
        feColorMatrixB.setAttribute('values', `0 0 0 0 0
                                                0 0 0 0 0
                                                0 0 1 0 0
                                                0 0 0 1 0`);
        feColorMatrixB.setAttribute('result', 'BLUE_CHANNEL');
        
        // 混合通道
        const feBlend1 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
        feBlend1.setAttribute('in', 'GREEN_CHANNEL');
        feBlend1.setAttribute('in2', 'BLUE_CHANNEL');
        feBlend1.setAttribute('mode', 'screen');
        feBlend1.setAttribute('result', 'GB_COMBINED');
        
        const feBlend2 = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
        feBlend2.setAttribute('in', 'RED_CHANNEL');
        feBlend2.setAttribute('in2', 'GB_COMBINED');
        feBlend2.setAttribute('mode', 'screen');
        feBlend2.setAttribute('result', 'RGB_COMBINED');
        
        // 轻微模糊
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'RGB_COMBINED');
        feGaussianBlur.setAttribute('stdDeviation', String(Math.max(0.1, 0.5 - this.options.aberrationIntensity * 0.1)));
        feGaussianBlur.setAttribute('result', 'ABERRATED_BLURRED');
        
        // 应用边缘遮罩
        const feComposite1 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite1.setAttribute('in', 'ABERRATED_BLURRED');
        feComposite1.setAttribute('in2', 'EDGE_MASK');
        feComposite1.setAttribute('operator', 'in');
        feComposite1.setAttribute('result', 'EDGE_ABERRATION');
        
        // 反转遮罩
        const feComponentTransfer2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        feComponentTransfer2.setAttribute('in', 'EDGE_MASK');
        feComponentTransfer2.setAttribute('result', 'INVERTED_MASK');
        
        const feFuncA2 = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA2.setAttribute('type', 'table');
        feFuncA2.setAttribute('tableValues', '1 0');
        feComponentTransfer2.appendChild(feFuncA2);
        
        const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite2.setAttribute('in', 'CENTER_ORIGINAL');
        feComposite2.setAttribute('in2', 'INVERTED_MASK');
        feComposite2.setAttribute('operator', 'in');
        feComposite2.setAttribute('result', 'CENTER_CLEAN');
        
        // 最终合成
        const feComposite3 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite3.setAttribute('in', 'EDGE_ABERRATION');
        feComposite3.setAttribute('in2', 'CENTER_CLEAN');
        feComposite3.setAttribute('operator', 'over');
        
        // 组装滤镜
        filter.appendChild(feImage);
        filter.appendChild(feColorMatrix1);
        filter.appendChild(feComponentTransfer);
        filter.appendChild(feOffset);
        filter.appendChild(feDisplacementMapR);
        filter.appendChild(feColorMatrixR);
        filter.appendChild(feDisplacementMapG);
        filter.appendChild(feColorMatrixG);
        filter.appendChild(feDisplacementMapB);
        filter.appendChild(feColorMatrixB);
        filter.appendChild(feBlend1);
        filter.appendChild(feBlend2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feComposite1);
        filter.appendChild(feComponentTransfer2);
        filter.appendChild(feComposite2);
        filter.appendChild(feComposite3);
        
        defs.appendChild(radialGradient);
        defs.appendChild(filter);
        svg.appendChild(defs);
        
        // 确保SVG立即添加到DOM
        document.body.appendChild(svg);
        this.svgElement = svg;
        
        // 强制浏览器重新计算，确保SVG滤镜可用
        svg.getBoundingClientRect();
        
        // 调试输出
        console.log(`[LiquidGlass] SVG filter created with ID: ${this.filterId}`);
    }
    
    getDisplacementMap() {
        // 标准位移贴图 (径向渐变)
        return `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
                <defs>
                    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:rgb(128,128,128);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:rgb(255,128,128);stop-opacity:1" />
                    </radialGradient>
                </defs>
                <rect width="256" height="256" fill="url(#grad)" />
            </svg>
        `)}`;
    }
    
    createGlassLayers() {
        // 创建玻璃背景层
        const glassWarp = document.createElement('div');
        glassWarp.className = 'liquid-glass-warp';
        
        // 创建边框层1
        const border1 = document.createElement('div');
        border1.className = 'liquid-glass-border liquid-glass-border-1';
        
        // 创建边框层2
        const border2 = document.createElement('div');
        border2.className = 'liquid-glass-border liquid-glass-border-2';
        
        // 插入到元素开头
        this.element.insertBefore(glassWarp, this.element.firstChild);
        this.element.appendChild(border1);
        this.element.appendChild(border2);
        
        this.glassWarp = glassWarp;
        this.border1 = border1;
        this.border2 = border2;
    }
    
    applyStyles() {
        // ⚠️ 不修改元素原有的position, background等样式
        // 只添加isolation确保z-index正常工作
        
        // 检查计算后的样式，而不是内联样式
        const computedStyle = window.getComputedStyle(this.element);
        const currentPosition = computedStyle.position;
        
        // 只有在position是static时才设置为relative
        // 保留fixed, absolute, sticky等定位
        if (currentPosition === 'static') {
            this.element.style.position = 'relative';
        }
        // 如果已经有定位（fixed, absolute等），不修改
        
        this.element.style.isolation = 'isolate';
        
        // 移除元素自身的backdrop-filter，由玻璃层接管
        // 但保持其他所有样式不变
        this.element.style.setProperty('backdrop-filter', 'none', 'important');
        this.element.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        
        console.log(`[LiquidGlass] Position preserved: ${currentPosition} → ${window.getComputedStyle(this.element).position}`);
        
        // 玻璃背景层样式
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        const isChrome = navigator.userAgent.toLowerCase().includes('chrome');
        
        console.log(`[LiquidGlass] Browser: ${isFirefox ? 'Firefox' : isChrome ? 'Chrome' : 'Other'}`);
        console.log(`[LiquidGlass] Creating filter: ${this.filterId}`);
        
        Object.assign(this.glassWarp.style, {
            position: 'absolute',
            inset: '0',
            zIndex: '0',
            filter: isFirefox ? 'none' : `url(#${this.filterId})`,
            backdropFilter: `blur(${this.options.blurAmount}px) saturate(${this.options.saturation}%)`,
            WebkitBackdropFilter: `blur(${this.options.blurAmount}px) saturate(${this.options.saturation}%)`,
            pointerEvents: 'none',
            transition: 'backdrop-filter 0.2s ease-out, filter 0.2s ease-out',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: 'inherit'
        });
        
        // 验证滤镜是否正确设置
        setTimeout(() => {
            const appliedFilter = this.glassWarp.style.filter;
            const computedFilter = window.getComputedStyle(this.glassWarp).filter;
            console.log(`[LiquidGlass] Filter style check: ${appliedFilter}`);
            console.log(`[LiquidGlass] Filter computed check: ${computedFilter}`);
            
            // 检查是否包含滤镜ID（可能带引号或不带引号）
            const hasFilter = appliedFilter && 
                             appliedFilter !== 'none' && 
                             (appliedFilter.includes(this.filterId) || appliedFilter.includes(`"${this.filterId}"`));
            
            if (!isFirefox && !hasFilter) {
                console.error(`[LiquidGlass] ✗ FILTER NOT APPLIED! Expected ID: ${this.filterId}, Got: ${appliedFilter}`);
            } else if (!isFirefox) {
                console.log(`[LiquidGlass] ✓ SVG filter successfully applied!`);
            }
        }, 100);
        
        // 边框层样式
        const borderStyle = {
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            padding: '1.5px',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'exclude',
            boxShadow: '0 0 0 0.5px rgba(255, 255, 255, 0.5) inset, 0 1px 3px rgba(255, 255, 255, 0.25) inset, 0 1px 4px rgba(0, 0, 0, 0.35)',
            borderRadius: 'inherit',
            transition: 'background 0.2s ease-out, opacity 0.2s ease-out',
            zIndex: '1'
        };
        
        Object.assign(this.border1.style, borderStyle, {
            opacity: '0.2'
        });
        
        Object.assign(this.border2.style, borderStyle, {
            mixBlendMode: 'overlay',
            opacity: '0.5'
        });
        
        this.updateBorderGradient();
    }
    
    updateBorderGradient() {
        const angle = 135 + this.mouseOffset.x * 1.2;
        const opacity1 = 0.12 + Math.abs(this.mouseOffset.x) * 0.008;
        const opacity2 = 0.4 + Math.abs(this.mouseOffset.x) * 0.012;
        const stop1 = Math.max(10, 33 + this.mouseOffset.y * 0.3);
        const stop2 = Math.min(90, 66 + this.mouseOffset.y * 0.4);
        
        this.border1.style.background = `linear-gradient(
            ${angle}deg,
            rgba(255, 255, 255, 0.0) 0%,
            rgba(255, 255, 255, ${opacity1}) ${stop1}%,
            rgba(255, 255, 255, ${opacity2}) ${stop2}%,
            rgba(255, 255, 255, 0.0) 100%
        )`;
        
        const opacity1b = 0.32 + Math.abs(this.mouseOffset.x) * 0.008;
        const opacity2b = 0.6 + Math.abs(this.mouseOffset.x) * 0.012;
        
        this.border2.style.background = `linear-gradient(
            ${angle}deg,
            rgba(255, 255, 255, 0.0) 0%,
            rgba(255, 255, 255, ${opacity1b}) ${stop1}%,
            rgba(255, 255, 255, ${opacity2b}) ${stop2}%,
            rgba(255, 255, 255, 0.0) 100%
        )`;
    }
    
    bindEvents() {
        // 鼠标移动事件 - 边框渐变和弹性变形
        this.element.addEventListener('mousemove', (e) => {
            const rect = this.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            
            this.mouseOffset.x = ((e.clientX - centerX) / rect.width) * 100;
            this.mouseOffset.y = ((e.clientY - centerY) / rect.height) * 100;
            
            // 更新边框渐变和弹性变形
            this.updateBorderGradient();
            this.applyElasticTransform();
        });
        
        // 鼠标进入/离开
        this.element.addEventListener('mouseenter', () => {
            this.isHovered = true;
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.mouseOffset = { x: 0, y: 0 };
            this.updateBorderGradient();
            this.applyElasticTransform();
        });
        
        // 确保滤镜持续有效 - 监视filter属性
        this.filterCheckInterval = setInterval(() => {
            this.ensureFilterActive();
        }, 1000);
    }
    
    ensureFilterActive() {
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        if (isFirefox) return;
        
        const currentFilter = this.glassWarp.style.filter;
        
        // 检查滤镜是否存在（支持带引号和不带引号的格式）
        const hasFilter = currentFilter && 
                         currentFilter !== 'none' && 
                         (currentFilter.includes(this.filterId) || currentFilter.includes(`"${this.filterId}"`));
        
        if (!hasFilter) {
            console.warn('[LiquidGlass] Filter lost, reapplying...');
            // 重新应用滤镜（不带引号）
            this.glassWarp.style.filter = `url(#${this.filterId})`;
        }
    }
    
    applyElasticTransform() {
        // 启用弹性变形效果 - 复刻LiquidGlass项目
        if (!this.isHovered || this.options.elasticity === 0) {
            // 鼠标离开或弹性为0时，重置变形
            this.glassWarp.style.transform = '';
            this.border1.style.transform = '';
            this.border2.style.transform = '';
            return;
        }
        
        // 计算弹性变形 - 卡片跟随鼠标轻微移动
        const offsetX = this.mouseOffset.x * this.options.elasticity * 0.15;
        const offsetY = this.mouseOffset.y * this.options.elasticity * 0.15;
        
        // 玻璃层变形（主要效果层）
        this.glassWarp.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        
        // 边框层变形（较小的偏移，产生层次感）
        const borderOffsetX = offsetX * 0.7;
        const borderOffsetY = offsetY * 0.7;
        this.border1.style.transform = `translate(${borderOffsetX}px, ${borderOffsetY}px)`;
        this.border2.style.transform = `translate(${borderOffsetX * 0.5}px, ${borderOffsetY * 0.5}px)`;
    }
    
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // 直接更新SVG滤镜属性，而不是重新创建
        if (this.svgElement) {
            const filter = this.svgElement.querySelector(`filter[id="${this.filterId}"]`);
            
            if (filter) {
                // 更新位移强度
                const feDisplacementMaps = filter.querySelectorAll('feDisplacementMap');
                if (feDisplacementMaps.length >= 3) {
                    feDisplacementMaps[0].setAttribute('scale', String(-this.options.displacementScale));
                    feDisplacementMaps[1].setAttribute('scale', String(-this.options.displacementScale - this.options.aberrationIntensity * 0.05 * this.options.displacementScale));
                    feDisplacementMaps[2].setAttribute('scale', String(-this.options.displacementScale - this.options.aberrationIntensity * 0.1 * this.options.displacementScale));
                }
                
                // 更新色差强度
                const feFuncA = filter.querySelector('feFuncA');
                if (feFuncA) {
                    feFuncA.setAttribute('tableValues', `0 ${this.options.aberrationIntensity * 0.05} 1`);
                }
                
                // 更新模糊量
                const feGaussianBlur = filter.querySelector('feGaussianBlur');
                if (feGaussianBlur) {
                    feGaussianBlur.setAttribute('stdDeviation', String(Math.max(0.1, 0.5 - this.options.aberrationIntensity * 0.1)));
                }
                
                // 更新径向渐变（色差边缘）
                const radialGradient = this.svgElement.querySelector(`radialGradient[id="${this.filterId}-edge-mask"]`);
                if (radialGradient) {
                    const stop2 = radialGradient.children[1];
                    if (stop2) {
                        stop2.setAttribute('offset', `${Math.max(30, 80 - this.options.aberrationIntensity * 2)}%`);
                    }
                }
            }
        }
        
        // 更新backdrop-filter（模糊量和饱和度）
        if (this.glassWarp) {
            this.glassWarp.style.backdropFilter = `blur(${this.options.blurAmount}px) saturate(${this.options.saturation}%)`;
            this.glassWarp.style.WebkitBackdropFilter = `blur(${this.options.blurAmount}px) saturate(${this.options.saturation}%)`;
        }
        
        console.log('[LiquidGlass] Options updated:', this.options);
    }
    
    destroy() {
        // 清除监视器
        if (this.filterCheckInterval) {
            clearInterval(this.filterCheckInterval);
        }
        
        if (this.svgElement) {
            this.svgElement.remove();
        }
        if (this.glassWarp) {
            this.glassWarp.remove();
        }
        if (this.border1) {
            this.border1.remove();
        }
        if (this.border2) {
            this.border2.remove();
        }
    }
}

// 导出到全局
window.LiquidGlassEffect = LiquidGlassEffect;

