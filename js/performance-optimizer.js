(function() {
    'use strict';

    const CONFIG = {
        isDevelopment: window.location.search.includes('debug=true') ||
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1',
        performanceThresholds: {
            slow: 3000,
            verySlow: 5000,
            cssLoad: 1000,
            jsLoad: 2000
        },
        errorHandling: {
            showUserNotifications: false,
            logToConsole: true,
            reportToServer: false
        }
    };
    
    const Logger = {
        _originalConsole: { ...window.console },
        log: function(...args) {
            CONFIG.isDevelopment && this._originalConsole.log(...args);
        },
        debug: function(...args) {
            CONFIG.isDevelopment && this._originalConsole.debug(...args);
        },
        info: function(...args) {
            CONFIG.isDevelopment && this._originalConsole.info(...args);
        },
        warn: function(...args) {
            this._originalConsole.warn(...args);
        },
        error: function(...args) {
            this._originalConsole.error(...args);
        },
        group: function(...args) {
            CONFIG.isDevelopment && this._originalConsole.group(...args);
        },
        groupEnd: function() {
            CONFIG.isDevelopment && this._originalConsole.groupEnd();
        }
    };
    
    if (!CONFIG.isDevelopment) {
        window.console = Logger;
    }

    const PerformanceMonitor = {
        metrics: {},
        startTime: performance.now(),
        
        init: function() {
            this.monitorPageLoad();
            this.monitorResourceLoad();
            this.monitorUserTiming();
        },
        
        monitorPageLoad: function() {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.timing;
                    const metrics = {
                        dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcpConnection: perfData.connectEnd - perfData.connectStart,
                        requestTime: perfData.responseStart - perfData.requestStart,
                        responseTime: perfData.responseEnd - perfData.responseStart,
                        domProcessing: perfData.domComplete - perfData.domLoading,
                        totalLoad: perfData.loadEventEnd - perfData.navigationStart
                    };
                    
                    this.metrics = metrics;
                    this.logPerformance(metrics);
                    this.checkThresholds(metrics.totalLoad);
                }, 0);
            });
        },
        
        monitorResourceLoad: function() {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.checkResourcePerformance(entry);
                    }
                });
                
                try {
                    observer.observe({ entryTypes: ['resource'] });
                } catch (e) {
                    Logger.warn('⚠️ PerformanceObserver not fully supported');
                }
            }
        },
        
        monitorUserTiming: function() {
            
            window.markPerformance = (name) => {
                if ('performance' in window && performance.mark) {
                    performance.mark(name);
                }
            };
            
            window.measurePerformance = (name, startMark, endMark) => {
                if ('performance' in window && performance.measure) {
                    try {
                        performance.measure(name, startMark, endMark);
                        const measure = performance.getEntriesByName(name)[0];
                        Logger.log(`⏱️ ${name}: ${Math.round(measure.duration)}ms`);
                        return measure.duration;
                    } catch (e) {
                        Logger.warn('⚠️ Performance measurement failed:', e);
                    }
                }
            };
        },
        
        checkResourcePerformance: function(entry) {
            
            
            const isFirebaseInternal = entry.name.includes('firestore.googleapis.com') ||
                                       entry.name.includes('channel?gsessionid') ||
                                       entry.name.includes('google.firestore');
            if (isFirebaseInternal) return;

            const loadTime = entry.responseEnd - entry.startTime;
            
            
            let threshold;
            if (entry.initiatorType === 'css') {
                threshold = CONFIG.performanceThresholds.cssLoad;
            } else if (entry.initiatorType === 'img') {
                threshold = 5000;  
            } else {
                threshold = CONFIG.performanceThresholds.jsLoad;
            }
            
            if (loadTime > threshold) {
                Logger.warn(
                    `⚠️ Slow ${entry.initiatorType} load:`,
                    entry.name.split('/').pop(),
                    `${Math.round(loadTime)}ms`
                );
            }
        },
        
        logPerformance: function(metrics) {
            Logger.group('📊 Performance Metrics');
            Logger.log('⏱️ DNS Lookup:', metrics.dnsLookup + 'ms');
            Logger.log('⏱️ TCP Connection:', metrics.tcpConnection + 'ms');
            Logger.log('⏱️ Request Time:', metrics.requestTime + 'ms');
            Logger.log('⏱️ Response Time:', metrics.responseTime + 'ms');
            Logger.log('⏱️ DOM Processing:', metrics.domProcessing + 'ms');
            Logger.log('⏱️ Total Load Time:', metrics.totalLoad + 'ms');
            Logger.groupEnd();
        },
        
        checkThresholds: function(totalTime) {
            const { slow, verySlow } = CONFIG.performanceThresholds;
            
            if (totalTime > verySlow) {
                Logger.error('🐌 Very slow page load detected!', totalTime + 'ms');
            } else if (totalTime > slow) {
                Logger.warn('⚠️ Slow page load detected!', totalTime + 'ms');
            } else {
                Logger.log('⚡ Page loaded fast!', totalTime + 'ms');
            }
        }
    };
    
    
    
    const ErrorHandler = {
        errors: [],
        
        init: function() {
            this.setupGlobalErrorHandler();
            this.setupUnhandledRejectionHandler();
            this.setupResourceErrorHandler();
        },
        
        setupGlobalErrorHandler: function() {
            window.addEventListener('error', (event) => {
                this.handleError({
                    type: 'JavaScript Error',
                    message: event.message,
                    filename: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    error: event.error,
                    timestamp: new Date().toISOString()
                });
            });
        },
        
        setupUnhandledRejectionHandler: function() {
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    type: 'Unhandled Promise Rejection',
                    message: event.reason?.message || event.reason,
                    error: event.reason,
                    timestamp: new Date().toISOString()
                });
            });
        },
        
        setupResourceErrorHandler: function() {
            window.addEventListener('error', (event) => {
                if (event.target !== window) {
                    this.handleResourceError(event.target);
                }
            }, true);
        },
        
        handleError: function(errorInfo) {
            this.errors.push(errorInfo);
            
            if (CONFIG.errorHandling.logToConsole) {
                // Log a concise message first (avoids noisy "Object" logs in some consoles)
                Logger.error('🚨 Error Detected:', errorInfo.type + ': ' + errorInfo.message);
                if (CONFIG.isDevelopment) {
                    Logger.error(errorInfo);
                }
            }
            
            if (CONFIG.errorHandling.showUserNotifications) {
                this.showUserNotification(errorInfo);
            }
            
            
            if (CONFIG.errorHandling.reportToServer) {
                this.reportToServer(errorInfo);
            }
        },
        
        handleResourceError: function(target) {
            const resource = {
                type: target.tagName,
                src: target.src || target.href,
                timestamp: new Date().toISOString()
            };
            
            Logger.error('❌ Resource failed to load:', resource);
            this.errors.push(resource);
        },
        
        showUserNotification: function(errorInfo) {
            
            const message = this.getUserFriendlyMessage(errorInfo.type);
            console.warn('User notification:', message);
            
        },
        
        getUserFriendlyMessage: function(errorType) {
            const messages = {
                'JavaScript Error': 'حدث خطأ غير متوقع. يرجى تحديث الصفحة.',
                'Unhandled Promise Rejection': 'حدث خطأ في تحميل البيانات.',
                'default': 'حدث خطأ. يرجى المحاولة مرة أخرى.'
            };
            
            return messages[errorType] || messages.default;
        },
        
        reportToServer: function(errorInfo) {
            
            Logger.log('📤 Would report to server:', errorInfo);
        }
    };
    
    
    
    window.handleFirebaseError = function(error) {
        Logger.error('🔥 Firebase Error:', error);
        
        const errorMessages = {
            'permission-denied': 'ليس لديك صلاحية للوصول لهذه البيانات',
            'unauthenticated': 'يجب تسجيل الدخول أولاً',
            'not-found': 'البيانات المطلوبة غير موجودة',
            'already-exists': 'هذه البيانات موجودة بالفعل',
            'invalid-argument': 'البيانات المدخلة غير صحيحة',
            'failed-precondition': 'لا يمكن تنفيذ العملية الآن',
            'resource-exhausted': 'تم تجاوز حد الاستخدام',
            'cancelled': 'تم إلغاء العملية',
            'data-loss': 'حدث فقدان في البيانات',
            'unknown': 'حدث خطأ غير معروف'
        };
        
        const message = errorMessages[error.code] || errorMessages.unknown;
        
        Logger.warn('📱 User-friendly message:', message);
        
        return {
            code: error.code,
            message: message,
            originalError: error
        };
    };
    
    
    
    const FOUCPrevention = {
        init: function() {
            this.addReadyClass();
            this.monitorStylesheets();
            this.setupFallback();
        },
        
        addReadyClass: function() {
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    document.documentElement.classList.add('dom-ready');
                    Logger.log('✅ DOM Ready');
                });
            } else {
                document.documentElement.classList.add('dom-ready');
            }
            
            
            window.addEventListener('load', () => {
                setTimeout(() => {
                    document.documentElement.classList.add('page-loaded');
                    Logger.log('✅ Page Loaded');
                }, 100);
            });
        },
        
        monitorStylesheets: function() {
            const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
            let loadedCount = 0;
            
            stylesheets.forEach(link => {
                link.addEventListener('load', () => {
                    loadedCount++;
                    Logger.log(`✅ CSS loaded (${loadedCount}/${stylesheets.length}):`, 
                              link.href.split('/').pop());
                    
                    if (loadedCount === stylesheets.length) {
                        document.documentElement.classList.add('styles-loaded');
                        Logger.log('✅ All stylesheets loaded');
                    }
                });
                
                link.addEventListener('error', () => {
                    Logger.error('❌ CSS failed to load:', link.href);
                });
            });
        },
        
        setupFallback: function() {
            
            setTimeout(() => {
                if (!document.documentElement.classList.contains('page-loaded')) {
                    document.documentElement.classList.add('page-loaded', 'forced-display');
                    Logger.warn('⚠️ Forced content display after timeout');
                }
            }, 5000);
        }
    };
    
    
    
    function init() {
        Logger.log('🚀 Performance Optimizer initialized');
        Logger.log('🌐 Environment:', CONFIG.isDevelopment ? 'Development' : 'Production');
        
        
        PerformanceMonitor.init();
        ErrorHandler.init();
        FOUCPrevention.init();
        
        
        window.performanceOptimizer = {
            config: CONFIG,
            metrics: PerformanceMonitor.metrics,
            errors: ErrorHandler.errors,
            logger: Logger
        };
        
        Logger.log('✅ Performance Optimizer ready');
    }
    
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();








