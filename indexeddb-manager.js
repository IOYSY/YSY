/**
 * IndexedDB 存储管理器
 * 用于存储大文件（图片、视频等）
 */

const IndexedDBManager = {
    dbName: 'PortfolioDatabase',
    dbVersion: 1,
    db: null,

    /**
     * 初始化数据库
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = async () => {
                this.db = request.result;
                console.log('IndexedDB初始化成功');
                
                // 检查是否需要加载默认数据
                await this.loadDefaultDataIfEmpty();
                
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建对象存储
                if (!db.objectStoreNames.contains('works')) {
                    db.createObjectStore('works', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('siteInfo')) {
                    db.createObjectStore('siteInfo', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('personalInfo')) {
                    db.createObjectStore('personalInfo', { keyPath: 'id' });
                }

                console.log('IndexedDB数据库结构创建成功');
            };
        });
    },

    /**
     * 加载默认数据（如果数据库为空）
     */
    async loadDefaultDataIfEmpty() {
        try {
            // 检查是否已有数据
            const works = await this.getAllWorks();
            const siteInfo = await new Promise((resolve) => {
                const transaction = this.db.transaction(['siteInfo'], 'readonly');
                const store = transaction.objectStore('siteInfo');
                const request = store.get('main');
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
            
            // 如果数据库不为空，不加载默认数据
            if (works.length > 0 || siteInfo) {
                console.log('[DefaultData] 数据库已有数据，跳过加载默认数据');
                return;
            }
            
            console.log('[DefaultData] 数据库为空，尝试加载默认数据...');
            
            // 尝试加载 default-data.json
            const response = await fetch('default-data.json');
            if (!response.ok) {
                console.log('[DefaultData] 未找到 default-data.json，使用内置默认数据');
                return;
            }
            
            const defaultData = await response.json();
            console.log('[DefaultData] 成功加载默认数据文件');
            
            // 导入数据
            if (defaultData.data) {
                // 导入网站信息
                if (defaultData.data.siteInfo) {
                    await this.updateSiteInfo(defaultData.data.siteInfo);
                    console.log('[DefaultData] 已导入网站信息');
                }
                
                // 导入个人信息
                if (defaultData.data.personalInfo) {
                    await this.updatePersonalInfo(defaultData.data.personalInfo);
                    console.log('[DefaultData] 已导入个人信息');
                }
                
                // 导入作品
                if (defaultData.data.works && defaultData.data.works.length > 0) {
                    for (const work of defaultData.data.works) {
                        await this.addWork(work);
                    }
                    console.log(`[DefaultData] 已导入 ${defaultData.data.works.length} 个作品`);
                }
                
                console.log('[DefaultData] ✅ 默认数据加载完成！');
            }
        } catch (error) {
            console.warn('[DefaultData] 加载默认数据失败:', error);
            // 失败不影响正常使用，只是没有预设数据
        }
    },

    /**
     * 保存作品（支持大文件）
     */
    async saveWork(work) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['works'], 'readwrite');
            const store = transaction.objectStore('works');
            const request = store.put(work);

            request.onsuccess = () => {
                console.log('作品已保存到IndexedDB:', work.id);
                resolve(work);
            };

            request.onerror = () => {
                console.error('保存失败:', request.error);
                reject(request.error);
            };
        });
    },

    /**
     * 获取所有作品
     */
    async getAllWorks() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['works'], 'readonly');
            const store = transaction.objectStore('works');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    /**
     * 获取单个作品
     */
    async getWork(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['works'], 'readonly');
            const store = transaction.objectStore('works');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    /**
     * 删除作品
     */
    async deleteWork(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['works'], 'readwrite');
            const store = transaction.objectStore('works');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('作品已删除:', id);
                resolve();
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    /**
     * 保存网站信息
     */
    async saveSiteInfo(info) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            info.id = 'main';
            const transaction = this.db.transaction(['siteInfo'], 'readwrite');
            const store = transaction.objectStore('siteInfo');
            const request = store.put(info);

            request.onsuccess = () => resolve(info);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取网站信息
     */
    async getSiteInfo() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['siteInfo'], 'readonly');
            const store = transaction.objectStore('siteInfo');
            const request = store.get('main');

            request.onsuccess = () => {
                resolve(request.result || DataManager.getSiteInfo());
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    /**
     * 保存个人信息
     */
    async savePersonalInfo(info) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            info.id = 'main';
            const transaction = this.db.transaction(['personalInfo'], 'readwrite');
            const store = transaction.objectStore('personalInfo');
            const request = store.put(info);

            request.onsuccess = () => resolve(info);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * 获取个人信息
     */
    async getPersonalInfo() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['personalInfo'], 'readonly');
            const store = transaction.objectStore('personalInfo');
            const request = store.get('main');

            request.onsuccess = () => {
                resolve(request.result || DataManager.getPersonalInfo());
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    /**
     * 获取数据库使用情况
     */
    async getStorageEstimate() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            
            return {
                used: (usage / 1024 / 1024).toFixed(2) + ' MB',
                total: (quota / 1024 / 1024).toFixed(2) + ' MB',
                percentage: ((usage / quota) * 100).toFixed(2) + '%'
            };
        }
        return null;
    },

    // ==================== 辅助方法（用于数据导入） ====================

    /**
     * 添加作品（别名方法）
     */
    async addWork(work) {
        return await this.saveWork(work);
    },

    /**
     * 更新网站信息（别名方法）
     */
    async updateSiteInfo(info) {
        return await this.saveSiteInfo(info);
    },

    /**
     * 更新个人信息（别名方法）
     */
    async updatePersonalInfo(info) {
        return await this.savePersonalInfo(info);
    }
};

// 初始化
IndexedDBManager.init().catch(err => {
    console.error('IndexedDB初始化失败，将使用localStorage作为备选:', err);
});

