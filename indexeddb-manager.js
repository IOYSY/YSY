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

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB初始化成功');
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
    }
};

// 初始化
IndexedDBManager.init().catch(err => {
    console.error('IndexedDB初始化失败，将使用localStorage作为备选:', err);
});

