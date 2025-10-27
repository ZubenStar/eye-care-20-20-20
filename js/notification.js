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
        this.setupVisibilityHandler();
    },

    // 设置页面可见性处理
    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            // 当页面重新可见时，确保音频上下文处于运行状态
            if (!document.hidden && this.audio && this.audio.context) {
                if (this.audio.context.state === 'suspended') {
                    console.log('页面重新可见，恢复音频上下文');
                    this.audio.context.resume().catch(err => {
                        console.error('恢复音频上下文失败:', err);
                    });
                }
            }
        });
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
            fallbackAudio: null,
            play: async () => {
                try {
                    // 创建音频上下文
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!this.audio.context) {
                        this.audio.context = new AudioContext();
                    }

                    const ctx = this.audio.context;
                    
                    // 如果音频上下文被暂停（在后台时可能发生），先恢复它
                    if (ctx.state === 'suspended') {
                        console.log('音频上下文已暂停，正在恢复...');
                        await ctx.resume();
                    }

                    // 再次检查状态，确保已恢复
                    if (ctx.state === 'running') {
                        // 播放第一个音
                        const oscillator = ctx.createOscillator();
                        const gainNode = ctx.createGain();

                        oscillator.connect(gainNode);
                        gainNode.connect(ctx.destination);

                        // 设置音调和音量
                        oscillator.frequency.value = 800; // 频率 800Hz
                        oscillator.type = 'sine';
                        gainNode.gain.value = 0.3;

                        // 播放 0.2 秒
                        const now = ctx.currentTime;
                        oscillator.start(now);
                        oscillator.stop(now + 0.2);

                        // 0.2秒后播放第二个音
                        setTimeout(() => {
                            try {
                                const oscillator2 = ctx.createOscillator();
                                const gainNode2 = ctx.createGain();

                                oscillator2.connect(gainNode2);
                                gainNode2.connect(ctx.destination);

                                oscillator2.frequency.value = 1000;
                                oscillator2.type = 'sine';
                                gainNode2.gain.value = 0.3;

                                const now2 = ctx.currentTime;
                                oscillator2.start(now2);
                                oscillator2.stop(now2 + 0.2);
                            } catch (err) {
                                console.error('播放第二个音失败:', err);
                            }
                        }, 200);
                    } else {
                        throw new Error('音频上下文状态异常: ' + ctx.state);
                    }
                } catch (error) {
                    console.error('Web Audio API 播放失败，尝试使用备用方案:', error);
                    // 备用方案：使用简单的提示音（beep）
                    this.playFallbackSound();
                }
            }
        };
    },

    // 备用音频播放方案
    playFallbackSound() {
        try {
            // 使用系统默认提示音
            if (window.speechSynthesis) {
                // 使用 Web Speech API 发出简单声音
                const utterance = new SpeechSynthesisUtterance('');
                utterance.volume = 0.3;
                utterance.rate = 10;
                utterance.pitch = 2;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('备用音频播放也失败:', error);
        }
    },

    // 播放提示音
    async playSound() {
        if (this.audio && this.audio.play) {
            try {
                await this.audio.play();
                console.log('提示音播放成功');
            } catch (error) {
                console.error('提示音播放失败:', error);
            }
        }
    },

    // 发送完整提醒（通知 + 声音）
    async sendReminder(type, settings) {
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

        // 播放提示音（优先播放，确保即使在后台也能响）
        if (settings.soundEnabled) {
            await this.playSound();
        }

        // 发送桌面通知
        if (settings.notificationEnabled) {
            this.sendNotification(
                message.title,
                message.body,
                '👁️',
                { requireInteraction: message.requireInteraction }
            );
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