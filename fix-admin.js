/**
 * 管理后台修复脚本
 * 在admin.html中引入此文件来修复切换和保存问题
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 运行修复脚本...');
    
    // 修复1: 强制重新绑定侧边栏事件
    setTimeout(() => {
        fixSidebar();
        fixSaveButton();
    }, 100);
});

function fixSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');
    
    console.log('修复侧边栏:');
    console.log('  菜单项:', menuItems.length);
    console.log('  内容区域:', sections.length);
    
    if (menuItems.length === 0) {
        console.error('  ❌ 未找到菜单项！');
        return;
    }
    
    // 移除旧的事件监听器并重新绑定
    menuItems.forEach(item => {
        // 克隆节点以移除所有旧事件
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // 重新绑定点击事件
        newItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const targetSection = newItem.dataset.section;
            console.log('  点击菜单:', targetSection);
            
            // 移除所有active类
            document.querySelectorAll('.menu-item').forEach(mi => {
                mi.classList.remove('active');
            });
            newItem.classList.add('active');
            
            // 切换内容区域
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            const targetId = `${targetSection}-section`;
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.classList.add('active');
                targetElement.style.display = 'block';
                console.log('  ✅ 激活:', targetId);
            } else {
                console.error('  ❌ 未找到区域:', targetId);
            }
        });
    });
    
    console.log('  ✅ 侧边栏修复完成');
}

function fixSaveButton() {
    const saveBtn = document.getElementById('saveAllBtn');
    
    if (!saveBtn) {
        console.error('  ❌ 未找到保存按钮！');
        return;
    }
    
    console.log('修复保存按钮:');
    
    // 克隆按钮以移除旧事件
    const newBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newBtn, saveBtn);
    
    // 重新绑定点击事件
    newBtn.addEventListener('click', async () => {
        console.log('  点击保存按钮');
        
        try {
            // 等待window和函数加载完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 尝试多种方式调用保存函数
            if (typeof window.saveAll === 'function') {
                console.log('  调用 window.saveAll');
                await window.saveAll();
            } else if (typeof saveAll === 'function') {
                console.log('  调用 saveAll');
                await saveAll();
            } else if (typeof window.saveSiteInfo === 'function' && typeof window.savePersonalInfo === 'function') {
                console.log('  调用 saveSiteInfo 和 savePersonalInfo');
                await window.saveSiteInfo();
                await window.savePersonalInfo();
                
                if (typeof window.showStorageInfo === 'function') {
                    await window.showStorageInfo();
                }
                
                if (typeof window.showToast === 'function') {
                    window.showToast('所有更改已保存！✅', 'success');
                } else {
                    alert('所有更改已保存！✅');
                }
            } else {
                console.error('  ❌ 保存函数不存在');
                console.log('  可用的全局函数:', Object.keys(window).filter(k => k.includes('save')));
                alert('保存失败：函数未定义。请检查控制台查看详细信息。');
            }
        } catch (error) {
            console.error('  ❌ 保存失败:', error);
            alert('保存失败：' + error.message);
        }
    });
    
    console.log('  ✅ 保存按钮修复完成');
}

console.log('✅ 修复脚本已加载');

