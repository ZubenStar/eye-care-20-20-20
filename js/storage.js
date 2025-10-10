// 数据存储管理模块
const Storage = {
    // 默认设置
    defaultSettings: {
        workDuration: 1200,        // 20分钟（秒）
        breakDuration: 20,         // 20秒
        soundEnabled: true,
        notificationEnabled: true,
        theme: 'light'
    },

    // 默认统计数据
    defaultStats: {
        todayCount: 0,
        totalCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalBreakTime: 0
    },

    // 获取设置
    getSettings() {
        try {
            const settings = localStorage.getItem('eyeCareSettings');
            return settings ? JSON.parse(settings) : this.defaultSettings;
        } catch (error) {
            console.error('读取设置失败:', error);
            return this.defaultSettings;
        }
    },

    // 保存设置
    saveSettings(settings) {
        try {
            localStorage.setItem('eyeCareSettings', JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('保存设置失败:', error);
            return false;
        }
    },

    // 获取统计数据
    getStats() {
        try {
            const stats = localStorage.getItem('eyeCareStats');
            const data = stats ? JSON.parse(stats) : this.defaultStats;
            
            // 检查是否是新的一天，如果是则重置今日计数
            const today = new Date().toISOString().split('T')[0];
            if (data.lastResetDate !== today) {
                data.todayCount = 0;
                data.lastResetDate = today;
                this.saveStats(data);
            }
            
            return data;
        } catch (error) {
            console.error('读取统计数据失败:', error);
            return this.defaultStats;
        }
    },

    // 保存统计数据
    saveStats(stats) {
        try {
            localStorage.setItem('eyeCareStats', JSON.stringify(stats));
            return true;
        } catch (error) {
            console.error('保存统计数据失败:', error);
            return false;
        }
    },

    // 增加完成次数
    incrementCount() {
        const stats = this.getStats();
        stats.todayCount++;
        stats.totalCount++;
        stats.totalBreakTime += 20; // 每次休息20秒
        this.saveStats(stats);
        return stats;
    },

    // 重置统计数据
    resetStats() {
        this.saveStats(this.defaultStats);
        return this.defaultStats;
    },

    // 获取主题
    getTheme() {
        const settings = this.getSettings();
        return settings.theme || 'light';
    },

    // 保存主题
    saveTheme(theme) {
        const settings = this.getSettings();
        settings.theme = theme;
        this.saveSettings(settings);
    },

    // 保存计时器状态
    saveTimerState(state) {
        try {
            const timerState = {
                mode: state.mode,
                isRunning: state.isRunning,
                isPaused: state.isPaused,
                workRemaining: state.workRemaining,
                breakRemaining: state.breakRemaining,
                timestamp: Date.now()
            };
            localStorage.setItem('eyeCareTimerState', JSON.stringify(timerState));
            return true;
        } catch (error) {
            console.error('保存计时器状态失败:', error);
            return false;
        }
    },

    // 获取计时器状态
    getTimerState() {
        try {
            const state = localStorage.getItem('eyeCareTimerState');
            if (!state) return null;
            
            const timerState = JSON.parse(state);
            const elapsed = Math.floor((Date.now() - timerState.timestamp) / 1000);
            
            // 如果超过5分钟没有活动，清除状态
            if (elapsed > 300) {
                this.clearTimerState();
                return null;
            }
            
            // 调整剩余时间（考虑页面关闭期间的时间流逝）
            if (timerState.isRunning && !timerState.isPaused) {
                if (timerState.mode === 'work') {
                    timerState.workRemaining = Math.max(0, timerState.workRemaining - elapsed);
                } else if (timerState.mode === 'break') {
                    timerState.breakRemaining = Math.max(0, timerState.breakRemaining - elapsed);
                }
            }
            
            return timerState;
        } catch (error) {
            console.error('读取计时器状态失败:', error);
            return null;
        }
    },

    // 清除计时器状态
    clearTimerState() {
        try {
            localStorage.removeItem('eyeCareTimerState');
            return true;
        } catch (error) {
            console.error('清除计时器状态失败:', error);
            return false;
        }
    }
};