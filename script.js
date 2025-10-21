// ==================== 初始化：加载动态内容 ====================
document.addEventListener('DOMContentLoaded', async () => {
    await IndexedDBManager.init();
    await loadDynamicContent();
});

/**
 * 加载所有动态内容
 */
async function loadDynamicContent() {
    await loadSiteInfo();
    await loadWorks();
    await loadPersonalInfo();
}

/**
 * 加载网站信息
 */
async function loadSiteInfo() {
    const siteInfo = await IndexedDBManager.getSiteInfo();
    
    // 更新页面标题
    if (document.getElementById('pageTitle')) {
        document.getElementById('pageTitle').textContent = siteInfo.siteTitle;
    }
    
    // 更新Logo
    if (document.getElementById('logoText')) {
        document.getElementById('logoText').textContent = siteInfo.logoText;
    }
    if (document.getElementById('logoSubtitle')) {
        document.getElementById('logoSubtitle').textContent = siteInfo.logoSubtitle;
    }
    
    // 更新首页标题
    if (document.getElementById('heroTitle1')) {
        const title1 = document.getElementById('heroTitle1');
        title1.textContent = siteInfo.heroTitle1;
        title1.setAttribute('data-text', siteInfo.heroTitle1);
    }
    if (document.getElementById('heroTitle2')) {
        const title2 = document.getElementById('heroTitle2');
        title2.textContent = siteInfo.heroTitle2;
        title2.setAttribute('data-text', siteInfo.heroTitle2);
    }
    if (document.getElementById('heroSubtitle')) {
        document.getElementById('heroSubtitle').textContent = siteInfo.heroSubtitle;
    }
    
    // 更新关于区域
    if (document.getElementById('aboutText')) {
        document.getElementById('aboutText').textContent = siteInfo.aboutText;
    }
    if (document.getElementById('aboutSkills')) {
        document.getElementById('aboutSkills').textContent = '擅长领域：' + siteInfo.aboutSkills;
    }
}

/**
 * 加载作品列表
 */
async function loadWorks() {
    const works = await IndexedDBManager.getAllWorks();
    const worksGrid = document.getElementById('worksGrid');
    
    if (!worksGrid) return;
    
    // 清空现有内容
    worksGrid.innerHTML = '';
    
    // 渲染每个作品
    works.forEach((work, index) => {
        const workCard = createWorkCard(work, index);
        worksGrid.appendChild(workCard);
    });
    
    // 重新初始化观察器和事件
    initWorkCardsObserver();
    initWorkMediaEvents();
}

/**
 * 创建作品卡片元素
 */
function createWorkCard(work, index) {
    const card = document.createElement('div');
    card.className = `work-card ${work.size || 'medium'}`;
    card.setAttribute('data-type', work.type);
    card.style.opacity = '0';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // 创建媒体区域
    let mediaHTML = '';
    if (work.mediaType === 'video' && work.mediaSrc) {
        mediaHTML = `
            <video class="work-video" poster="${work.mediaPoster || ''}" loop preload="metadata">
                <source src="${work.mediaSrc}" type="video/mp4">
                您的浏览器不支持视频播放
            </video>
            <div class="media-overlay">
                <div class="play-icon">▶</div>
            </div>
        `;
    } else if (work.mediaType === 'image' && work.mediaSrc) {
        mediaHTML = `
            <img src="${work.mediaSrc}" alt="${work.title}" class="work-image">
            <div class="media-overlay">
                <div class="zoom-icon">🔍</div>
            </div>
        `;
    } else if (work.mediaType === 'document') {
        mediaHTML = `
            <div class="document-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                    <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                    <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                </svg>
            </div>
            <div class="document-title">${work.tag || '文档'}</div>
        `;
    }
    
    // 技术标签
    const techTags = work.tech ? work.tech.split('·').map(t => 
        `<span class="meta-item">${t.trim()}</span>`
    ).join('') : '';
    
    // 链接按钮
    let linkHTML = '';
    if (work.link && work.link !== '#') {
        const linkText = work.type === 'document' ? '下载文档' : '查看详情';
        const linkIcon = work.type === 'document' ? 
            '<path d="M10 4V14M10 14L6 10M10 14L14 10M4 16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' :
            '<path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        
        linkHTML = `
            <a href="${work.link}" class="work-link" ${work.type === 'document' ? 'download' : ''}>
                ${linkText}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    ${linkIcon}
                </svg>
            </a>
        `;
    }
    
    card.innerHTML = `
        <div class="work-media">
            ${mediaHTML}
        </div>
        <div class="work-content">
            <div class="work-tag">${work.tag || work.type}</div>
            <h3 class="work-title">${work.title}</h3>
            <p class="work-description">${work.description}</p>
            <div class="work-meta">
                <span class="meta-item">${work.year || '2024'}</span>
                ${techTags}
            </div>
            ${linkHTML}
        </div>
    `;
    
    return card;
}

/**
 * 初始化作品卡片观察器
 */
function initWorkCardsObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * 初始化作品媒体事件
 */
function initWorkMediaEvents() {
    // 视频播放控制 - 点击播放，鼠标移开暂停，自动循环
    const videos = document.querySelectorAll('.work-video');
    videos.forEach(video => {
        const card = video.closest('.work-card');
        const mediaContainer = video.closest('.work-media');
        const overlay = card.querySelector('.media-overlay');
        
        // 标记视频是否已被点击加载
        let videoLoaded = false;
        
        if (overlay) {
            // 点击 overlay 加载并播放视频
            overlay.addEventListener('click', () => {
                if (!videoLoaded) {
                    videoLoaded = true;
                    video.play();
                    overlay.style.opacity = '0';
                    overlay.style.pointerEvents = 'none';
                }
            });
        }
        
        // 点击视频区域播放
        mediaContainer.addEventListener('click', (e) => {
            if (!videoLoaded && overlay) {
                videoLoaded = true;
                video.play();
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }
        });
        
        // 鼠标移开视频区域时暂停（仅当视频已加载后）
        mediaContainer.addEventListener('mouseleave', () => {
            if (videoLoaded && !video.paused) {
                video.pause();
            }
        });
        
        // 鼠标移入视频区域时播放（仅当视频已加载后）
        mediaContainer.addEventListener('mouseenter', () => {
            if (videoLoaded && video.paused) {
                video.play();
            }
        });
        
        // 视频暂停时显示 overlay（仅当视频未加载时）
        video.addEventListener('pause', () => {
            if (!videoLoaded && overlay) {
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
            }
        });
        
        // 视频播放时隐藏 overlay
        video.addEventListener('play', () => {
            if (overlay) {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
            }
        });
    });
    
    // 图片点击放大
    const workImages = document.querySelectorAll('.work-image');
    workImages.forEach(image => {
        image.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                cursor: zoom-out;
                animation: fadeIn 0.3s ease;
            `;
            
            const modalImage = document.createElement('img');
            modalImage.src = image.src;
            modalImage.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            `;
            
            modal.appendChild(modalImage);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', () => {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            });
            
            const closeOnEsc = (e) => {
                if (e.key === 'Escape') {
                    modal.click();
                    document.removeEventListener('keydown', closeOnEsc);
                }
            };
            document.addEventListener('keydown', closeOnEsc);
        });
    });
}

/**
 * 加载个人信息
 */
async function loadPersonalInfo() {
    const info = await IndexedDBManager.getPersonalInfo();
    
    // 更新个人信息卡片
    if (document.getElementById('infoCardAvatar')) {
        document.getElementById('infoCardAvatar').textContent = info.name.substring(0, 3);
    }
    if (document.getElementById('infoCardName')) {
        document.getElementById('infoCardName').textContent = info.name;
    }
    if (document.getElementById('infoCardTitle')) {
        document.getElementById('infoCardTitle').textContent = info.title;
    }
    if (document.getElementById('infoCardEmail')) {
        document.getElementById('infoCardEmail').textContent = info.email;
    }
    if (document.getElementById('infoCardLocation')) {
        document.getElementById('infoCardLocation').textContent = info.location;
    }
    if (document.getElementById('infoCardExperience')) {
        document.getElementById('infoCardExperience').textContent = info.experience;
    }
    if (document.getElementById('infoCardSpecialty')) {
        document.getElementById('infoCardSpecialty').textContent = info.specialty;
    }
    
    // 更新联系方式
    const contactLinks = document.getElementById('contactLinks');
    if (contactLinks && info.contactEmail) {
        contactLinks.innerHTML = `
            <a href="${info.contactEmail}" class="contact-item">
                <div class="contact-icon">📧</div>
                <div class="contact-text">${info.email}</div>
            </a>
            ${info.contactGithub ? `
            <a href="${info.contactGithub}" class="contact-item" target="_blank">
                <div class="contact-icon">💻</div>
                <div class="contact-text">GitHub</div>
            </a>
            ` : ''}
            ${info.contactTwitter ? `
            <a href="${info.contactTwitter}" class="contact-item" target="_blank">
                <div class="contact-icon">🐦</div>
                <div class="contact-text">Twitter</div>
            </a>
            ` : ''}
        `;
    }
}

// ==================== 导航栏滚动效果 ====================
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
});

// ==================== 平滑滚动导航 ====================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 移除所有active类
        navLinks.forEach(l => l.classList.remove('active'));
        // 添加active到当前链接
        link.classList.add('active');
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 滚动时更新导航active状态 ====================
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollPosition = window.pageYOffset + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ==================== 鼠标跟随效果 ====================
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 创建自定义鼠标光标效果
const cursor = document.createElement('div');
cursor.style.cssText = `
    position: fixed;
    width: 20px;
    height: 20px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.2s ease;
    mix-blend-mode: difference;
`;
document.body.appendChild(cursor);

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    
    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// 鼠标悬停在可点击元素上时放大光标
const clickables = document.querySelectorAll('a, button, .work-card, video');
clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursor.style.borderColor = 'var(--accent-color)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.borderColor = 'var(--primary-color)';
    });
});

// ==================== 移动端优化：禁用鼠标效果 ====================
if ('ontouchstart' in window) {
    cursor.style.display = 'none';
}

// ==================== 首屏动态背景 ====================
// 定义默认背景媒体资源（视频和图片）
// 🔒 已关闭默认图片，只使用 default-data.json 中的图片
// 如需恢复，取消注释下面的数组即可
const defaultHeroBackgrounds = [
    // 图片 - 已关闭
    // { type: 'image', src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80' },
    // { type: 'image', src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80' },
    // { type: 'image', src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1920&q=80' },
    // { type: 'image', src: 'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=1920&q=80' },
    // { type: 'image', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80' },
    // { type: 'image', src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80' },
];

/**
 * 从作品库中加载媒体并合并到背景池
 */
async function loadHeroBackgrounds() {
    // 从默认背景开始
    const backgrounds = [...defaultHeroBackgrounds];
    
    try {
        // 从 IndexedDB 加载作品
        const works = await IndexedDBManager.getAllWorks();
        
        // 将作品中的视频和图片添加到背景池
        works.forEach(work => {
            if (work.mediaSrc) {
                if (work.mediaType === 'video') {
                    backgrounds.push({
                        type: 'video',
                        src: work.mediaSrc
                    });
                } else if (work.mediaType === 'image') {
                    backgrounds.push({
                        type: 'image',
                        src: work.mediaSrc
                    });
                }
            }
        });
        
        console.log(`[Hero Background] 已加载 ${backgrounds.length} 个背景媒体（${works.length} 个来自作品库）`);
    } catch (error) {
        console.warn('[Hero Background] 加载作品媒体失败，使用默认背景', error);
    }
    
    return backgrounds;
}

let currentBackgroundIndex = -1;
let heroBackgroundsCache = [];
let backgroundSwitchTimer = null;

async function setRandomHeroBackground() {
    const heroBgMedia = document.getElementById('heroBgMedia');
    if (!heroBgMedia) return;
    
    // 首次加载时初始化背景缓存
    if (heroBackgroundsCache.length === 0) {
        heroBackgroundsCache = await loadHeroBackgrounds();
    }
    
    // 如果只有一个背景，直接使用
    if (heroBackgroundsCache.length === 1) {
        currentBackgroundIndex = 0;
    } else {
        // 随机选择一个不同于当前的背景
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * heroBackgroundsCache.length);
        } while (newIndex === currentBackgroundIndex && heroBackgroundsCache.length > 1);
        currentBackgroundIndex = newIndex;
    }
    
    const randomBg = heroBackgroundsCache[currentBackgroundIndex];
    
    // 清空之前的背景内容
    heroBgMedia.innerHTML = '';
    
    // 清除之前的定时器
    if (backgroundSwitchTimer) {
        clearTimeout(backgroundSwitchTimer);
        backgroundSwitchTimer = null;
    }
    
    if (randomBg.type === 'image') {
        // 创建图片元素
        const img = document.createElement('img');
        img.src = randomBg.src;
        img.alt = 'Hero Background';
        img.style.opacity = '0';
        img.style.transition = 'opacity 2s ease';
        
        // 图片加载完成后显示
        img.onload = () => {
            img.style.opacity = '0.7';
            // 图片显示3.5秒后切换到下一个
            backgroundSwitchTimer = setTimeout(() => {
                setRandomHeroBackground();
            }, 3500);
        };
        
        // 如果图片加载失败，也要继续切换
        img.onerror = () => {
            console.warn('[Hero Background] 图片加载失败:', randomBg.src);
            backgroundSwitchTimer = setTimeout(() => {
                setRandomHeroBackground();
            }, 1000);
        };
        
        heroBgMedia.appendChild(img);
    } else if (randomBg.type === 'video') {
        // 创建视频元素
        const video = document.createElement('video');
        video.src = randomBg.src;
        video.autoplay = true;
        video.muted = true;
        video.loop = false; // 不循环播放，播放完后切换
        video.playsInline = true;
        video.style.opacity = '0';
        video.style.transition = 'opacity 2s ease';
        
        // 视频加载完成后显示
        video.onloadeddata = () => {
            video.style.opacity = '0.7';
        };
        
        // 视频播放结束后切换到下一个
        video.onended = () => {
            setRandomHeroBackground();
        };
        
        // 如果视频加载失败，也要继续切换
        video.onerror = () => {
            console.warn('[Hero Background] 视频加载失败:', randomBg.src);
            backgroundSwitchTimer = setTimeout(() => {
                setRandomHeroBackground();
            }, 1000);
        };
        
        heroBgMedia.appendChild(video);
    }
}

// 页面加载时设置背景
setRandomHeroBackground();

// ==================== 页面加载动画 ====================
// 页面加载完成后移除加载类（如果有的话）
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});


// ==================== 添加CSS动画关键帧 ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== 控制台彩蛋 ====================
console.log('%c👋 你好！', 'font-size: 20px; font-weight: bold; color: #00f0ff;');
console.log('%c欢迎查看我的作品集源码！', 'font-size: 14px; color: #b0b0c0;');
console.log('%c如果你对我的作品感兴趣，欢迎联系我 😊', 'font-size: 14px; color: #b0b0c0;');

// ==================== 初始化信息卡片 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInfoCard);
} else {
    initInfoCard();
}

// ==================== 个人信息卡片功能 ====================
function initInfoCard() {
    const infoCard = document.getElementById('infoCard');
    const infoCardHeader = document.getElementById('infoCardHeader');
    const toggleBtn = document.getElementById('toggleCard');
    const toggleSettings = document.getElementById('toggleSettings');
    const settingsPanel = document.getElementById('infoSettingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const glassMaterialSelect = document.getElementById('glassMaterial');
    const fresnelParams = document.getElementById('fresnelParams');
    const crystalParams = document.getElementById('crystalParams');
    const fresnelDivider = document.getElementById('fresnelDivider');
    
    if (!infoCard || !infoCardHeader) {
        console.warn('[InfoCard] Elements not found');
        return;
    }
    
    console.log('[InfoCard] Initializing info card...');
    
    // 获取所有需要应用玻璃效果的元素
    const btnPrimary = document.querySelector('.btn-primary');
    const btnSecondary = document.querySelector('.btn-secondary');
    const glassElements = [btnPrimary, btnSecondary, infoCard];
    
    // ==================== 折叠/展开功能 ====================
    let isCollapsed = false;
    
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            infoCard.classList.add('collapsed');
        } else {
            infoCard.classList.remove('collapsed');
        }
    });
    
    // ==================== 参数调节面板功能 ====================
    toggleSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('active');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
    });
    
    // ==================== 玻璃材质切换 ====================
    glassMaterialSelect.addEventListener('change', (e) => {
        const material = e.target.value;
        
        if (material === 'crystal') {
            // 切换到水晶玻璃
            glassElements.forEach(el => {
                if (el) el.classList.add('crystal-glass');
            });
            fresnelParams.style.display = 'none';
            fresnelDivider.style.display = 'none';
            crystalParams.style.display = 'block';
            console.log('%c💎 已切换到水晶玻璃效果', 'font-size: 14px; font-weight: bold; color: #ec4899;');
        } else {
            // 切换到菲涅尔折射玻璃
            glassElements.forEach(el => {
                if (el) el.classList.remove('crystal-glass');
            });
            fresnelParams.style.display = 'block';
            fresnelDivider.style.display = 'block';
            crystalParams.style.display = 'none';
            console.log('%c✨ 已切换到菲涅尔折射玻璃', 'font-size: 14px; font-weight: bold; color: #a78bfa;');
        }
    });
    
    // ==================== 玻璃效果参数调节 ====================
    // 这些参数同时控制标题栏、按钮和个人信息卡的玻璃效果
    const navbarBlurSlider = document.getElementById('navbarBlur');
    const navbarSaturationSlider = document.getElementById('navbarSaturation');
    const navbarBrightnessSlider = document.getElementById('navbarBrightness');
    const navbarBgOpacity1Slider = document.getElementById('navbarBgOpacity1');
    const navbarBgOpacity2Slider = document.getElementById('navbarBgOpacity2');
    const navbarBorderOpacitySlider = document.getElementById('navbarBorderOpacity');
    
    const navbarBlurValue = document.getElementById('navbarBlurValue');
    const navbarSaturationValue = document.getElementById('navbarSaturationValue');
    const navbarBrightnessValue = document.getElementById('navbarBrightnessValue');
    const navbarBgOpacity1Value = document.getElementById('navbarBgOpacity1Value');
    const navbarBgOpacity2Value = document.getElementById('navbarBgOpacity2Value');
    const navbarBorderOpacityValue = document.getElementById('navbarBorderOpacityValue');
    
    navbarBlurSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarBlurValue.textContent = value;
        document.documentElement.style.setProperty('--navbar-blur', `${value}px`);
    });
    
    navbarSaturationSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarSaturationValue.textContent = value;
        document.documentElement.style.setProperty('--navbar-saturation', `${value}%`);
    });
    
    navbarBrightnessSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarBrightnessValue.textContent = value;
        document.documentElement.style.setProperty('--navbar-brightness', value);
    });
    
    navbarBgOpacity1Slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarBgOpacity1Value.textContent = value;
        document.documentElement.style.setProperty('--navbar-bg-opacity-1', (value / 100).toFixed(2));
    });
    
    navbarBgOpacity2Slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarBgOpacity2Value.textContent = value;
        document.documentElement.style.setProperty('--navbar-bg-opacity-2', (value / 100).toFixed(2));
    });
    
    navbarBorderOpacitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        navbarBorderOpacityValue.textContent = value;
        document.documentElement.style.setProperty('--navbar-border-opacity', (value / 100).toFixed(2));
    });
    
    // ==================== 折射和色差效果参数调节 ====================
    const refractionTopSlider = document.getElementById('refractionTop');
    const refractionBottomSlider = document.getElementById('refractionBottom');
    const aberrationRedSlider = document.getElementById('aberrationRed');
    const aberrationBlueSlider = document.getElementById('aberrationBlue');
    
    const refractionTopValue = document.getElementById('refractionTopValue');
    const refractionBottomValue = document.getElementById('refractionBottomValue');
    const aberrationRedValue = document.getElementById('aberrationRedValue');
    const aberrationBlueValue = document.getElementById('aberrationBlueValue');
    
    refractionTopSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        refractionTopValue.textContent = value;
        document.documentElement.style.setProperty('--refraction-top', (value / 100).toFixed(2));
    });
    
    refractionBottomSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        refractionBottomValue.textContent = value;
        document.documentElement.style.setProperty('--refraction-bottom', (value / 100).toFixed(2));
    });
    
    aberrationRedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        aberrationRedValue.textContent = value;
        document.documentElement.style.setProperty('--aberration-red', (value / 100).toFixed(2));
    });
    
    aberrationBlueSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        aberrationBlueValue.textContent = value;
        document.documentElement.style.setProperty('--aberration-blue', (value / 100).toFixed(2));
    });
    
    // ==================== 菲涅尔效应参数调节 ====================
    const fresnelStrengthSlider = document.getElementById('fresnelStrength');
    const fresnelEdgeSlider = document.getElementById('fresnelEdge');
    const fresnelCenterSlider = document.getElementById('fresnelCenter');
    
    const fresnelStrengthValue = document.getElementById('fresnelStrengthValue');
    const fresnelEdgeValue = document.getElementById('fresnelEdgeValue');
    const fresnelCenterValue = document.getElementById('fresnelCenterValue');
    
    fresnelStrengthSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        fresnelStrengthValue.textContent = value;
        document.documentElement.style.setProperty('--fresnel-strength', (value / 100).toFixed(2));
    });
    
    fresnelEdgeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        fresnelEdgeValue.textContent = value;
        document.documentElement.style.setProperty('--fresnel-edge', (value / 100).toFixed(2));
    });
    
    fresnelCenterSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        fresnelCenterValue.textContent = value;
        document.documentElement.style.setProperty('--fresnel-center', (value / 100).toFixed(2));
    });
    
    // ==================== 水晶玻璃参数调节 ====================
    const crystalRefractionSlider = document.getElementById('crystalRefraction');
    const crystalDispersionSlider = document.getElementById('crystalDispersion');
    const crystalReflectionSlider = document.getElementById('crystalReflection');
    const crystalFacetSlider = document.getElementById('crystalFacet');
    const crystalRainbowSlider = document.getElementById('crystalRainbow');
    const crystalClaritySlider = document.getElementById('crystalClarity');
    
    const crystalRefractionValue = document.getElementById('crystalRefractionValue');
    const crystalDispersionValue = document.getElementById('crystalDispersionValue');
    const crystalReflectionValue = document.getElementById('crystalReflectionValue');
    const crystalFacetValue = document.getElementById('crystalFacetValue');
    const crystalRainbowValue = document.getElementById('crystalRainbowValue');
    const crystalClarityValue = document.getElementById('crystalClarityValue');
    
    crystalRefractionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalRefractionValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-refraction', (value / 10).toFixed(1));
    });
    
    crystalDispersionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalDispersionValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-dispersion', (value / 100).toFixed(2));
    });
    
    crystalReflectionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalReflectionValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-internal-reflection', (value / 100).toFixed(2));
    });
    
    crystalFacetSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalFacetValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-facet-intensity', (value / 100).toFixed(2));
    });
    
    crystalRainbowSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalRainbowValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-rainbow-shift', `${value}px`);
    });
    
    crystalClaritySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        crystalClarityValue.textContent = value;
        document.documentElement.style.setProperty('--crystal-clarity', (value / 100).toFixed(2));
    });
    
    // ==================== 首页文字效果参数调节 ====================
    const heroTextColorPicker = document.getElementById('heroTextColor');
    const heroSubtitleColorPicker = document.getElementById('heroSubtitleColor');
    const heroStrokeWidthSlider = document.getElementById('heroStrokeWidth');
    const heroStrokeColorPicker = document.getElementById('heroStrokeColor');
    const heroStrokeOpacitySlider = document.getElementById('heroStrokeOpacity');
    const heroGlowSizeSlider = document.getElementById('heroGlowSize');
    const heroGlowColorPicker = document.getElementById('heroGlowColor');
    const heroGlowOpacitySlider = document.getElementById('heroGlowOpacity');
    const heroMouseEffectSlider = document.getElementById('heroMouseEffect');
    
    const heroStrokeWidthValue = document.getElementById('heroStrokeWidthValue');
    const heroStrokeOpacityValue = document.getElementById('heroStrokeOpacityValue');
    const heroGlowSizeValue = document.getElementById('heroGlowSizeValue');
    const heroGlowOpacityValue = document.getElementById('heroGlowOpacityValue');
    const heroMouseEffectValue = document.getElementById('heroMouseEffectValue');
    
    // 颜色选择器
    heroTextColorPicker.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--hero-text-color', e.target.value);
    });
    
    heroSubtitleColorPicker.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--hero-subtitle-color', e.target.value);
    });
    
    heroStrokeColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        const opacity = parseFloat(heroStrokeOpacitySlider.value) / 100;
        // 将hex颜色转换为rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--hero-stroke-color', `rgba(${r}, ${g}, ${b}, ${opacity})`);
    });
    
    heroGlowColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        const opacity = parseFloat(heroGlowOpacitySlider.value) / 100;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--hero-glow-color', `rgba(${r}, ${g}, ${b}, ${opacity})`);
    });
    
    // 滑块控制
    heroStrokeWidthSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        heroStrokeWidthValue.textContent = value;
        document.documentElement.style.setProperty('--hero-stroke-width', `${value / 10}px`);
    });
    
    heroStrokeOpacitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        heroStrokeOpacityValue.textContent = value;
        const color = heroStrokeColorPicker.value;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--hero-stroke-color', `rgba(${r}, ${g}, ${b}, ${value / 100})`);
    });
    
    heroGlowSizeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        heroGlowSizeValue.textContent = value;
        document.documentElement.style.setProperty('--hero-glow-size', `${value}px`);
        document.documentElement.style.setProperty('--hero-glow-size-2', `${value / 2}px`);
    });
    
    heroGlowOpacitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        heroGlowOpacityValue.textContent = value;
        const color = heroGlowColorPicker.value;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        document.documentElement.style.setProperty('--hero-glow-color', `rgba(${r}, ${g}, ${b}, ${value / 100})`);
    });
    
    heroMouseEffectSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        heroMouseEffectValue.textContent = value;
        // 更新鼠标晃动强度
        window.heroMouseEffectStrength = value;
    });
    
    console.log('[InfoCard] Info card initialized successfully');
    console.log('%c✨ 参数调节面板已启用！', 'font-size: 14px; font-weight: bold; color: #4facfe;');
    console.log('%c点击个人信息卡右上角的⚙️图标打开参数面板', 'font-size: 12px; color: #b0b0c0;');
    console.log('%c可以调节标题栏/按钮/信息卡的玻璃效果：', 'font-size: 12px; color: #a78bfa;');
    console.log('%c  • 玻璃材质：菲涅尔折射 / 水晶玻璃', 'font-size: 12px; color: #4facfe;');
    console.log('%c  • 基础效果：模糊、饱和度、亮度、透明度', 'font-size: 12px; color: #a78bfa;');
    console.log('%c  【菲涅尔折射玻璃】', 'font-size: 12px; font-weight: bold; color: #a78bfa;');
    console.log('%c    • 折射&色差：顶部高光、底部反射、红蓝色差', 'font-size: 12px; color: #a78bfa;');
    console.log('%c    • 菲涅尔效应：边缘亮度、中心亮度、效果强度', 'font-size: 12px; color: #fbbf24;');
    console.log('%c  【水晶玻璃】', 'font-size: 12px; font-weight: bold; color: #ec4899;');
    console.log('%c    • 折射率、色散强度、内部反射', 'font-size: 12px; color: #ec4899;');
    console.log('%c    • 切面强度、彩虹偏移、透明度', 'font-size: 12px; color: #ec4899;');
}

// ==================== 鼠标移动晃动效果 ====================
(function initHeroMouseEffect() {
    // 初始化晃动强度
    window.heroMouseEffectStrength = 15;
    
    // 获取首页hero区域的所有文字元素
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    
    if (!heroTitle) return;
    
    // 存储所有需要晃动的元素
    const elementsToMove = [
        heroTitle,
        heroSubtitle,
        ...Array.from(heroButtons)
    ].filter(el => el !== null);
    
    // 鼠标位置（归一化到-1到1之间）
    let mouseX = 0;
    let mouseY = 0;
    
    // 当前位置（用于平滑过渡）
    const currentPositions = elementsToMove.map(() => ({ x: 0, y: 0 }));
    
    // 监听鼠标移动
    document.addEventListener('mousemove', (e) => {
        // 归一化鼠标位置到-1到1之间
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    });
    
    // 动画循环
    function animate() {
        elementsToMove.forEach((element, index) => {
            if (!element) return;
            
            // 获取当前晃动强度
            const strength = window.heroMouseEffectStrength || 15;
            
            // 计算目标位置（鼠标位置 * 强度）
            const targetX = mouseX * strength;
            const targetY = mouseY * strength;
            
            // 平滑过渡（lerp）
            const smoothing = 0.1;
            currentPositions[index].x += (targetX - currentPositions[index].x) * smoothing;
            currentPositions[index].y += (targetY - currentPositions[index].y) * smoothing;
            
            // 应用transform
            element.style.transform = `translate(${currentPositions[index].x}px, ${currentPositions[index].y}px)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    // 启动动画
    animate();
    
    console.log('[HeroMouseEffect] Mouse follow effect initialized');
    console.log('%c🎯 首页文字鼠标晃动效果已启用！', 'font-size: 14px; font-weight: bold; color: #10b981;');
})();

