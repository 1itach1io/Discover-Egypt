(function() {
    'use strict';
    const AI_ENGINES = {
        GEMINI: {
            id: 'gemini',
            name: 'Gemini 2.5 Flash',
            nameAr: 'جيميني 2.5',
            emoji: '🔮',
            icon: '✨',
            apiKey: 'AIzaSyByWFwJs823lYn7HHJR8npuxdnwqZKlfWg',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
            color: '#c1a025',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            strengths: ['الفهم العميق للسياق', 'السرعة الفائقة', 'دقة المعلومات'],
            weaknesses: ['قد يكون مختصراً أحياناً'],
            bestFor: ['الأسئلة السريعة', 'المعلومات السياحية', 'التوصيات الفورية'],
            avgResponseTime: 2.5,
            costPerRequest: 0.00015,
            qualityScore: 95,
            maxTokens: 8192,
            supportsArabic: true,
            enabled: true,
            priority: 1
        },
        GROQ: {
            id: 'groq',
            name: 'Groq Llama 3.3',
            nameAr: 'جروك لاما',
            emoji: '⚡',
            icon: '🚀',
            apiKey: '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',
            endpoint: 'https://api.groq.com/openai/v1/chat/completions',
            model: 'llama-3.3-70b-versatile',
            color: '#f97316',
            gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            strengths: ['سرعة استجابة خيالية', 'إجابات مفصلة', 'استدلال منطقي قوي'],
            weaknesses: ['قد يطيل أحياناً'],
            bestFor: ['الشرح التفصيلي', 'التخطيط للرحلات', 'الأسئلة المعقدة'],
            avgResponseTime: 1.8,
            costPerRequest: 0.00010,
            qualityScore: 92,
            maxTokens: 8000,
            supportsArabic: true,
            enabled: true,
            priority: 2
        },
        COHERE: {
            id: 'cohere',
            name: 'Cohere Command-A',
            nameAr: 'كوهير كوماند',
            emoji: '🎯',
            icon: '💎',
            apiKey: '6AHQVU015rkNgRnVUlJlrNZDv5lYHrCgaNxjM8Wb',
            endpoint: 'https://api.cohere.com/v2/chat',
            model: 'command-a-03-2025',
            color: '#d946ef',
            gradient: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
            strengths: ['تحليل عميق', 'إبداع في الاقتراحات', 'دقة لغوية عالية'],
            weaknesses: ['وقت استجابة أطول قليلاً'],
            bestFor: ['اقتراحات إبداعية', 'تحليل الخيارات', 'المقارنات التفصيلية'],
            avgResponseTime: 3.2,
            costPerRequest: 0.00020,
            qualityScore: 94,
            maxTokens: 4096,
            supportsArabic: true,
            enabled: true,
            priority: 3
        },
        MISTRAL: {
            id: 'mistral',
            name: 'Mistral Large 3',
            nameAr: 'ميسترال لارج',
            emoji: '🌟',
            icon: '⭐',
            apiKey: 'QBWNyeqnbL8TCcw2QSB9HN2rLGI6zUOW',
            endpoint: 'https://api.mistral.ai/v1/chat/completions',
            model: 'mistral-large-latest',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            strengths: ['توازن مثالي', 'شمولية المعلومات', 'موثوقية عالية'],
            weaknesses: ['أقل سرعة من Groq'],
            bestFor: ['المعلومات الشاملة', 'البحث التاريخي', 'الإجابات المتوازنة'],
            avgResponseTime: 2.8,
            costPerRequest: 0.00018,
            qualityScore: 93,
            maxTokens: 8192,
            supportsArabic: true,
            enabled: true,
            priority: 4
        }
    };
    const CONFIG = {
        ROTATION: {
            mode: 'adaptive', 
            adaptiveEnabled: true,
            fallbackEnabled: true,
            maxRetries: 4,
            retryDelay: 1000,
            skipFailedTemporarily: true,
            resetFailedAfter: 300000 
        },
        COMPARISON: {
            enabled: true,
            autoCompare: false,
            compareAfterRequests: 5,
            showRealtimeMetrics: true,
            detailedAnalysis: true,
            visualCharts: true
        },
        INTEGRATION: {
            weather: true,
            savedPlans: true,
            chatHistory: true,
            userProfile: true,
            egyptianPlaces: true
        },
        COST_OPTIMIZATION: {
            enabled: true,
            strategy: 'balanced', 
            dailyBudget: 2.0,
            alertThreshold: 0.8,
            preferLowerCost: false
        },
        CONVERSATION: {
            maxHistory: 50, 
            contextWindow: 20, 
            saveToStorage: true,
            compressionEnabled: false, 
            smartSummarization: false 
        },
        TIMEOUT: 30000,
        DEBUG: window.location.search.includes('debug=true'),
        LANGUAGE: 'ar'
    };
    const state = {
        conversationHistory: [],
        currentSession: null,
        currentEngineIndex: 0,
        lastUsedEngine: null,
        failedEngines: new Map(),
        engineStats: {},
        sessionStats: {
            startTime: Date.now(),
            requestCount: 0,
            successCount: 0,
            failureCount: 0,
            totalCost: 0,
            totalResponseTime: 0
        },
        comparisonData: [],
        engineComparisons: [],
        currentWeather: null,
        userPlans: [],
        egyptData: null,
        userProfile: null,
        isProcessing: false,
        initialized: false
    };
    function buildSystemPrompt() {
        const userName = state.userProfile?.displayName || state.userProfile?.email?.split('@')[0] || 'المسافر';
        const currentLocation = state.userProfile?.city || 'القاهرة';
        const userEmail = state.userProfile?.email || '';
        const today = new Date();
        const dateStr = today.toLocaleDateString('ar-EG', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        let prompt = `أنت "مرشد مصر الذكي" 🏛️ - مساعد سياحي ذكي متخصص في السياحة المصرية
🤖 من أنا:
أنا مرشد سياحي ذكي مُصمم خصيصاً لمساعدة السياح في اكتشاف مصر. أعمل ضمن موقع "Discover Egypt" وأستطيع:
• تذكر جميع محادثاتنا السابقة وأخذها بعين الاعتبار
• الوصول إلى خططك السياحية المحفوظة ومساعدتك في تطويرها
• معرفة حالة الطقس الحالية وتقديم النصائح المناسبة
• فهم تفضيلاتك واهتماماتك لتقديم اقتراحات مخصصة
• تذكر أسئلتك السابقة وبناء إجاباتي عليها
📋 معلوماتك الشخصية:
• الاسم: ${userName}
${userEmail ? `• البريد: ${userEmail}` : ''}
• الموقع الحالي: ${currentLocation}
• اللغة المفضلة: العربية
• التاريخ: ${dateStr}
`;
        if (state.currentWeather) {
            const weatherAdvice = getWeatherAdvice(state.currentWeather);
            prompt += `
🌡️ حالة الطقس الحالية في ${state.currentWeather.city}:
• درجة الحرارة: ${state.currentWeather.temp}°م (${state.currentWeather.description})
• الرطوبة: ${state.currentWeather.humidity}%
• سرعة الرياح: ${state.currentWeather.windSpeed} كم/س
💡 نصيحة الطقس: ${weatherAdvice}
`;
        }
        if (state.userPlans && state.userPlans.length > 0) {
            prompt += `
📅 خططك السياحية المحفوظة (${state.userPlans.length} خطة):
`;
            state.userPlans.slice(0, 5).forEach((plan, i) => {
                const destinations = plan.destinations || [];
                const destList = destinations.length > 0 
                    ? destinations.slice(0, 3).map(d => d.name || d).join('، ')
                    : 'غير محدد';
                prompt += `${i + 1}. "${plan.title || 'خطة بدون عنوان'}"
   • المدة: ${plan.duration || 'غير محدد'}
   • الوجهات (${destinations.length}): ${destList}${destinations.length > 3 ? '...' : ''}
   • الميزانية: ${plan.budget || 'غير محددة'}
`;
            });
            if (state.userPlans.length > 5) {
                prompt += `   ... وهناك ${state.userPlans.length - 5} خطط أخرى\n`;
            }
        } else {
            prompt += `
📅 لا توجد خطط سياحية محفوظة حتى الآن.
💡 يمكنني مساعدتك في إنشاء خطة سياحية مخصصة!
`;
        }
        if (state.conversationHistory.length > 2) {
            const recentTopics = extractConversationTopics(state.conversationHistory);
            if (recentTopics.length > 0) {
                prompt += `
💬 مواضيع محادثاتنا السابقة:
${recentTopics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}
📌 تذكر: استخدم هذه المعلومات لتقديم إجابات أكثر تخصيصاً وترابطاً.
`;
            }
        }
        prompt += `
🎯 مهامي الأساسية كمرشد ذكي:
1️⃣ **الذاكرة والسياق**:
   • أتذكر جميع محادثاتنا السابقة وأربط بينها
   • إذا سألتني عن شيء ذكرناه من قبل، سأشير إليه
   • أبني على إجاباتي السابقة ولا أكررها حرفياً
   • أتذكر تفضيلاتك واهتماماتك
2️⃣ **معرفة الخطط المحفوظة**:
   • أعرف جميع خططك السياحية المحفوظة
   • أستطيع مساعدتك في تطوير خططك الحالية
   • أقترح إضافات أو تعديلات بناءً على خبرتي
   • أربط بين خططك والطقس الحالي
3️⃣ **الوعي بالطقس**:
   • أراعي حالة الطقس الحالية في نصائحي
   • أقترح الأنشطة المناسبة للطقس الحالي
   • أحذر من الأوقات غير المناسبة للزيارة
4️⃣ **التخصيص والذكاء**:
   • أقدم اقتراحات مخصصة بناءً على:
     - محادثاتنا السابقة
     - خططك المحفوظة
     - موقعك الحالي
     - الطقس الحالي
     - تفضيلاتك الظاهرة
📍 معلومات شاملة عن مصر (أعرفها جيداً):
🗺️ **المحافظات (27 محافظة)**:
• القاهرة، الجيزة، الإسكندرية، الأقصر، أسوان
• البحر الأحمر، جنوب سيناء، شمال سيناء، مرسى مطروح
• الدقهلية، الشرقية، القليوبية، المنوفية، الغربية
• وجميع المحافظات الأخرى بتفاصيلها
🏛️ **المعالم السياحية الرئيسية**:
• الأهرامات الثلاثة وأبو الهول (الجيزة)
• معابد الكرنك والأقصر (الأقصر)
• معبد أبو سمبل (أسوان)
• المتحف المصري الكبير (الجيزة)
• دير سانت كاترين (سيناء)
• واحات الصحراء الغربية
• شواطئ البحر الأحمر والمنتجعات
🏨 **أنواع الإقامة**:
• فنادق 5 نجوم فاخرة
• فنادق متوسطة (3-4 نجوم)
• بيوت ضيافة وشقق مفروشة
• منتجعات شاملة كل شيء
• أماكن إقامة اقتصادية
🍽️ **المطبخ المصري**:
• الكشري، الفول، الطعمية
• الكبدة الإسكندراني، السمك
• الفتة، المحشي، الملوخية
• الحلويات: الكنافة، البسبوسة، القطايف
🚗 **وسائل النقل**:
• مترو الأنفاق (القاهرة والإسكندرية)
• أوبر وكريم (متوفر في كل مكان)
• القطارات بين المدن
• الحافلات السياحية
• تأجير السيارات
💰 **الميزانية التقديرية** (للفرد يومياً):
• اقتصادية: 500-1000 جنيه (15-30 دولار)
• متوسطة: 1000-2500 جنيه (30-75 دولار)
• فاخرة: 2500+ جنيه (75+ دولار)
📅 **أفضل أوقات الزيارة**:
• الشتاء (أكتوبر - أبريل): معتدل ومثالي
• الصيف (مايو - سبتمبر): حار جداً خاصة في الصعيد
• الأعياد والمواسم: أسعار أعلى وازدحام أكثر
✨ **أسلوب ردودي**:
✅ **افعل**:
• استخدم اللغة العربية الفصحى البسيطة والواضحة
• كن ودوداً ومتحمساً ومشجعاً
• اشر للمحادثات أو الخطط السابقة عند الصلة
• قدم معلومات دقيقة ومحدثة ومفصلة
• اقترح خيارات متنوعة (3-5 خيارات)
• راعِ ميزانية المستخدم واهتماماته
• استخدم الإيموجي بذكاء وبدون مبالغة
• قدم نصائح عملية وواقعية
• اذكر الأسعار التقريبية عند الحاجة
• قدم بدائل اقتصادية دائماً
❌ **تجنب**:
• المعلومات المضللة أو القديمة أو غير الدقيقة
• الإطالة الزائدة (كن موجزاً ومفيداً)
• التكرار الحرفي (أعد صياغة الأفكار المتشابهة)
• التعقيد اللغوي أو المصطلحات الصعبة
• نسيان السياق أو المحادثات السابقة
• تجاهل الخطط المحفوظة عند السؤال عنها
• التعامل مع كل سؤال كأنه الأول
🎭 **شخصيتي**:
• مرشد سياحي محترف وودود
• خبير بكل تفاصيل السياحة المصرية
• متحمس لمساعدة السياح
• صبور ومستعد للإجابة على أي سؤال
• أتذكر كل شيء نتحدث عنه
• أبني علاقة مستمرة مع كل مستخدم
🌟 **هدفي النهائي**:
مساعدتك في قضاء أفضل رحلة ممكنة في مصر، مع مراعاة:
• ميزانيتك
• وقتك المتاح
• اهتماماتك الخاصة
• راحتك وأمانك
• خططك المستقبلية
الآن، أنا جاهز تماماً لمساعدتك! 🇪🇬✨`;
        return prompt;
    }
    function getWeatherAdvice(weather) {
        const temp = weather.temp;
        const desc = weather.description?.toLowerCase() || '';
        if (temp > 35) {
            return 'حار جداً! يُنصح بالأنشطة الداخلية أو السباحة، وتجنب التجول وقت الظهيرة';
        } else if (temp > 30) {
            return 'حار! ارتدِ ملابس خفيفة واحمِ نفسك من الشمس';
        } else if (temp > 25) {
            return 'معتدل ومثالي للسياحة! استمتع بجميع الأنشطة';
        } else if (temp > 20) {
            return 'لطيف! ممتاز للتجول والاستكشاف';
        } else if (temp > 15) {
            return 'بارد نسبياً، أحضر سترة خفيفة';
        } else {
            return 'بارد! ارتدِ ملابس دافئة خاصة في المساء';
        }
        if (desc.includes('rain') || desc.includes('مطر')) {
            return 'ممطر! خطط لأنشطة داخلية أو أحضر مظلة';
        }
        return 'طقس جيد للسياحة!';
    }
    function extractConversationTopics(history) {
        const topics = [];
        const userMessages = history.filter(m => m.role === 'user').slice(-5);
        userMessages.forEach(msg => {
            const content = msg.content?.substring(0, 60) || '';
            if (content) {
                topics.push(content + (content.length >= 60 ? '...' : ''));
            }
        });
        return topics;
    }
    function getNextEngine() {
        const now = Date.now();
        for (const [engineKey, failTime] of state.failedEngines.entries()) {
            if (now - failTime > CONFIG.ROTATION.resetFailedAfter) {
                state.failedEngines.delete(engineKey);
                ;
            }
        }
        const availableEngines = Object.entries(AI_ENGINES)
            .filter(([key, engine]) => 
                engine.enabled && 
                !state.failedEngines.has(key) &&
                engine.apiKey
            );
        if (availableEngines.length === 0) {
            console.error('❌ لا توجد محركات متاحة!');
            state.failedEngines.clear();
            return null;
        }
        let selectedEngine;
        switch (CONFIG.ROTATION.mode) {
            case 'sequential':
                selectedEngine = selectSequential(availableEngines);
                break;
            case 'performance':
                selectedEngine = selectByPerformance(availableEngines);
                break;
            case 'cost':
                selectedEngine = selectByCost(availableEngines);
                break;
            case 'adaptive':
            default:
                selectedEngine = selectAdaptive(availableEngines);
                break;
        }
        return selectedEngine;
    }
    function selectSequential(engines) {
        const engine = engines[state.currentEngineIndex % engines.length];
        state.currentEngineIndex++;
        return engine;
    }
    function selectByPerformance(engines) {
        return engines.reduce((best, current) => {
            const bestScore = calculatePerformanceScore(best[0]);
            const currentScore = calculatePerformanceScore(current[0]);
            return currentScore > bestScore ? current : best;
        });
    }
    function selectByCost(engines) {
        return engines.reduce((best, current) => {
            const bestEngine = AI_ENGINES[best[0]];
            const currentEngine = AI_ENGINES[current[0]];
            return currentEngine.costPerRequest < bestEngine.costPerRequest ? current : best;
        });
    }
    function selectAdaptive(engines) {
        const now = Date.now();
        const strategy = CONFIG.COST_OPTIMIZATION.strategy;
        return engines.reduce((best, current) => {
            const [bestKey, bestEngine] = best;
            const [currentKey, currentEngine] = current;
            const bestStats = state.engineStats[bestKey];
            const currentStats = state.engineStats[currentKey];
            let bestScore = 0;
            let currentScore = 0;
            const bestSuccessRate = bestStats?.requestCount > 0 
                ? bestStats.successCount / bestStats.requestCount 
                : 1;
            const currentSuccessRate = currentStats?.requestCount > 0 
                ? currentStats.successCount / currentStats.requestCount 
                : 1;
            bestScore += bestSuccessRate * 35;
            currentScore += currentSuccessRate * 35;
            const bestSpeed = bestStats?.avgResponseTime || bestEngine.avgResponseTime;
            const currentSpeed = currentStats?.avgResponseTime || currentEngine.avgResponseTime;
            bestScore += (10000 / bestSpeed) * 0.25;
            currentScore += (10000 / currentSpeed) * 0.25;
            bestScore += (bestEngine.qualityScore / 100) * 25;
            currentScore += (currentEngine.qualityScore / 100) * 25;
            if (strategy === 'aggressive' || CONFIG.COST_OPTIMIZATION.preferLowerCost) {
                bestScore += (1 / bestEngine.costPerRequest) * 0.01;
                currentScore += (1 / currentEngine.costPerRequest) * 0.01;
            } else {
                bestScore += 10;
                currentScore += 10;
            }
            const bestLastUsed = bestStats?.lastUsed || 0;
            const currentLastUsed = currentStats?.lastUsed || 0;
            const bestTimeSince = (now - bestLastUsed) / 60000;
            const currentTimeSince = (now - currentLastUsed) / 60000;
            bestScore += Math.min(bestTimeSince / 2, 5);
            currentScore += Math.min(currentTimeSince / 2, 5);
            return currentScore > bestScore ? current : best;
        });
    }
    function calculatePerformanceScore(engineKey) {
        const engine = AI_ENGINES[engineKey];
        const stats = state.engineStats[engineKey];
        if (!stats || stats.requestCount === 0) {
            return engine.qualityScore;
        }
        const successRate = stats.successCount / stats.requestCount;
        const speedScore = 10000 / (stats.avgResponseTime || engine.avgResponseTime);
        const qualityScore = engine.qualityScore / 100;
        return (successRate * 40) + (speedScore * 0.3) + (qualityScore * 30);
    }
    async function callEngine(engineKey, messages) {
        const engine = AI_ENGINES[engineKey];
        const startTime = Date.now();
        try {
            let response;
            switch (engineKey) {
                case 'GEMINI':
                    response = await callGemini(messages, engine);
                    break;
                case 'GROQ':
                    response = await callGroq(messages, engine);
                    break;
                case 'COHERE':
                    response = await callCohere(messages, engine);
                    break;
                case 'MISTRAL':
                    response = await callMistral(messages, engine);
                    break;
                default:
                    throw new Error('محرك غير معروف');
            }
            const responseTime = Date.now() - startTime;
            return {
                success: true,
                response: response,
                responseTime: responseTime,
                cost: engine.costPerRequest
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                success: false,
                error: error.message,
                responseTime: responseTime,
                cost: 0
            };
        }
    }
    async function callGemini(messages, engine) {
        const systemPrompt = buildSystemPrompt();
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            ...messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }))
        ];
        const url = `${engine.endpoint}?key=${engine.apiKey}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: engine.maxTokens,
                        topP: 0.95,
                        topK: 40
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_NONE"
                        }
                    ]
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Gemini API Error: ${error.error?.message || response.status}`);
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
    async function callGroq(messages, engine) {
        const systemPrompt = buildSystemPrompt();
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        try {
            const response = await fetch(engine.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${engine.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: engine.model,
                    messages: formattedMessages,
                    temperature: 0.8,
                    max_tokens: engine.maxTokens,
                    top_p: 0.95
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Groq API Error: ${error.error?.message || response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
    async function callCohere(messages, engine) {
        const systemPrompt = buildSystemPrompt();
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        try {
            const response = await fetch(engine.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${engine.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: engine.model,
                    messages: formattedMessages
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Cohere API Error: ${error.message || response.status}`);
            }
            const data = await response.json();
            return data.message.content[0].text;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
    async function callMistral(messages, engine) {
        const systemPrompt = buildSystemPrompt();
        const formattedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        try {
            const response = await fetch(engine.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${engine.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: engine.model,
                    messages: formattedMessages,
                    temperature: 0.8,
                    max_tokens: engine.maxTokens
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Mistral API Error: ${error.message || response.status}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    }
    async function processWithQuadRotation(userMessage) {
        if (state.isProcessing) {
            throw new Error('جاري معالجة طلب آخر...');
        }
        state.isProcessing = true;
        const sessionStart = Date.now();
        try {
            const userMsg = {
                role: 'user',
                content: userMessage,
                timestamp: sessionStart
            };
            state.conversationHistory.push(userMsg);
            const contextMessages = getContextMessages();
            let response = null;
            let usedEngine = null;
            let attempts = 0;
            const attemptDetails = [];
            while (!response && attempts < CONFIG.ROTATION.maxRetries) {
                attempts++;
                const selectedEngine = getNextEngine();
                if (!selectedEngine) {
                    throw new Error('لا توجد محركات متاحة حالياً');
                }
                const [engineKey, engineConfig] = selectedEngine;
                ;
                const result = await callEngine(engineKey, contextMessages);
                attemptDetails.push({
                    engine: engineKey,
                    engineName: engineConfig.nameAr,
                    success: result.success,
                    responseTime: result.responseTime,
                    error: result.error
                });
                if (result.success) {
                    response = result.response;
                    usedEngine = { key: engineKey, config: engineConfig };
                    updateEngineStats(engineKey, true, result.responseTime, result.cost);
                    ;
                } else {
                    updateEngineStats(engineKey, false, result.responseTime, 0);
                    if (CONFIG.ROTATION.skipFailedTemporarily) {
                        state.failedEngines.set(engineKey, Date.now());
                    }
                    console.warn(`❌ فشل ${engineConfig.nameAr}: ${result.error}`);
                    if (attempts < CONFIG.ROTATION.maxRetries) {
                        await new Promise(resolve => 
                            setTimeout(resolve, CONFIG.ROTATION.retryDelay)
                        );
                    }
                }
            }
            if (!response) {
                throw new Error('فشلت جميع المحركات في الاستجابة');
            }
            const assistantMsg = {
                role: 'assistant',
                content: response,
                engine: usedEngine.key,
                engineName: usedEngine.config.nameAr,
                timestamp: Date.now()
            };
            state.conversationHistory.push(assistantMsg);
            saveConversationToStorage();
            const totalTime = Date.now() - sessionStart;
            state.sessionStats.requestCount++;
            state.sessionStats.successCount++;
            state.sessionStats.totalResponseTime += totalTime;
            if (CONFIG.COMPARISON.enabled) {
                saveComparisonData(usedEngine, totalTime, attempts, attemptDetails);
            }
            checkBudgetAlert();
            state.lastUsedEngine = usedEngine.key;
            return {
                success: true,
                response: response,
                engine: usedEngine,
                totalTime: totalTime,
                attempts: attempts,
                attemptDetails: attemptDetails
            };
        } catch (error) {
            state.sessionStats.requestCount++;
            state.sessionStats.failureCount++;
            console.error('❌ خطأ في معالجة الرسالة:', error);
            throw error;
        } finally {
            state.isProcessing = false;
        }
    }
    function getContextMessages() {
        const maxContext = CONFIG.CONVERSATION.contextWindow;
        const history = state.conversationHistory;
        if (history.length <= maxContext) {
            return history.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        }
        const firstMessages = history.slice(0, 2); 
        const recentMessages = history.slice(-(maxContext - 2)); 
        if (history.length > maxContext + 2) {
            const skippedCount = history.length - maxContext;
            const summaryMessage = {
                role: 'user',
                content: `[تم تخطي ${skippedCount} رسالة من المحادثة للاختصار]`
            };
            return [
                ...firstMessages.map(msg => ({ role: msg.role, content: msg.content })),
                summaryMessage,
                ...recentMessages.map(msg => ({ role: msg.role, content: msg.content }))
            ];
        }
        return history.slice(-maxContext).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
    }
    function updateEngineStats(engineKey, success, responseTime, cost) {
        if (!state.engineStats[engineKey]) {
            state.engineStats[engineKey] = {
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                totalResponseTime: 0,
                avgResponseTime: 0,
                totalCost: 0,
                lastUsed: null,
                errorHistory: [],
                responseTimeHistory: []
            };
        }
        const stats = state.engineStats[engineKey];
        stats.requestCount++;
        stats.lastUsed = Date.now();
        if (success) {
            stats.successCount++;
            stats.totalResponseTime += responseTime;
            stats.avgResponseTime = stats.totalResponseTime / stats.successCount;
            stats.totalCost += cost;
            stats.responseTimeHistory.push(responseTime);
            if (stats.responseTimeHistory.length > 50) {
                stats.responseTimeHistory.shift();
            }
            state.sessionStats.totalCost += cost;
        } else {
            stats.failureCount++;
            stats.errorHistory.push({
                timestamp: Date.now(),
                message: 'Request failed'
            });
            if (stats.errorHistory.length > 20) {
                stats.errorHistory.shift();
            }
        }
        saveStatsToStorage();
    }
    function saveComparisonData(engine, totalTime, attempts, attemptDetails) {
        const comparison = {
            timestamp: Date.now(),
            engineKey: engine.key,
            engineName: engine.config.nameAr,
            totalTime: totalTime,
            attempts: attempts,
            attemptDetails: attemptDetails,
            cost: engine.config.costPerRequest
        };
        state.comparisonData.push(comparison);
        if (state.comparisonData.length > 100) {
            state.comparisonData.shift();
        }
        try {
            localStorage.setItem('ai_comparison_data', JSON.stringify(state.comparisonData));
        } catch (error) {
            console.warn('فشل حفظ بيانات المقارنة');
        }
    }
    function getDetailedComparison() {
        const comparison = {};
        Object.entries(AI_ENGINES).forEach(([key, engine]) => {
            const stats = state.engineStats[key] || {
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                avgResponseTime: 0,
                totalCost: 0
            };
            const successRate = stats.requestCount > 0
                ? (stats.successCount / stats.requestCount) * 100
                : 0;
            const avgTime = stats.avgResponseTime || engine.avgResponseTime;
            const score = calculatePerformanceScore(key);
            comparison[key] = {
                id: engine.id,
                name: engine.name,
                nameAr: engine.nameAr,
                emoji: engine.emoji,
                icon: engine.icon,
                color: engine.color,
                gradient: engine.gradient,
                enabled: engine.enabled,
                strengths: engine.strengths,
                weaknesses: engine.weaknesses,
                bestFor: engine.bestFor,
                stats: {
                    requests: stats.requestCount,
                    success: stats.successCount,
                    failures: stats.failureCount,
                    successRate: successRate.toFixed(1) + '%',
                    avgResponseTime: avgTime.toFixed(0) + 'ms',
                    totalCost: '$' + stats.totalCost.toFixed(4),
                    costPerRequest: '$' + engine.costPerRequest.toFixed(5),
                    lastUsed: stats.lastUsed 
                        ? new Date(stats.lastUsed).toLocaleString('ar-EG')
                        : 'لم يستخدم بعد'
                },
                performance: {
                    score: score.toFixed(1),
                    rating: getPerformanceRating(score),
                    qualityScore: engine.qualityScore,
                    speedRating: getSpeedRating(avgTime),
                    costRating: getCostRating(engine.costPerRequest)
                },
                history: {
                    responseTimes: stats.responseTimeHistory || [],
                    errors: stats.errorHistory || []
                }
            };
        });
        return comparison;
    }
    function getPerformanceRating(score) {
        if (score >= 90) return 'ممتاز';
        if (score >= 80) return 'جيد جداً';
        if (score >= 70) return 'جيد';
        if (score >= 60) return 'مقبول';
        return 'ضعيف';
    }
    function getSpeedRating(avgTime) {
        if (avgTime < 2000) return 'سريع جداً ⚡';
        if (avgTime < 3000) return 'سريع 🚀';
        if (avgTime < 4000) return 'متوسط ⏱️';
        return 'بطيء 🐢';
    }
    function getCostRating(cost) {
        if (cost < 0.00015) return 'اقتصادي جداً 💚';
        if (cost < 0.00020) return 'اقتصادي 💛';
        if (cost < 0.00025) return 'متوسط 🟡';
        return 'مكلف 🔴';
    }
    function checkBudgetAlert() {
        const { totalCost } = state.sessionStats;
        const { dailyBudget, alertThreshold } = CONFIG.COST_OPTIMIZATION;
        if (totalCost >= dailyBudget * alertThreshold) {
            console.warn(`⚠️ تحذير: وصلت إلى ${(totalCost/dailyBudget*100).toFixed(0)}% من الميزانية اليومية`);
            if (totalCost >= dailyBudget) {
                console.error('🚫 تجاوزت الميزانية اليومية!');
            }
        }
    }
    async function loadWeatherData() {
        if (!CONFIG.INTEGRATION.weather) return;
        try {
            const city = state.userProfile?.city || 'القاهرة';
            if (window.weatherAPI && typeof window.weatherAPI.getCurrentWeather === 'function') {
                const weather = await window.weatherAPI.getCurrentWeather(city);
                state.currentWeather = {
                    city: city,
                    temp: weather.temp,
                    description: weather.description,
                    humidity: weather.humidity,
                    windSpeed: weather.windSpeed
                };
                ;
            }
        } catch (error) {
            console.warn('تعذر تحميل بيانات الطقس:', error);
        }
    }
    async function loadUserPlans() {
        if (!CONFIG.INTEGRATION.savedPlans) return;
        try {
            const plansFromStorage = localStorage.getItem('saved_travel_plans');
            if (plansFromStorage) {
                const plans = JSON.parse(plansFromStorage);
                if (Array.isArray(plans) && plans.length > 0) {
                    state.userPlans = plans;
                    ;
                    return;
                }
            }
            if (window.savedPlans && Array.isArray(window.savedPlans)) {
                state.userPlans = window.savedPlans;
                ;
                return;
            }
            if (window.SavedPlansManager && typeof window.SavedPlansManager.getPlans === 'function') {
                const plans = window.SavedPlansManager.getPlans();
                if (Array.isArray(plans) && plans.length > 0) {
                    state.userPlans = plans;
                    ;
                    return;
                }
            }
            ;
            state.userPlans = [];
        } catch (error) {
            console.warn('تعذر تحميل الخطط المحفوظة:', error);
            state.userPlans = [];
        }
    }
    async function loadUserProfile() {
        if (!CONFIG.INTEGRATION.userProfile) return;
        try {
            if (window.firebase && firebase.auth && firebase.auth().currentUser) {
                const user = firebase.auth().currentUser;
                state.userProfile = {
                    displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
                    email: user.email,
                    photoURL: user.photoURL,
                    uid: user.uid,
                    city: 'القاهرة' 
                };
                ;
                return;
            }
            const profileFromStorage = localStorage.getItem('user_profile');
            if (profileFromStorage) {
                state.userProfile = JSON.parse(profileFromStorage);
                ;
                return;
            }
            if (window.currentUser) {
                state.userProfile = window.currentUser;
                ;
                return;
            }
            state.userProfile = {
                displayName: 'الزائر',
                city: 'القاهرة'
            };
            ;
        } catch (error) {
            console.warn('تعذر تحميل بيانات المستخدم:', error);
            state.userProfile = { displayName: 'الزائر', city: 'القاهرة' };
        }
    }
    function saveConversationToStorage() {
        if (!CONFIG.CONVERSATION.saveToStorage) return;
        try {
            const maxHistory = CONFIG.CONVERSATION.maxHistory;
            const historyToSave = state.conversationHistory.slice(-maxHistory);
            localStorage.setItem('ai_conversation_history', JSON.stringify(historyToSave));
        } catch (error) {
            console.warn('فشل حفظ المحادثة:', error);
        }
    }
    function loadConversationFromStorage() {
        try {
            const saved = localStorage.getItem('ai_conversation_history');
            if (saved) {
                state.conversationHistory = JSON.parse(saved);
                ;
            }
        } catch (error) {
            console.warn('فشل تحميل المحادثة:', error);
        }
    }
    function saveStatsToStorage() {
        try {
            localStorage.setItem('ai_engine_stats', JSON.stringify(state.engineStats));
            localStorage.setItem('ai_session_stats', JSON.stringify(state.sessionStats));
        } catch (error) {
            console.warn('فشل حفظ الإحصائيات:', error);
        }
    }
    function loadStatsFromStorage() {
        try {
            const engineStats = localStorage.getItem('ai_engine_stats');
            if (engineStats) {
                state.engineStats = JSON.parse(engineStats);
            }
            const sessionStats = localStorage.getItem('ai_session_stats');
            if (sessionStats) {
                const saved = JSON.parse(sessionStats);
                state.sessionStats = {
                    ...saved,
                    startTime: Date.now()
                };
            }
            const comparisonData = localStorage.getItem('ai_comparison_data');
            if (comparisonData) {
                state.comparisonData = JSON.parse(comparisonData);
            }
        } catch (error) {
            console.warn('فشل تحميل الإحصائيات:', error);
        }
    }
    function clearAllData() {
        state.conversationHistory = [];
        state.engineStats = {};
        state.comparisonData = [];
        state.failedEngines.clear();
        state.sessionStats = {
            startTime: Date.now(),
            requestCount: 0,
            successCount: 0,
            failureCount: 0,
            totalCost: 0,
            totalResponseTime: 0
        };
        initEngineStats();
        try {
            localStorage.removeItem('ai_conversation_history');
            localStorage.removeItem('ai_engine_stats');
            localStorage.removeItem('ai_session_stats');
            localStorage.removeItem('ai_comparison_data');
        } catch (error) {
            console.warn('فشل حذف البيانات:', error);
        }
        ;
    }
    window.QuadAIGuide = {
        async sendMessage(message) {
            return await processWithQuadRotation(message);
        },
        getComparison() {
            return getDetailedComparison();
        },
        getStats() {
            return {
                engines: getDetailedComparison(),
                session: {
                    ...state.sessionStats,
                    duration: Date.now() - state.sessionStats.startTime,
                    avgResponseTime: state.sessionStats.successCount > 0
                        ? state.sessionStats.totalResponseTime / state.sessionStats.successCount
                        : 0
                },
                conversation: {
                    length: state.conversationHistory.length,
                    userMessages: state.conversationHistory.filter(m => m.role === 'user').length,
                    aiMessages: state.conversationHistory.filter(m => m.role === 'assistant').length
                },
                userData: {
                    profile: state.userProfile,
                    plans: state.userPlans.length,
                    weather: state.currentWeather
                }
            };
        },
        exportData() {
            const data = {
                timestamp: new Date().toISOString(),
                engines: getDetailedComparison(),
                session: state.sessionStats,
                conversation: state.conversationHistory,
                comparison: state.comparisonData,
                userData: {
                    profile: state.userProfile,
                    plans: state.userPlans,
                    weather: state.currentWeather
                }
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `egypt-ai-guide-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        reset() {
            clearAllData();
        },
        clearConversation() {
            state.conversationHistory = [];
            saveConversationToStorage();
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                location.reload();
            }
        },
        updateConfig(newConfig) {
            Object.assign(CONFIG, newConfig);
            ;
        },
        updateAPIKeys(keys) {
            Object.entries(keys).forEach(([engine, key]) => {
                if (AI_ENGINES[engine]) {
                    AI_ENGINES[engine].apiKey = key;
                }
            });
            ;
        },
        getNextEngine() {
            const engine = getNextEngine();
            return engine ? {
                key: engine[0],
                ...engine[1]
            } : null;
        },
        getState() {
            return {
                isProcessing: state.isProcessing,
                lastUsedEngine: state.lastUsedEngine,
                conversationLength: state.conversationHistory.length,
                failedEngines: Array.from(state.failedEngines.keys()),
                userData: {
                    hasProfile: !!state.userProfile,
                    userName: state.userProfile?.displayName,
                    plansCount: state.userPlans.length,
                    hasWeather: !!state.currentWeather
                }
            };
        },
        async refreshUserData() {
            ;
            await Promise.all([
                loadWeatherData(),
                loadUserPlans(),
                loadUserProfile()
            ]);
            ;
            return {
                profile: state.userProfile,
                plans: state.userPlans.length,
                weather: !!state.currentWeather
            };
        },
        getUserData() {
            return {
                profile: state.userProfile,
                plans: state.userPlans,
                weather: state.currentWeather,
                conversationTopics: extractConversationTopics(state.conversationHistory)
            };
        },
        updateUserData(data) {
            if (data.profile) {
                state.userProfile = { ...state.userProfile, ...data.profile };
                ;
            }
            if (data.plans) {
                state.userPlans = data.plans;
                ;
            }
            if (data.weather) {
                state.currentWeather = data.weather;
                ;
            }
        }
    };
    function initEngineStats() {
        Object.keys(AI_ENGINES).forEach(key => {
            if (!state.engineStats[key]) {
                state.engineStats[key] = {
                    requestCount: 0,
                    successCount: 0,
                    failureCount: 0,
                    totalResponseTime: 0,
                    avgResponseTime: 0,
                    totalCost: 0,
                    lastUsed: null,
                    errorHistory: [],
                    responseTimeHistory: []
                };
            }
        });
    }
    function setupDataWatchers() {
        // Keep user-related state in sync with storage/auth changes.
        // This is a safe fallback if a richer implementation was removed.
        if (setupDataWatchers._initialized) return;
        setupDataWatchers._initialized = true;

        window.addEventListener('storage', (e) => {
            try {
                if (e.key === 'saved_travel_plans' && e.newValue) {
                    const plans = JSON.parse(e.newValue);
                    if (Array.isArray(plans)) state.userPlans = plans;
                }
                if (e.key === 'user_profile' && e.newValue) {
                    const profile = JSON.parse(e.newValue);
                    if (profile) state.userProfile = { ...state.userProfile, ...profile };
                }
            } catch (_) {
                // ignore
            }
        });
    }

    async function initialize() {
        ;
        initEngineStats();
        loadStatsFromStorage();
        if (CONFIG.CONVERSATION.saveToStorage) {
            loadConversationFromStorage();
        }
        await Promise.all([
            loadWeatherData(),
            loadUserPlans(),
            loadUserProfile()
        ]);
        setupDataWatchers();
        state.initialized = true;
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            if (key === 'saved_travel_plans') {
                try {
                    const plans = JSON.parse(value);
                    if (Array.isArray(plans)) {
                        state.userPlans = plans;
                        ;
                    }
                } catch (e) {}
            }
            if (key === 'user_profile') {
                try {
                    const profile = JSON.parse(value);
                    state.userProfile = profile;
                    ;
                } catch (e) {}
            }
        };
        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    state.userProfile = {
                        displayName: user.displayName || user.email?.split('@')[0] || 'المستخدم',
                        email: user.email,
                        photoURL: user.photoURL,
                        uid: user.uid,
                        city: state.userProfile?.city || 'القاهرة'
                    };
                    ;
                }
            });
        }
        const weatherUpdateInterval = setInterval(() => {
            loadWeatherData();
        }, 300000); 
        window.addEventListener('beforeunload', () => {
            clearInterval(weatherUpdateInterval);
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    window.AI_ENGINES = AI_ENGINES;
    window.AI_CONFIG = CONFIG;
    ;
})();
