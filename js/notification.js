// 通知系统模块
const NotificationSystem = {
    // 权限状态
    permission: 'default',

    // 音频对象
    audio: null,

    // 初始化
    init() {
        this.checkPermission();
        this.initAudio();
    },

    // 检查通知权限
    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    },

    // 请求通知权限
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('浏览器不支持桌面通知');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('请求通知权限失败:', error);
            return false;
        }
    },

    // 发送桌面通知
    sendNotification(title, body, icon = '👁️', options = {}) {
        if (!('Notification' in window)) {
            return;
        }

        if (this.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    body: body,
                    icon: icon,
                    badge: icon,
                    tag: 'eye-care-reminder',
                    requireInteraction: options.requireInteraction || false,
                    silent: false,
                    // 添加震动支持（移动设备）
                    vibrate: [200, 100, 200],
                    // 重新通知（即使标签页在后台也会显示）
                    renotify: true
                });

                // 根据选项决定关闭时间
                const autoCloseTime = options.requireInteraction ? 10000 : 5000;
                setTimeout(() => notification.close(), autoCloseTime);

                // 点击通知时聚焦窗口
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (error) {
                console.error('发送通知失败:', error);
            }
        } else if (this.permission === 'default') {
            // 如果还没请求过权限，则请求
            this.requestPermission();
        }
    },

    // 初始化音频
    initAudio() {
        // 使用 Web Audio API 生成简单的提示音
        this.audio = {
            context: null,
            play: () => {
                try {
                    // 创建音频上下文
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!this.audio.context) {
                        this.audio.context = new AudioContext();
                    }

                    const ctx = this.audio.context;
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    // 设置音调和音量
                    oscillator.frequency.value = 800; // 频率 800Hz
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.3;

                    // 播放 0.2 秒
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.2);

                    // 0.1秒后播放第二个音
                    setTimeout(() => {
                        const oscillator2 = ctx.createOscillator();
                        const gainNode2 = ctx.createGain();

                        oscillator2.connect(gainNode2);
                        gainNode2.connect(ctx.destination);

                        oscillator2.frequency.value = 1000;
                        oscillator2.type = 'sine';
                        gainNode2.gain.value = 0.3;

                        oscillator2.start(ctx.currentTime);
                        oscillator2.stop(ctx.currentTime + 0.2);
                    }, 200);
                } catch (error) {
                    console.error('播放音频失败:', error);
                }
            }
        };
    },

    // 播放提示音
    playSound() {
        if (this.audio && this.audio.play) {
            this.audio.play();
        }
    },

    // 发送完整提醒（通知 + 声音）
    sendReminder(type, settings) {
        const messages = {
            work: {
                title: '🌟 休息时间到了！',
                body: '请看向 6 米（20英尺）外的物体，休息 20 秒',
                requireInteraction: true  // 工作结束需要用户注意
            },
            break: {
                title: '💼 休息结束',
                body: '继续专注工作吧！',
                requireInteraction: false
            }
        };

        const message = messages[type];
        if (!message) return;

        // 发送桌面通知
        if (settings.notificationEnabled) {
            this.sendNotification(
                message.title,
                message.body,
                '👁️',
                { requireInteraction: message.requireInteraction }
            );
        }

        // 播放提示音
        if (settings.soundEnabled) {
            this.playSound();
        }

        // 如果页面在后台，在标题中显示提醒
        if (document.hidden) {
            this.flashTitle(message.title);
        }
    },

    // 在标题栏闪烁提醒
    flashTitle(message) {
        const originalTitle = document.title;
        let count = 0;
        const maxFlashes = 10;

        const interval = setInterval(() => {
            if (!document.hidden || count >= maxFlashes) {
                document.title = originalTitle;
                clearInterval(interval);
                return;
            }

            document.title = count % 2 === 0 ? message : originalTitle;
            count++;
        }, 1000);

        // 页面重新可见时恢复标题
        const visibilityHandler = () => {
            document.title = originalTitle;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', visibilityHandler);
        };
        document.addEventListener('visibilitychange', visibilityHandler);
    },

    // 检查是否支持通知
    isSupported() {
        return 'Notification' in window;
    },

    // 获取权限状态
    getPermission() {
        return this.permission;
    }
};