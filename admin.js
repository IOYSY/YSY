/**
 * 管理后台主脚本
 */

// 当前编辑的作品ID
let currentEditingWorkId = null;

// 当前上传的文件
let currentUploadedFile = null;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化IndexedDB
        await IndexedDBManager.init();
        
        // 初始化事件监听器（必须先初始化）
        initSidebar();
        initEventListeners();
        
        // 显示存储使用情况
        await showStorageInfo();
        
        // 加载数据
        await loadSiteInfo();
        await loadWorks();
        await loadPersonalInfo();
        
        console.log('✅ 管理后台初始化完成');
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        alert('管理后台初始化失败，请刷新页面重试');
    }
});

// ==================== 侧边栏导航 ====================
function initSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    console.log('初始化侧边栏，找到菜单项:', menuItems.length);
    console.log('找到内容区域:', sections.length);

    if (menuItems.length === 0) {
        console.error('❌ 未找到菜单项元素！');
        return;
    }

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;
            console.log('点击菜单:', targetSection);

            // 更新菜单active状态
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // 更新内容区域显示
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                    console.log('激活区域:', section.id);
                }
            });
        });
    });
    
    console.log('✅ 侧边栏初始化完成');
}

// ==================== 显示存储使用情况 ====================
async function showStorageInfo() {
    const storageInfo = await IndexedDBManager.getStorageEstimate();
    if (storageInfo) {
        console.log('📊 存储使用情况:', storageInfo);
        console.log(`已使用: ${storageInfo.used} / ${storageInfo.total} (${storageInfo.percentage})`);
    }
}

// ==================== 加载网站信息 ====================
async function loadSiteInfo() {
    const siteInfo = await IndexedDBManager.getSiteInfo();

    document.getElementById('siteTitle').value = siteInfo.siteTitle || '';
    document.getElementById('logoText').value = siteInfo.logoText || '';
    document.getElementById('logoSubtitle').value = siteInfo.logoSubtitle || '';
    document.getElementById('heroTitle1').value = siteInfo.heroTitle1 || '';
    document.getElementById('heroTitle2').value = siteInfo.heroTitle2 || '';
    document.getElementById('heroSubtitle').value = siteInfo.heroSubtitle || '';
    document.getElementById('aboutText').value = siteInfo.aboutText || '';
    document.getElementById('aboutSkills').value = siteInfo.aboutSkills || '';
}

// ==================== 保存网站信息 ====================
async function saveSiteInfo() {
    const siteInfo = {
        siteTitle: document.getElementById('siteTitle').value,
        logoText: document.getElementById('logoText').value,
        logoSubtitle: document.getElementById('logoSubtitle').value,
        heroTitle1: document.getElementById('heroTitle1').value,
        heroTitle2: document.getElementById('heroTitle2').value,
        heroSubtitle: document.getElementById('heroSubtitle').value,
        aboutText: document.getElementById('aboutText').value,
        aboutSkills: document.getElementById('aboutSkills').value
    };

    await IndexedDBManager.saveSiteInfo(siteInfo);
    console.log('网站信息已保存到IndexedDB');
}

// ==================== 加载作品列表 ====================
async function loadWorks() {
    const works = await IndexedDBManager.getAllWorks();
    const worksList = document.getElementById('worksList');

    if (works.length === 0) {
        worksList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h3>还没有作品</h3>
                <p>点击上方"添加新作品"按钮开始创建您的第一个作品</p>
            </div>
        `;
        return;
    }

    worksList.innerHTML = works.map(work => createWorkItemHTML(work)).join('');
    attachWorkItemEvents();
}

// ==================== 创建作品卡片HTML ====================
function createWorkItemHTML(work) {
    const typeMap = {
        'video': '视频',
        'image': '图片',
        'document': '文档'
    };

    let mediaHTML = '';
    if (work.mediaType === 'image') {
        mediaHTML = `<img src="${work.mediaSrc}" alt="${work.title}">`;
    } else if (work.mediaType === 'video') {
        mediaHTML = `<video src="${work.mediaSrc}" poster="${work.mediaPoster || ''}"></video>`;
    } else {
        mediaHTML = `<div class="document-icon">📄</div>`;
    }

    return `
        <div class="work-item" data-id="${work.id}">
            <div class="work-item-media">
                ${mediaHTML}
                <div class="work-type-badge">${typeMap[work.type] || work.type}</div>
            </div>
            <div class="work-item-content">
                <div class="work-item-tag">${work.tag}</div>
                <h3 class="work-item-title">${work.title}</h3>
                <p class="work-item-description">${work.description}</p>
                <div class="work-item-meta">
                    <span class="meta-tag">${work.year}</span>
                    ${work.tech ? work.tech.split('·').map(t => `<span class="meta-tag">${t.trim()}</span>`).join('') : ''}
                </div>
                <div class="work-item-actions">
                    <button class="btn-edit" data-id="${work.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.43741 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        编辑
                    </button>
                    <button class="btn-delete" data-id="${work.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        删除
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== 绑定作品卡片事件 ====================
function attachWorkItemEvents() {
    // 编辑按钮
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const workId = btn.dataset.id;
            editWork(workId);
        });
    });

    // 删除按钮
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const workId = btn.dataset.id;
            if (confirm('确定要删除这个作品吗？')) {
                deleteWork(workId);
            }
        });
    });
}

// ==================== 编辑作品 ====================
async function editWork(workId) {
    const work = await IndexedDBManager.getWork(workId);
    if (!work) return;

    currentEditingWorkId = workId;
    currentUploadedFile = null;

    // 填充表单
    document.getElementById('modalTitle').textContent = '编辑作品';
    document.getElementById('workType').value = work.type;
    document.getElementById('workSize').value = work.size;
    document.getElementById('workTag').value = work.tag;
    document.getElementById('workTitle').value = work.title;
    document.getElementById('workDescription').value = work.description;
    document.getElementById('workYear').value = work.year;
    document.getElementById('workTech').value = work.tech;
    document.getElementById('workLink').value = work.link || '';
    
    // 如果是外部链接，填充到URL字段
    if (work.mediaSrc && (work.mediaSrc.startsWith('http://') || work.mediaSrc.startsWith('https://'))) {
        document.getElementById('workMediaUrl').value = work.mediaSrc;
    }

    // 显示已有的媒体文件
    if (work.mediaSrc) {
        const filePreview = document.getElementById('filePreview');
        filePreview.classList.add('active');
        
        if (work.mediaType === 'image') {
            filePreview.innerHTML = `
                <img src="${work.mediaSrc}" alt="预览">
                <div class="file-preview-info">
                    <span class="file-preview-name">已上传的图片</span>
                </div>
            `;
        } else if (work.mediaType === 'video') {
            filePreview.innerHTML = `
                <video src="${work.mediaSrc}" controls></video>
                <div class="file-preview-info">
                    <span class="file-preview-name">已上传的视频</span>
                </div>
            `;
        }
    }

    // 显示模态框
    document.getElementById('workModal').classList.add('active');
}

// ==================== 删除作品 ====================
async function deleteWork(workId) {
    await IndexedDBManager.deleteWork(workId);
    await loadWorks();
    showToast('作品已删除！', 'success');
}

// ==================== 加载个人信息 ====================
async function loadPersonalInfo() {
    const info = await IndexedDBManager.getPersonalInfo();

    document.getElementById('personName').value = info.name || '';
    document.getElementById('personTitle').value = info.title || '';
    document.getElementById('personEmail').value = info.email || '';
    document.getElementById('personLocation').value = info.location || '';
    document.getElementById('personExperience').value = info.experience || '';
    document.getElementById('personSpecialty').value = info.specialty || '';
    document.getElementById('contactEmail').value = info.contactEmail || '';
    document.getElementById('contactGithub').value = info.contactGithub || '';
    document.getElementById('contactTwitter').value = info.contactTwitter || '';
}

// ==================== 保存个人信息 ====================
async function savePersonalInfo() {
    const info = {
        name: document.getElementById('personName').value,
        title: document.getElementById('personTitle').value,
        email: document.getElementById('personEmail').value,
        location: document.getElementById('personLocation').value,
        experience: document.getElementById('personExperience').value,
        specialty: document.getElementById('personSpecialty').value,
        contactEmail: document.getElementById('contactEmail').value,
        contactGithub: document.getElementById('contactGithub').value,
        contactTwitter: document.getElementById('contactTwitter').value
    };

    await IndexedDBManager.savePersonalInfo(info);
    console.log('个人信息已保存到IndexedDB');
}

// ==================== 初始化事件监听器 ====================
function initEventListeners() {
    // 添加新作品按钮
    document.getElementById('addWorkBtn').addEventListener('click', () => {
        currentEditingWorkId = null;
        currentUploadedFile = null;
        resetWorkForm();
        document.getElementById('modalTitle').textContent = '添加新作品';
        document.getElementById('workModal').classList.add('active');
    });

    // 关闭模态框
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // 保存作品
    document.getElementById('saveWorkBtn').addEventListener('click', saveWork);

    // 保存所有更改
    document.getElementById('saveAllBtn').addEventListener('click', saveAll);

    // 文件上传
    const fileInput = document.getElementById('workMedia');
    fileInput.addEventListener('change', handleFileUpload);

    // 模态框点击外部关闭
    document.getElementById('workModal').addEventListener('click', (e) => {
        if (e.target.id === 'workModal') {
            closeModal();
        }
    });
}

// ==================== 文件上传处理 ====================
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // IndexedDB可以存储大文件，放宽限制到50MB
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showToast(`文件太大！请选择小于 50MB 的文件`, 'error');
        e.target.value = '';
        return;
    }
    
    // 显示文件大小提示
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.log(`准备上传文件: ${file.name}, 大小: ${sizeMB}MB`);

    currentUploadedFile = file;
    const filePreview = document.getElementById('filePreview');
    filePreview.classList.add('active');

    if (file.type.startsWith('image/')) {
        // 根据文件大小决定是否压缩
        const fileSizeKB = file.size / 1024;
        if (fileSizeKB > 500) {
            // 大于500KB的图片才压缩
            compressImage(file, (compressedDataUrl) => {
                filePreview.innerHTML = `
                    <img src="${compressedDataUrl}" alt="预览">
                    <div class="file-preview-info">
                        <span class="file-preview-name">${file.name}</span>
                        <span>${(file.size / 1024).toFixed(2)} KB → 已压缩优化</span>
                    </div>
                `;
            });
        } else {
            // 小文件直接使用
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreview.innerHTML = `
                    <img src="${e.target.result}" alt="预览">
                    <div class="file-preview-info">
                        <span class="file-preview-name">${file.name}</span>
                        <span>${(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    } else if (file.type.startsWith('video/')) {
        showToast(`正在处理视频 (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.innerHTML = `
                <video src="${e.target.result}" controls></video>
                <div class="file-preview-info">
                    <span class="file-preview-name">${file.name}</span>
                    <span>${(file.size / 1024 / 1024).toFixed(2)} MB - 使用IndexedDB存储</span>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        filePreview.innerHTML = `
            <div class="document-icon" style="font-size: 48px; text-align: center; padding: 20px;">📄</div>
            <div class="file-preview-info">
                <span class="file-preview-name">${file.name}</span>
                <span>${(file.size / 1024).toFixed(2)} KB</span>
            </div>
        `;
    }
}

// ==================== 图片压缩 ====================
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // 限制最大尺寸
            const maxWidth = 1200;
            const maxHeight = 1200;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 压缩质量 0.7
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            
            console.log(`图片压缩: ${(file.size / 1024).toFixed(2)}KB → ${(compressedDataUrl.length * 0.75 / 1024).toFixed(2)}KB`);
            
            callback(compressedDataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==================== 保存作品 ====================
async function saveWork() {
    console.log('开始保存作品...');
    
    const workType = document.getElementById('workType').value;
    const workSize = document.getElementById('workSize').value;
    const workTag = document.getElementById('workTag').value;
    const workTitle = document.getElementById('workTitle').value;
    const workDescription = document.getElementById('workDescription').value;
    const workYear = document.getElementById('workYear').value;
    const workTech = document.getElementById('workTech').value;
    const workLink = document.getElementById('workLink').value;
    const workMediaUrl = document.getElementById('workMediaUrl').value;

    // 验证必填项
    if (!workTitle.trim()) {
        showToast('请填写作品标题', 'error');
        console.log('验证失败：缺少标题');
        return;
    }

    if (!workDescription.trim()) {
        showToast('请填写作品描述', 'error');
        console.log('验证失败：缺少描述');
        return;
    }

    // 构建作品数据
    const workData = {
        type: workType,
        size: workSize,
        tag: workTag || workType,
        title: workTitle,
        description: workDescription,
        year: workYear || new Date().getFullYear().toString(),
        tech: workTech || '',
        link: workLink || ''
    };

    console.log('作品数据:', workData);

    // 优先使用外部链接
    if (workMediaUrl && workMediaUrl.trim()) {
        console.log('使用外部媒体链接:', workMediaUrl);
        if (workType === 'video') {
            workData.mediaType = 'video';
            workData.mediaSrc = workMediaUrl;
            workData.mediaPoster = '';
        } else if (workType === 'image') {
            workData.mediaType = 'image';
            workData.mediaSrc = workMediaUrl;
        } else {
            workData.mediaType = 'document';
            workData.mediaSrc = workMediaUrl;
        }
        saveWorkData(workData);
        return;
    }

    // 处理上传的文件
    if (currentUploadedFile) {
        console.log('处理上传文件:', currentUploadedFile.name);
        
        if (currentUploadedFile.type.startsWith('image/')) {
            // 使用压缩后的图片
            compressImage(currentUploadedFile, async (compressedDataUrl) => {
                workData.mediaType = 'image';
                workData.mediaSrc = compressedDataUrl;
                console.log('图片压缩完成，准备保存');
                await saveWorkData(workData);
            });
        } else if (currentUploadedFile.type.startsWith('video/')) {
            showToast('正在处理视频...', 'success');
            const reader = new FileReader();
            reader.onload = async (e) => {
                workData.mediaType = 'video';
                workData.mediaSrc = e.target.result;
                workData.mediaPoster = '';
                console.log('视频处理完成，准备保存');
                await saveWorkData(workData);
            };
            reader.onerror = (e) => {
                console.error('文件读取失败:', e);
                showToast('文件读取失败，请重试', 'error');
            };
            reader.readAsDataURL(currentUploadedFile);
        } else {
            workData.mediaType = 'document';
            workData.mediaSrc = '';
            console.log('文档类型，不保存文件内容');
            await saveWorkData(workData);
        }
    } else {
        // 如果没有新上传文件，保留原有媒体信息
        if (currentEditingWorkId) {
            const existingWork = await IndexedDBManager.getWork(currentEditingWorkId);
            workData.mediaType = existingWork.mediaType || 'image';
            workData.mediaSrc = existingWork.mediaSrc || '';
            workData.mediaPoster = existingWork.mediaPoster || '';
            console.log('编辑模式：使用现有媒体信息');
        } else {
            // 新作品没有上传文件时，使用占位图
            if (workType === 'document') {
                workData.mediaType = 'document';
                workData.mediaSrc = '';
            } else if (workType === 'video') {
                workData.mediaType = 'video';
                workData.mediaSrc = '';
                workData.mediaPoster = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800';
            } else {
                workData.mediaType = 'image';
                workData.mediaSrc = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800';
            }
            console.log('新作品：使用默认占位图');
        }
        await saveWorkData(workData);
    }
}

// ==================== 保存作品数据 ====================
async function saveWorkData(workData) {
    try {
        console.log('保存作品数据到IndexedDB:', workData);
        
        if (currentEditingWorkId) {
            // 更新现有作品
            workData.id = currentEditingWorkId;
            console.log('更新作品ID:', currentEditingWorkId);
            await IndexedDBManager.saveWork(workData);
            showToast('作品已更新！✅', 'success');
        } else {
            // 添加新作品
            workData.id = 'work_' + Date.now();
            console.log('添加新作品，ID:', workData.id);
            await IndexedDBManager.saveWork(workData);
            showToast('作品已添加！✅', 'success');
        }

        // 显示存储使用情况
        await showStorageInfo();

        // 延迟关闭模态框和刷新列表
        setTimeout(async () => {
            closeModal();
            await loadWorks();
            console.log('作品列表已刷新');
        }, 100);
        
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败：' + error.message, 'error');
    }
}

// ==================== 关闭模态框 ====================
function closeModal() {
    document.getElementById('workModal').classList.remove('active');
    resetWorkForm();
}

// ==================== 重置作品表单 ====================
function resetWorkForm() {
    document.getElementById('workType').value = 'video';
    document.getElementById('workSize').value = 'medium';
    document.getElementById('workTag').value = '';
    document.getElementById('workTitle').value = '';
    document.getElementById('workDescription').value = '';
    document.getElementById('workYear').value = '';
    document.getElementById('workTech').value = '';
    document.getElementById('workLink').value = '';
    document.getElementById('workMediaUrl').value = '';
    document.getElementById('workMedia').value = '';
    document.getElementById('filePreview').classList.remove('active');
    document.getElementById('filePreview').innerHTML = '';
    currentUploadedFile = null;
}

// ==================== 保存所有更改 ====================
async function saveAll() {
    try {
        await saveSiteInfo();
        await savePersonalInfo();
        await showStorageInfo();
        showToast('所有更改已保存！✅', 'success');
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败：' + error.message, 'error');
    }
}

// 导出到全局作用域，供其他脚本使用
window.saveAll = saveAll;
window.saveSiteInfo = saveSiteInfo;
window.savePersonalInfo = savePersonalInfo;
window.showStorageInfo = showStorageInfo;
window.showToast = showToast;

// ==================== 显示提示消息 ====================
function showToast(message, type = 'success') {
    console.log(`Toast: [${type}] ${message}`);
    const toast = document.getElementById('toast');
    
    if (!toast) {
        console.error('Toast元素不存在');
        alert(message); // 降级方案
        return;
    }
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

