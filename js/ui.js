// UI 更新逻辑模块
const UI = {
    // DOM 元素缓存
    elements: {},

    // 初始化
    init() {
        this.cacheElements();
        this.initTheme();
    },

    // 缓存 DOM 元素
    cacheElements() {
        this.elements = {
            // 计时器显示
            timeDisplay: document.getElementById('timeDisplay'),
            statusText: document.getElementById('statusText'),
            progressCircle: document.querySelector('.progress-ring-circle'),

            // 控制按钮
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),

            // 统计显示
            todayCount: document.getElementById('todayCount'),
            totalCount: document.getElementById('totalCount'),

            // 休息提醒
            breakOverlay: document.getElementById('breakOverlay'),
            breakTimer: document.getElementById('breakTimer'),
            breakHint: document.getElementById('breakHint'),
            startBreakBtn: document.getElementById('startBreakBtn'),
            skipBtn: document.getElementById('skipBtn'),

            // 模态框
            settingsModal: document.getElementById('settingsModal'),
            statsModal: document.getElementById('statsModal'),

            // 设置项
            workDuration: document.getElementById('workDuration'),
            breakDuration: document.getElementById('breakDuration'),
            soundEnabled: document.getElementById('soundEnabled'),
            notificationEnabled: document.getElementById('notificationEnabled'),

            // 统计详情
            statsToday: document.getElementById('statsToday'),
            statsTotal: document.getElementById('statsTotal'),
            statsTime: document.getElementById('statsTime'),

            // 工具按钮
            settingsBtn: document.getElementById('settingsBtn'),
            statsBtn: document.getElementById('statsBtn'),
            themeBtn: document.getElementById('themeBtn'),
            closeSettings: document.getElementById('closeSettings'),
            closeStats: document.getElementById('closeStats'),
            saveSettings: document.getElementById('saveSettings'),
            resetStats: document.getElementById('resetStats')
        };
    },

    // 初始化主题
    initTheme() {
        const theme = Storage.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    },

    // 更新时间显示
    updateTimeDisplay(seconds) {
        const formatted = Timer.formatTime(seconds);
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = formatted;
        }
    },

    // 更新状态文本
    updateStatusText(text) {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
    },

    // 更新进度环
    updateProgress(remaining, total) {
        if (!this.elements.progressCircle) return;

        const progress = ((total - remaining) / total);
        const circumference = 2 * Math.PI * 120; // 半径为 120
        const offset = circumference * (1 - progress);

        this.elements.progressCircle.style.strokeDashoffset = offset;
    },

    // 更新按钮状态
    updateButtons(state) {
        const { startBtn, pauseBtn, resetBtn } = this.elements;

        switch (state) {
            case 'idle':
                startBtn.disabled = false;
                startBtn.querySelector('.btn-text').textContent = '开始';
                startBtn.querySelector('.btn-icon').textContent = '▶️';
                pauseBtn.disabled = true;
                resetBtn.disabled = false;
                break;

            case 'running':
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                pauseBtn.querySelector('.btn-text').textContent = '暂停';
                pauseBtn.querySelector('.btn-icon').textContent = '⏸️';
                resetBtn.disabled = false;
                break;

            case 'paused':
                startBtn.disabled = false;
                startBtn.querySelector('.btn-text').textContent = '继续';
                startBtn.querySelector('.btn-icon').textContent = '▶️';
                pauseBtn.disabled = true;
                resetBtn.disabled = false;
                break;

            case 'break':
                startBtn.disabled = true;
                pauseBtn.disabled = true;
                resetBtn.disabled = true;
                break;
        }
    },

    // 更新统计显示
    updateStats(stats) {
        if (this.elements.todayCount) {
            this.elements.todayCount.textContent = stats.todayCount;
        }
        if (this.elements.totalCount) {
            this.elements.totalCount.textContent = stats.totalCount;
        }
    },

    // 更新统计详情
    updateStatsDetail(stats) {
        if (this.elements.statsToday) {
            this.elements.statsToday.textContent = stats.todayCount;
        }
        if (this.elements.statsTotal) {
            this.elements.statsTotal.textContent = stats.totalCount;
        }
        if (this.elements.statsTime) {
            const minutes = Math.floor(stats.totalBreakTime / 60);
            this.elements.statsTime.textContent = minutes;
        }
    },

    // 显示休息提醒
    showBreakReminder() {
        if (this.elements.breakOverlay) {
            this.elements.breakOverlay.classList.add('active');
        }
    },

    // 隐藏休息提醒
    hideBreakReminder() {
        if (this.elements.breakOverlay) {
            this.elements.breakOverlay.classList.remove('active');
        }
    },

    // 更新休息倒计时
    updateBreakTimer(seconds) {
        if (this.elements.breakTimer) {
            this.elements.breakTimer.textContent = seconds;
        }
    },

    // 显示设置模态框
    showSettingsModal() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.add('active');
            this.loadSettings();
        }
    },

    // 隐藏设置模态框
    hideSettingsModal() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('active');
        }
    },

    // 显示统计模态框
    showStatsModal() {
        if (this.elements.statsModal) {
            this.elements.statsModal.classList.add('active');
            const stats = Storage.getStats();
            this.updateStatsDetail(stats);
        }
    },

    // 隐藏统计模态框
    hideStatsModal() {
        if (this.elements.statsModal) {
            this.elements.statsModal.classList.remove('active');
        }
    },

    // 加载设置到表单
    loadSettings() {
        const settings = Storage.getSettings();
        
        if (this.elements.workDuration) {
            this.elements.workDuration.value = settings.workDuration / 60;
        }
        if (this.elements.breakDuration) {
            this.elements.breakDuration.value = settings.breakDuration;
        }
        if (this.elements.soundEnabled) {
            this.elements.soundEnabled.checked = settings.soundEnabled;
        }
        if (this.elements.notificationEnabled) {
            this.elements.notificationEnabled.checked = settings.notificationEnabled;
        }
    },

    // 从表单获取设置
    getSettingsFromForm() {
        return {
            workDuration: parseInt(this.elements.workDuration.value) * 60,
            breakDuration: parseInt(this.elements.breakDuration.value),
            soundEnabled: this.elements.soundEnabled.checked,
            notificationEnabled: this.elements.notificationEnabled.checked,
            theme: Storage.getTheme()
        };
    },

    // 切换主题
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        const theme = isDark ? 'dark' : 'light';
        Storage.saveTheme(theme);
        return theme;
    },

    // 显示提示消息
    showToast(message, duration = 2000) {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    }
};