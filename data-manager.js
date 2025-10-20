/**
 * 数据管理模块
 * 负责localStorage的读写操作
 */

const DataManager = {
    // 存储键名
    KEYS: {
        SITE_INFO: 'portfolio_site_info',
        WORKS: 'portfolio_works',
        PERSONAL_INFO: 'portfolio_personal_info'
    },

    /**
     * 获取网站信息
     */
    getSiteInfo() {
        const defaultData = {
            siteTitle: '个人作品集 - Portfolio',
            logoText: 'YSY',
            logoSubtitle: 'Portfolio',
            heroTitle1: '创造',
            heroTitle2: '科技未来',
            heroSubtitle: '探索创新 · 设计极致 · 代码艺术',
            aboutText: '我是一名充满热情的创作者，专注于将创新技术与美学设计相结合。通过代码、设计和创意，我致力于打造令人印象深刻的数字体验。',
            aboutSkills: '全栈开发 · UI/UX设计 · 数据可视化 · 3D动画'
        };

        const stored = localStorage.getItem(this.KEYS.SITE_INFO);
        return stored ? JSON.parse(stored) : defaultData;
    },

    /**
     * 保存网站信息
     */
    setSiteInfo(data) {
        localStorage.setItem(this.KEYS.SITE_INFO, JSON.stringify(data));
    },

    /**
     * 获取所有作品
     */
    getWorks() {
        const defaultWorks = [
            {
                id: 'work_1',
                type: 'video',
                size: 'large',
                mediaType: 'video',
                mediaSrc: 'your-video-1.mp4',
                mediaPoster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
                tag: '视频项目',
                title: 'AI驱动的智能应用',
                description: '基于最新人工智能技术打造的创新应用，融合机器学习与用户体验设计，为用户提供智能化的解决方案。该项目获得了2024年度创新大奖。',
                year: '2024',
                tech: 'AI · 机器学习 · React · Python',
                link: '#'
            },
            {
                id: 'work_2',
                type: 'image',
                size: 'medium',
                mediaType: 'image',
                mediaSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                tag: '可视化设计',
                title: '数据可视化仪表盘',
                description: '企业级数据可视化平台，实时展示关键业务指标，支持多维度数据分析和交互式图表展示。',
                year: '2024',
                tech: 'D3.js · Vue',
                link: ''
            },
            {
                id: 'work_3',
                type: 'document',
                size: 'medium',
                mediaType: 'document',
                mediaSrc: '',
                tag: '技术文档',
                title: '区块链技术研究报告',
                description: '深入研究区块链技术的应用场景与未来发展趋势，包含详细的技术架构分析和实践案例。',
                year: '2023',
                tech: 'PDF · 42页',
                link: '#'
            },
            {
                id: 'work_4',
                type: 'image',
                size: 'large',
                mediaType: 'image',
                mediaSrc: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200',
                tag: 'UI/UX设计',
                title: '智能家居控制系统',
                description: '为智能家居品牌设计的全新控制系统界面，采用极简设计理念，通过直观的交互方式让用户轻松管理所有智能设备。荣获红点设计奖。',
                year: '2023',
                tech: 'UI设计 · 交互设计 · Figma · Flutter',
                link: '#'
            },
            {
                id: 'work_5',
                type: 'video',
                size: 'medium',
                mediaType: 'video',
                mediaSrc: 'your-video-2.mp4',
                mediaPoster: 'https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=800',
                tag: '动画制作',
                title: '品牌宣传片',
                description: '为科技公司制作的品牌宣传视频，运用3D动画技术展现产品特性和企业愿景。',
                year: '2023',
                tech: '3D · After Effects',
                link: ''
            },
            {
                id: 'work_6',
                type: 'document',
                size: 'medium',
                mediaType: 'document',
                mediaSrc: '',
                tag: '设计文档',
                title: '产品设计规范手册',
                description: '完整的产品设计规范文档，包含色彩系统、组件库、交互规范等内容。',
                year: '2024',
                tech: 'PDF · 68页',
                link: '#'
            }
        ];

        const stored = localStorage.getItem(this.KEYS.WORKS);
        return stored ? JSON.parse(stored) : defaultWorks;
    },

    /**
     * 保存所有作品
     */
    setWorks(works) {
        localStorage.setItem(this.KEYS.WORKS, JSON.stringify(works));
    },

    /**
     * 添加单个作品
     */
    addWork(work) {
        const works = this.getWorks();
        work.id = 'work_' + Date.now();
        works.push(work);
        this.setWorks(works);
        return work;
    },

    /**
     * 更新单个作品
     */
    updateWork(id, updatedWork) {
        const works = this.getWorks();
        const index = works.findIndex(w => w.id === id);
        if (index !== -1) {
            works[index] = { ...works[index], ...updatedWork, id };
            this.setWorks(works);
            return works[index];
        }
        return null;
    },

    /**
     * 删除单个作品
     */
    deleteWork(id) {
        const works = this.getWorks();
        const filtered = works.filter(w => w.id !== id);
        this.setWorks(filtered);
        return filtered;
    },

    /**
     * 获取单个作品
     */
    getWork(id) {
        const works = this.getWorks();
        return works.find(w => w.id === id);
    },

    /**
     * 获取个人信息
     */
    getPersonalInfo() {
        const defaultData = {
            name: 'YSY',
            title: '全栈开发 · UI设计师',
            email: 'your.email@example.com',
            location: '中国',
            experience: '5+ 年',
            specialty: 'React · Vue · UI/UX',
            contactEmail: 'mailto:your.email@example.com',
            contactGithub: 'https://github.com/yourusername',
            contactTwitter: 'https://twitter.com/yourusername',
            skills: [
                { icon: '💻', name: '全栈开发' },
                { icon: '🎨', name: 'UI/UX设计' },
                { icon: '📊', name: '数据可视化' },
                { icon: '🎬', name: '视频制作' }
            ]
        };

        const stored = localStorage.getItem(this.KEYS.PERSONAL_INFO);
        return stored ? JSON.parse(stored) : defaultData;
    },

    /**
     * 保存个人信息
     */
    setPersonalInfo(data) {
        localStorage.setItem(this.KEYS.PERSONAL_INFO, JSON.stringify(data));
    },

    /**
     * 导出所有数据
     */
    exportAllData() {
        return {
            siteInfo: this.getSiteInfo(),
            works: this.getWorks(),
            personalInfo: this.getPersonalInfo()
        };
    },

    /**
     * 导入所有数据
     */
    importAllData(data) {
        if (data.siteInfo) this.setSiteInfo(data.siteInfo);
        if (data.works) this.setWorks(data.works);
        if (data.personalInfo) this.setPersonalInfo(data.personalInfo);
    },

    /**
     * 清空所有数据
     */
    clearAllData() {
        localStorage.removeItem(this.KEYS.SITE_INFO);
        localStorage.removeItem(this.KEYS.WORKS);
        localStorage.removeItem(this.KEYS.PERSONAL_INFO);
    }
};

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}

