// 计时器核心类
class Timer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration;      // 总时长（秒）
        this.remaining = duration;     // 剩余时间（秒）
        this.onTick = onTick;         // 每秒回调
        this.onComplete = onComplete;  // 完成回调
        this.intervalId = null;
        this.isPaused = false;
        this.isRunning = false;
        this.startTime = null;         // 开始时间戳
        this.pausedTime = 0;           // 暂停累计时间
        this.lastPauseStart = null;    // 最后一次暂停的开始时间
    }

    // 启动计时器
    start() {
        if (this.isRunning && !this.isPaused) {
            return;
        }

        this.isRunning = true;
        this.isPaused = false;

        // 记录开始时间
        if (!this.startTime) {
            this.startTime = Date.now();
            this.pausedTime = 0;
        }

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                // 基于时间戳计算实际经过的时间
                const elapsed = Math.floor((Date.now() - this.startTime - this.pausedTime) / 1000);
                const newRemaining = Math.max(0, this.duration - elapsed);

                // 只有当剩余时间变化时才更新
                if (newRemaining !== this.remaining) {
                    this.remaining = newRemaining;

                    // 触发每秒回调
                    if (this.onTick) {
                        this.onTick(this.remaining, this.duration);
                    }

                    // 检查是否完成
                    if (this.remaining <= 0) {
                        this.complete();
                    }
                }
            }
        }, 100); // 使用更频繁的检查以保证准确性
    }

    // 暂停计时器
    pause() {
        if (!this.isPaused && this.isRunning) {
            this.isPaused = true;
            this.lastPauseStart = Date.now();
        }
    }

    // 恢复计时器
    resume() {
        if (this.isPaused && this.isRunning) {
            this.isPaused = false;
            if (this.lastPauseStart) {
                this.pausedTime += Date.now() - this.lastPauseStart;
                this.lastPauseStart = null;
            }
        }
    }

    // 停止计时器
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.isPaused = false;
    }

    // 重置计时器
    reset(newDuration) {
        this.stop();
        if (newDuration !== undefined) {
            this.duration = newDuration;
        }
        this.remaining = this.duration;
        this.startTime = null;
        this.pausedTime = 0;
        this.lastPauseStart = null;
    }

    // 完成计时
    complete() {
        this.stop();
        if (this.onComplete) {
            this.onComplete();
        }
    }

    // 获取剩余时间
    getRemainingTime() {
        return this.remaining;
    }

    // 获取进度百分比
    getProgress() {
        return ((this.duration - this.remaining) / this.duration) * 100;
    }

    // 格式化时间显示（分:秒）
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 检查是否正在运行
    getIsRunning() {
        return this.isRunning;
    }

    // 检查是否暂停
    getIsPaused() {
        return this.isPaused;
    }
}