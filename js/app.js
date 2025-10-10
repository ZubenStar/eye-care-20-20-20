// 主应用
const App = {
    // 应用状态
    state: {
        mode: 'work',           // 'work' 或 'break'
        isRunning: false,
        isPaused: false
    },

    // 计时器实例
    workTimer: null,
    breakTimer: null,
    currentTimer: null,

    // 设置
    settings: null,

    // 初始化应用
    init() {
        console.log('初始化 20-20-20 护眼助手...');
        
        // 加载设置
        this.settings = Storage.getSettings();
        
        // 初始化模块
        UI.init();
        NotificationSystem.init();
        
        // 创建计时器
        this.createTimers();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载统计数据
        this.loadStats();
        
        // 恢复保存的状态
        this.restoreState();
        
        // 初始化 UI
        this.updateUI();
        
        // 自动保存状态
        this.startAutoSave();
        
        // 请求通知权限
        if (this.settings.notificationEnabled) {
            NotificationSystem.requestPermission();
        }
        
        console.log('应用初始化完成！');
    },

    // 创建计时器
    createTimers() {
        // 工作计时器
        this.workTimer = new Timer(
            this.settings.workDuration,
            (remaining, total) => this.onWorkTick(remaining, total),
            () => this.onWorkComplete()
        );

        // 休息计时器
        this.breakTimer = new Timer(
            this.settings.breakDuration,
            (remaining, total) => this.onBreakTick(remaining, total),
            () => this.onBreakComplete()
        );

        this.currentTimer = this.workTimer;
    },

    // 绑定事件
    bindEvents() {
        const { elements } = UI;

        // 控制按钮
        elements.startBtn.addEventListener('click', () => this.handleStart());
        elements.pauseBtn.addEventListener('click', () => this.handlePause());
        elements.resetBtn.addEventListener('click', () => this.handleReset());

        // 休息提醒
        elements.skipBtn.addEventListener('click', () => this.handleSkipBreak());

        // 工具按钮
        elements.settingsBtn.addEventListener('click', () => UI.showSettingsModal());
        elements.statsBtn.addEventListener('click', () => UI.showStatsModal());
        elements.themeBtn.addEventListener('click', () => this.handleThemeToggle());

        // 模态框
        elements.closeSettings.addEventListener('click', () => UI.hideSettingsModal());
        elements.closeStats.addEventListener('click', () => UI.hideStatsModal());
        elements.saveSettings.addEventListener('click', () => this.handleSaveSettings());
        elements.resetStats.addEventListener('click', () => this.handleResetStats());

        // 点击模态框背景关闭
        elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === elements.settingsModal) {
                UI.hideSettingsModal();
            }
        });
        elements.statsModal.addEventListener('click', (e) => {
            if (e.target === elements.statsModal) {
                UI.hideStatsModal();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isModalOpen()) {
                e.preventDefault();
                if (this.state.isRunning && !this.state.isPaused) {
                    this.handlePause();
                } else {
                    this.handleStart();
                }
            }
        });
    },

    // 开始
    handleStart() {
        if (this.state.isPaused) {
            // 恢复
            this.currentTimer.resume();
            this.state.isPaused = false;
            UI.updateButtons('running');
            UI.updateStatusText(this.state.mode === 'work' ? '工作中 💼' : '休息中 😌');
        } else {
            // 开始
            this.currentTimer.start();
            this.state.isRunning = true;
            UI.updateButtons('running');
            UI.updateStatusText('工作中 💼');
        }
    },

    // 暂停
    handlePause() {
        this.currentTimer.pause();
        this.state.isPaused = true;
        UI.updateButtons('paused');
        UI.updateStatusText('已暂停 ⏸️');
    },

    // 重置
    handleReset() {
        // 停止当前计时器
        if (this.currentTimer) {
            this.currentTimer.stop();
        }

        // 重置状态
        this.state.mode = 'work';
        this.state.isRunning = false;
        this.state.isPaused = false;

        // 重置计时器
        this.workTimer.reset(this.settings.workDuration);
        this.breakTimer.reset(this.settings.breakDuration);
        this.currentTimer = this.workTimer;

        // 清除保存的状态
        Storage.clearTimerState();

        // 更新 UI
        this.updateUI();
        UI.updateButtons('idle');
        UI.updateStatusText('准备开始 ✨');
        UI.hideBreakReminder();
    },

    // 跳过休息
    handleSkipBreak() {
        if (this.state.mode === 'break') {
            this.breakTimer.complete();
        }
    },

    // 保存设置
    handleSaveSettings() {
        const newSettings = UI.getSettingsFromForm();
        
        // 验证设置
        if (newSettings.workDuration < 60 || newSettings.workDuration > 3600) {
            UI.showToast('工作时长必须在 1-60 分钟之间');
            return;
        }
        if (newSettings.breakDuration < 5 || newSettings.breakDuration > 120) {
            UI.showToast('休息时长必须在 5-120 秒之间');
            return;
        }

        // 保存设置
        Storage.saveSettings(newSettings);
        this.settings = newSettings;

        // 重新创建计时器
        this.handleReset();
        this.createTimers();

        // 关闭模态框
        UI.hideSettingsModal();
        UI.showToast('设置已保存 ✓');
    },

    // 重置统计
    handleResetStats() {
        if (confirm('确定要清空所有统计数据吗？此操作不可恢复。')) {
            Storage.resetStats();
            this.loadStats();
            UI.showToast('统计数据已清空');
        }
    },

    // 切换主题
    handleThemeToggle() {
        const theme = UI.toggleTheme();
        UI.showToast(theme === 'dark' ? '已切换到深色模式 🌙' : '已切换到浅色模式 ☀️');
    },

    // 工作计时回调
    onWorkTick(remaining, total) {
        UI.updateTimeDisplay(remaining);
        UI.updateProgress(remaining, total);
    },

    // 工作完成回调
    onWorkComplete() {
        console.log('工作时间结束，开始休息');
        
        // 切换到休息模式
        this.state.mode = 'break';
        this.currentTimer = this.breakTimer;

        // 发送提醒
        NotificationSystem.sendReminder('work', this.settings);

        // 显示休息提醒
        UI.showBreakReminder();
        UI.updateButtons('break');

        // 开始休息倒计时
        this.breakTimer.start();
    },

    // 休息计时回调
    onBreakTick(remaining, total) {
        UI.updateBreakTimer(remaining);
    },

    // 休息完成回调
    onBreakComplete() {
        console.log('休息时间结束');

        // 增加完成次数
        const stats = Storage.incrementCount();
        UI.updateStats(stats);

        // 隐藏休息提醒
        UI.hideBreakReminder();

        // 切换回工作模式
        this.state.mode = 'work';
        this.state.isRunning = false;
        this.state.isPaused = false;

        // 重置工作计时器
        this.workTimer.reset(this.settings.workDuration);
        this.currentTimer = this.workTimer;

        // 更新 UI
        this.updateUI();
        UI.updateButtons('idle');
        UI.updateStatusText('准备开始 ✨');

        // 发送完成提醒
        NotificationSystem.sendReminder('break', this.settings);
        UI.showToast('🎉 完成一次护眼循环！');
    },

    // 加载统计数据
    loadStats() {
        const stats = Storage.getStats();
        UI.updateStats(stats);
    },

    // 更新 UI
    updateUI() {
        const remaining = this.currentTimer.getRemainingTime();
        const total = this.currentTimer.duration;
        UI.updateTimeDisplay(remaining);
        UI.updateProgress(remaining, total);
    },

    // 检查是否有模态框打开
    isModalOpen() {
        return UI.elements.settingsModal.classList.contains('active') ||
               UI.elements.statsModal.classList.contains('active');
    },

    // 保存当前状态
    saveState() {
        const state = {
            mode: this.state.mode,
            isRunning: this.state.isRunning,
            isPaused: this.state.isPaused,
            workRemaining: this.workTimer.getRemainingTime(),
            breakRemaining: this.breakTimer.getRemainingTime(),
            workStartTime: this.workTimer.startTime,
            breakStartTime: this.breakTimer.startTime,
            workPausedTime: this.workTimer.pausedTime,
            breakPausedTime: this.breakTimer.pausedTime
        };
        Storage.saveTimerState(state);
    },

    // 恢复保存的状态
    restoreState() {
        const savedState = Storage.getTimerState();
        if (!savedState) {
            console.log('没有保存的状态');
            return;
        }

        console.log('恢复保存的状态:', savedState);

        // 恢复状态
        this.state.mode = savedState.mode;
        this.state.isRunning = savedState.isRunning;
        this.state.isPaused = savedState.isPaused;

        // 恢复计时器的时间戳和剩余时间
        this.workTimer.remaining = savedState.workRemaining;
        this.breakTimer.remaining = savedState.breakRemaining;
        this.workTimer.startTime = savedState.workStartTime;
        this.breakTimer.startTime = savedState.breakStartTime;
        this.workTimer.pausedTime = savedState.workPausedTime || 0;
        this.breakTimer.pausedTime = savedState.breakPausedTime || 0;

        // 设置当前计时器
        if (this.state.mode === 'work') {
            this.currentTimer = this.workTimer;
        } else {
            this.currentTimer = this.breakTimer;
        }

        // 如果正在运行且未暂停，继续计时
        if (this.state.isRunning && !this.state.isPaused) {
            if (this.state.mode === 'work') {
                // 检查工作时间是否已结束
                if (this.workTimer.remaining <= 0) {
                    this.onWorkComplete();
                } else {
                    this.workTimer.isRunning = true;
                    this.workTimer.start();
                    UI.updateButtons('running');
                    UI.updateStatusText('工作中 💼');
                }
            } else if (this.state.mode === 'break') {
                // 检查休息时间是否已结束
                if (this.breakTimer.remaining <= 0) {
                    this.onBreakComplete();
                } else {
                    this.breakTimer.isRunning = true;
                    UI.showBreakReminder();
                    this.breakTimer.start();
                    UI.updateButtons('break');
                }
            }
        } else if (this.state.isPaused) {
            // 恢复暂停状态
            this.currentTimer.isRunning = true;
            this.currentTimer.isPaused = true;
            UI.updateButtons('paused');
            UI.updateStatusText('已暂停 ⏸️');
        }

        console.log('状态恢复完成');
    },

    // 开始自动保存
    startAutoSave() {
        // 每秒保存一次状态
        setInterval(() => {
            if (this.state.isRunning) {
                this.saveState();
            }
        }, 1000);

        // 页面关闭前保存状态
        window.addEventListener('beforeunload', () => {
            if (this.state.isRunning) {
                this.saveState();
            }
        });

        // 页面隐藏时保存状态
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state.isRunning) {
                this.saveState();
            }
        });
    }
};

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}