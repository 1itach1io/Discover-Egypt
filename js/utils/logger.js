const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.search.includes('debug=true');
const logger = {
    log: function(...args) {
        isDevelopment && console.log(...args);
    },
    warn: function(...args) {
        isDevelopment && console.warn(...args);
    },
    error: function(...args) {
        console.error(...args);
    },
    info: function(...args) {
        console.info(...args);
    },
    success: function(message, ...args) {
        if (isDevelopment) {
            console.log('%c✅ ' + message, 'color:#22c55e;font-weight:700;', ...args);
        }
    },
    debug: function(message, color = '#3b82f6', ...args) {
        if (isDevelopment) {
            console.log('%c🐛 ' + message, `color:${color};font-weight:600;`, ...args);
        }
    },
    time: function(label) {
        if (isDevelopment) {
            console.time(label);
        }
    },
    timeEnd: function(label) {
        if (isDevelopment) {
            console.timeEnd(label);
        }
    },
    group: function(label) {
        isDevelopment && console.group(label);
    },
    groupEnd: function() {
        isDevelopment && console.groupEnd();
    },
    table: function(data) {
        isDevelopment && console.table(data);
    }
};
window.logger = logger;

// In production: keep console available but reduce noise.
// Muting console.log entirely can break some libraries/tools.
if (!isDevelopment) {
    const originalLog = console.log;
    console.log = (..._args) => {
        // no-op
    };
    console.log._original = originalLog;
}
window.addEventListener('error', (event) => {
    logger.error('Global Error:', event.error);
    if (typeof showNotification === 'function') {
        showNotification('عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
    }
});
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection:', event.reason);
});