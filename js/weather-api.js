/*
 * Weather module (Open-Meteo)
 * Fixes:
 * - Previous file had broken blocks and used `await` in non-async functions.
 * - Provides a clean, self-contained implementation with caching.
 */

(function () {
  'use strict';

  const CONFIG = {
    API_URL: 'https://api.open-meteo.com/v1/forecast',
    TIMEZONE: 'Africa/Cairo',
    CACHE_DURATION: 10 * 60 * 1000,
    DEBUG: window.location.search.includes('debug=true'),
  };

  const CITIES = {
    cairo: {
      name: 'القاهرة',
      nameEn: 'Cairo',
      nameFr: 'Le Caire',
      lat: 30.0444,
      lon: 31.2357,
      icon: '🏛️',
      region: 'greater-cairo',
    },
    giza: {
      name: 'الجيزة',
      nameEn: 'Giza',
      nameFr: 'Gizeh',
      lat: 30.0131,
      lon: 31.2089,
      icon: '🗿',
      region: 'greater-cairo',
    },
    qalyubia: {
      name: 'القليوبية',
      nameEn: 'Qalyubia',
      nameFr: 'Qalyubia',
      lat: 30.1792,
      lon: 31.2125,
      icon: '🏘️',
      region: 'greater-cairo',
    },
    alexandria: {
      name: 'الإسكندرية',
      nameEn: 'Alexandria',
      nameFr: 'Alexandrie',
      lat: 31.2001,
      lon: 29.9187,
      icon: '🏖️',
      region: 'delta',
    },
    beheira: {
      name: 'البحيرة',
      nameEn: 'Beheira',
      nameFr: 'Béhéra',
      lat: 30.8481,
      lon: 30.3436,
      icon: '🌾',
      region: 'delta',
    },
    'kafr-el-sheikh': {
      name: 'كفر الشيخ',
      nameEn: 'Kafr El Sheikh',
      nameFr: 'Kafr el-Cheikh',
      lat: 31.1107,
      lon: 30.9388,
      icon: '🌾',
      region: 'delta',
    },
    dakahlia: {
      name: 'الدقهلية',
      nameEn: 'Dakahlia',
      nameFr: 'Dakahlia',
      lat: 31.0409,
      lon: 31.3785,
      icon: '🌾',
      region: 'delta',
    },
    damietta: {
      name: 'دمياط',
      nameEn: 'Damietta',
      nameFr: 'Damiette',
      lat: 31.4175,
      lon: 31.8144,
      icon: '⚓',
      region: 'delta',
    },
    'port-said': {
      name: 'بورسعيد',
      nameEn: 'Port Said',
      nameFr: 'Port-Saïd',
      lat: 31.2653,
      lon: 32.3019,
      icon: '🚢',
      region: 'delta',
    },
    sharqia: {
      name: 'الشرقية',
      nameEn: 'Sharqia',
      nameFr: 'Sharqiya',
      lat: 30.5965,
      lon: 31.5041,
      icon: '🌾',
      region: 'delta',
    },
    gharbia: {
      name: 'الغربية',
      nameEn: 'Gharbia',
      nameFr: 'Gharbia',
      lat: 30.8754,
      lon: 31.0335,
      icon: '🌾',
      region: 'delta',
    },
    monufia: {
      name: 'المنوفية',
      nameEn: 'Monufia',
      nameFr: 'Ménoufia',
      lat: 30.5972,
      lon: 30.9876,
      icon: '🌾',
      region: 'delta',
    },
    ismailia: {
      name: 'الإسماعيلية',
      nameEn: 'Ismailia',
      nameFr: 'Ismaïlia',
      lat: 30.5833,
      lon: 32.2667,
      icon: '🌊',
      region: 'canal',
    },
    suez: {
      name: 'السويس',
      nameEn: 'Suez',
      nameFr: 'Suez',
      lat: 29.9668,
      lon: 32.5498,
      icon: '🚢',
      region: 'canal',
    },
    faiyum: {
      name: 'الفيوم',
      nameEn: 'Faiyum',
      nameFr: 'Fayoum',
      lat: 29.3084,
      lon: 30.8428,
      icon: '🏞️',
      region: 'upper-egypt',
    },
    'beni-suef': {
      name: 'بني سويف',
      nameEn: 'Beni Suef',
      nameFr: 'Beni Souef',
      lat: 29.0661,
      lon: 31.0994,
      icon: '🌾',
      region: 'upper-egypt',
    },
    minya: {
      name: 'المنيا',
      nameEn: 'Minya',
      nameFr: 'Minya',
      lat: 28.0871,
      lon: 30.7618,
      icon: '🏛️',
      region: 'upper-egypt',
    },
    asyut: {
      name: 'أسيوط',
      nameEn: 'Asyut',
      nameFr: 'Assiout',
      lat: 27.1809,
      lon: 31.1837,
      icon: '🏛️',
      region: 'upper-egypt',
    },
    sohag: {
      name: 'سوهاج',
      nameEn: 'Sohag',
      nameFr: 'Sohag',
      lat: 26.5569,
      lon: 31.6948,
      icon: '🏛️',
      region: 'upper-egypt',
    },
    qena: {
      name: 'قنا',
      nameEn: 'Qena',
      nameFr: 'Qéna',
      lat: 26.1551,
      lon: 32.716,
      icon: '🏺',
      region: 'upper-egypt',
    },
    luxor: {
      name: 'الأقصر',
      nameEn: 'Luxor',
      nameFr: 'Louxor',
      lat: 25.6872,
      lon: 32.6396,
      icon: '🏺',
      region: 'upper-egypt',
    },
    aswan: {
      name: 'أسوان',
      nameEn: 'Aswan',
      nameFr: 'Assouan',
      lat: 24.0889,
      lon: 32.8998,
      icon: '⛵',
      region: 'upper-egypt',
    },
    'red-sea': {
      name: 'البحر الأحمر',
      nameEn: 'Red Sea',
      nameFr: 'Mer Rouge',
      lat: 27.2579,
      lon: 33.8116,
      icon: '🏊',
      region: 'red-sea',
    },
    'new-valley': {
      name: 'الوادي الجديد',
      nameEn: 'New Valley',
      nameFr: 'Nouvelle Vallée',
      lat: 25.4533,
      lon: 29.0733,
      icon: '🏜️',
      region: 'western-desert',
    },
    matrouh: {
      name: 'مطروح',
      nameEn: 'Matrouh',
      nameFr: 'Matruh',
      lat: 31.3543,
      lon: 27.2373,
      icon: '🌊',
      region: 'western-desert',
    },
    'north-sinai': {
      name: 'شمال سيناء',
      nameEn: 'North Sinai',
      nameFr: 'Sinaï du Nord',
      lat: 31.0456,
      lon: 33.7963,
      icon: '🏜️',
      region: 'sinai',
    },
    'south-sinai': {
      name: 'جنوب سيناء',
      nameEn: 'South Sinai',
      nameFr: 'Sinaï du Sud',
      lat: 28.9753,
      lon: 33.6156,
      icon: '🤿',
      region: 'sinai',
    },
  };

  const WEATHER_CODES = {
    0: { desc: 'سماء صافية', descEn: 'Clear sky', emoji: '☀️' },
    1: { desc: 'صافي في الغالب', descEn: 'Mainly clear', emoji: '🌤️' },
    2: { desc: 'غائم جزئياً', descEn: 'Partly cloudy', emoji: '⛅' },
    3: { desc: 'غائم', descEn: 'Overcast', emoji: '☁️' },
    45: { desc: 'ضباب', descEn: 'Fog', emoji: '🌫️' },
    48: { desc: 'ضباب متجمد', descEn: 'Depositing rime fog', emoji: '🌫️' },
    51: { desc: 'رذاذ خفيف', descEn: 'Light drizzle', emoji: '🌦️' },
    53: { desc: 'رذاذ متوسط', descEn: 'Moderate drizzle', emoji: '🌦️' },
    55: { desc: 'رذاذ كثيف', descEn: 'Dense drizzle', emoji: '🌧️' },
    61: { desc: 'مطر خفيف', descEn: 'Slight rain', emoji: '🌧️' },
    63: { desc: 'مطر متوسط', descEn: 'Moderate rain', emoji: '🌧️' },
    65: { desc: 'مطر غزير', descEn: 'Heavy rain', emoji: '⛈️' },
    71: { desc: 'ثلج خفيف', descEn: 'Slight snow', emoji: '🌨️' },
    73: { desc: 'ثلج متوسط', descEn: 'Moderate snow', emoji: '🌨️' },
    75: { desc: 'ثلج كثيف', descEn: 'Heavy snow', emoji: '❄️' },
    77: { desc: 'حبات ثلجية', descEn: 'Snow grains', emoji: '❄️' },
    80: { desc: 'زخات مطر خفيفة', descEn: 'Slight rain showers', emoji: '🌦️' },
    81: { desc: 'زخات مطر متوسطة', descEn: 'Moderate rain showers', emoji: '🌧️' },
    82: { desc: 'زخات مطر عنيفة', descEn: 'Violent rain showers', emoji: '⛈️' },
    85: { desc: 'زخات ثلج خفيفة', descEn: 'Slight snow showers', emoji: '🌨️' },
    86: { desc: 'زخات ثلج غزيرة', descEn: 'Heavy snow showers', emoji: '❄️' },
    95: { desc: 'عاصفة رعدية', descEn: 'Thunderstorm', emoji: '⛈️' },
    96: { desc: 'عاصفة رعدية مع برَد خفيف', descEn: 'Thunderstorm with slight hail', emoji: '⛈️' },
    99: { desc: 'عاصفة رعدية مع برَد غزير', descEn: 'Thunderstorm with heavy hail', emoji: '⛈️' },
  };

  const state = {
    cache: {},
    currentCity: 'cairo',
    initialized: false,
  };

  let elements = {};

  function getLang() {
    const lang = document.documentElement.lang || 'ar';
    return (lang === 'en' || lang === 'fr') ? lang : 'ar';
  }

  function getCityName(city, lang) {
    if (!city) return '';
    if (lang === 'en') return city.nameEn || city.name;
    if (lang === 'fr') return city.nameFr || city.nameEn || city.name;
    return city.name;
  }

  function initElements() {
    elements = {
      citySelect: document.getElementById('weather-city-select'),
      currentTemp: document.getElementById('current-temp'),
      weatherDesc: document.getElementById('weather-desc'),
      weatherIcon: document.getElementById('weather-icon'),
      feelsLike: document.getElementById('feels-like'),
      humidity: document.getElementById('humidity'),
      windSpeed: document.getElementById('wind-speed'),
      pressure: document.getElementById('pressure'),
      sunrise: document.getElementById('sunrise'),
      sunset: document.getElementById('sunset'),
      forecastContainer: document.getElementById('forecast-container'),
      lastUpdate: document.getElementById('last-update'),
      weatherCard: document.querySelector('.weather-card'),
    };

    return !!(elements.citySelect && elements.currentTemp && elements.weatherDesc);
  }

  async function fetchWeather(cityKey) {
    const cityData = CITIES[cityKey];
    if (!cityData) {
      throw new Error('City not found: ' + cityKey);
    }

    const cacheKey = `${cityKey}_weather`;
    const cached = state.cache[cacheKey];
    if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_DURATION) {
      return cached.data;
    }

    const params = new URLSearchParams({
      latitude: String(cityData.lat),
      longitude: String(cityData.lon),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'surface_pressure',
        'wind_speed_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
      ].join(','),
      timezone: CONFIG.TIMEZONE,
      forecast_days: '7',
    });

    const url = `${CONFIG.API_URL}?${params.toString()}`;
    if (CONFIG.DEBUG && window.logger?.debug) {
      window.logger.debug('Weather URL', '#06b6d4', url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather HTTP ${response.status}`);
    }

    const data = await response.json();
    state.cache[cacheKey] = { data, timestamp: Date.now() };
    return data;
  }

  function updateWeatherBackground(weatherCode) {
    if (!elements.weatherCard) return;

    elements.weatherCard.classList.remove(
      'weather-clear',
      'weather-clouds',
      'weather-rain',
      'weather-snow',
      'weather-thunderstorm'
    );

    if (weatherCode === 0 || weatherCode === 1) {
      elements.weatherCard.classList.add('weather-clear');
    } else if (weatherCode >= 2 && weatherCode <= 3) {
      elements.weatherCard.classList.add('weather-clouds');
    } else if (weatherCode >= 51 && weatherCode <= 82) {
      elements.weatherCard.classList.add('weather-rain');
    } else if (weatherCode >= 71 && weatherCode <= 86) {
      elements.weatherCard.classList.add('weather-snow');
    } else if (weatherCode >= 95) {
      elements.weatherCard.classList.add('weather-thunderstorm');
    }
  }

  function updateCurrentWeather(data) {
    if (!data || !data.current) return;

    const lang = getLang();
    const current = data.current;
    const daily = data.daily || {};

    const weatherCode = current.weather_code;
    const weatherInfo = WEATHER_CODES[weatherCode] || WEATHER_CODES[0];

    if (elements.currentTemp) elements.currentTemp.textContent = String(Math.round(current.temperature_2m));
    if (elements.weatherDesc) elements.weatherDesc.textContent = (lang === 'ar') ? weatherInfo.desc : weatherInfo.descEn;
    if (elements.weatherIcon) elements.weatherIcon.innerHTML = `<div style="font-size: 5rem;">${weatherInfo.emoji}</div>`;

    if (elements.feelsLike) elements.feelsLike.textContent = String(Math.round(current.apparent_temperature));
    if (elements.humidity) elements.humidity.textContent = String(Math.round(current.relative_humidity_2m));
    if (elements.windSpeed) elements.windSpeed.textContent = String(Math.round(current.wind_speed_10m * 3.6));
    if (elements.pressure) elements.pressure.textContent = String(Math.round(current.surface_pressure));

    if (elements.sunrise && daily.sunrise && daily.sunrise[0]) {
      const sunrise = new Date(daily.sunrise[0]);
      elements.sunrise.textContent = sunrise.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: lang === 'en',
      });
    }

    if (elements.sunset && daily.sunset && daily.sunset[0]) {
      const sunset = new Date(daily.sunset[0]);
      elements.sunset.textContent = sunset.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: lang === 'en',
      });
    }

    if (elements.lastUpdate) {
      const now = new Date();
      elements.lastUpdate.textContent = now.toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: lang === 'en',
      });
    }

    updateWeatherBackground(weatherCode);
  }

  function updateForecast(data) {
    if (!data || !data.daily || !elements.forecastContainer) return;

    const lang = getLang();
    const daily = data.daily;

    elements.forecastContainer.innerHTML = '';

    const daysToShow = 5;
    for (let i = 1; i <= daysToShow && i < daily.time.length; i++) {
      const date = new Date(daily.time[i]);
      const dayName = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' });

      const code = daily.weather_code[i];
      const info = WEATHER_CODES[code] || WEATHER_CODES[0];
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);

      const card = document.createElement('div');
      card.className = 'forecast-item';
      card.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div style="font-size: 2.5rem; margin: 0.5rem 0;">${info.emoji}</div>
        <div class="forecast-temp">
          <span class="temp-high">${maxTemp}°</span>
          <span class="temp-low">${minTemp}°</span>
        </div>
      `;
      elements.forecastContainer.appendChild(card);
    }
  }

  function showLoading() {
    if (elements.currentTemp) elements.currentTemp.textContent = '--';
    if (elements.weatherDesc) {
      elements.weatherDesc.textContent = 'جاري التحميل...';
      elements.weatherDesc.style.color = '';
    }
  }

  function showError(message) {
    if (elements.weatherDesc) {
      elements.weatherDesc.textContent = message || 'حدث خطأ في تحميل بيانات الطقس';
      elements.weatherDesc.style.color = 'var(--error-color, #ef4444)';
    }
    if (elements.currentTemp) elements.currentTemp.textContent = '--';
  }

  async function loadWeatherForCity(cityKey) {
    showLoading();
    try {
      state.currentCity = cityKey;
      const weatherData = await fetchWeather(cityKey);
      updateCurrentWeather(weatherData);
      updateForecast(weatherData);
    } catch (err) {
      console.error('❌ Error loading weather:', err);
      showError('❌ فشل تحميل بيانات الطقس');
    }
  }

  function setupEventListeners() {
    if (!elements.citySelect) return;

    elements.citySelect.addEventListener('change', (e) => {
      loadWeatherForCity(e.target.value);
    });

    // Re-populate when language changes
    window.addEventListener('languagechange', () => {
      populateCitySelect();
    });

    // Some pages may not dispatch languagechange; listen to our theme/language system if it exists
    window.addEventListener('storage', (e) => {
      if (e.key === 'language') {
        populateCitySelect();
      }
    });
  }

  function populateCitySelect() {
    if (!elements.citySelect) return;

    const lang = getLang();
    elements.citySelect.innerHTML = '';

    const regions = {
      'greater-cairo': lang === 'ar' ? 'القاهرة الكبرى' : (lang === 'fr' ? 'Grand Caire' : 'Greater Cairo'),
      delta: lang === 'ar' ? 'الدلتا' : (lang === 'fr' ? 'Delta du Nil' : 'Nile Delta'),
      canal: lang === 'ar' ? 'قناة السويس' : (lang === 'fr' ? 'Canal de Suez' : 'Suez Canal'),
      'upper-egypt': lang === 'ar' ? 'الصعيد' : (lang === 'fr' ? 'Haute-Égypte' : 'Upper Egypt'),
      'red-sea': lang === 'ar' ? 'البحر الأحمر' : (lang === 'fr' ? 'Mer Rouge' : 'Red Sea'),
      'western-desert': lang === 'ar' ? 'الصحراء الغربية' : (lang === 'fr' ? 'Désert Occidental' : 'Western Desert'),
      sinai: lang === 'ar' ? 'سيناء' : (lang === 'fr' ? 'Sinaï' : 'Sinai'),
    };

    const groupedCities = {};
    Object.entries(CITIES).forEach(([key, city]) => {
      const region = city.region || 'other';
      if (!groupedCities[region]) groupedCities[region] = [];
      groupedCities[region].push({ key, city });
    });

    Object.entries(regions).forEach(([regionKey, regionName]) => {
      if (!groupedCities[regionKey]) return;

      const optgroup = document.createElement('optgroup');
      optgroup.label = regionName;

      groupedCities[regionKey].forEach(({ key, city }) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${city.icon} ${getCityName(city, lang)}`;
        option.selected = key === state.currentCity;
        optgroup.appendChild(option);
      });

      elements.citySelect.appendChild(optgroup);
    });
  }

  async function init() {
    if (state.initialized) return true;

    // Wait DOM if needed
    if (document.readyState === 'loading') {
      await new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }

    const ok = initElements();
    if (!ok) {
      if (CONFIG.DEBUG) console.warn('⚠️ Weather elements not found on this page');
      return false;
    }

    populateCitySelect();
    setupEventListeners();

    await loadWeatherForCity(state.currentCity);

    setInterval(() => {
      // refresh current city
      loadWeatherForCity(state.currentCity);
    }, CONFIG.CACHE_DURATION);

    state.initialized = true;
    return true;
  }

  // Init normally
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
    });
  } else {
    setTimeout(init, 50);
  }

  // Lazy init when weather section becomes active
  const sectionObserver = new MutationObserver(() => {
    const weatherSection = document.getElementById('weather');
    if (weatherSection?.classList.contains('active') && !state.initialized) {
      init();
    }
  });

  if (document.body) {
    sectionObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class'],
    });
  }

  // Public API
  window.refreshWeather = function () {
    if (state.initialized) {
      loadWeatherForCity(state.currentCity);
    }
  };

  window.getWeatherForCity = async function (cityKey) {
    try {
      if (!CITIES[cityKey]) return null;
      const weatherData = await fetchWeather(cityKey);
      if (!weatherData || !weatherData.current) return null;

      const current = weatherData.current;
      const weatherCode = current.weather_code;
      const weatherInfo = WEATHER_CODES[weatherCode] || WEATHER_CODES[0];

      const cityData = CITIES[cityKey];
      return {
        city: cityData.name,
        cityEn: cityData.nameEn,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        description: weatherInfo.desc,
        descriptionEn: weatherInfo.descEn,
        icon: weatherInfo.emoji,
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m * 3.6),
        pressure: Math.round(current.surface_pressure),
        weatherCode,
      };
    } catch (err) {
      console.error('❌ Error getting weather for city:', err);
      return null;
    }
  };

  window.getWeatherCities = function () {
    return Object.entries(CITIES).map(([key, city]) => ({
      key,
      name: city.name,
      nameEn: city.nameEn,
      nameFr: city.nameFr || city.nameEn,
      icon: city.icon,
      region: city.region,
    }));
  };
})();

// Button handler referenced by HTML
async function addCurrentWeatherToPlan() {
  try {
    const cityKey = document.getElementById('weather-city-select')?.value;
    if (!cityKey) {
      showMessage('⚠️ الرجاء اختيار محافظة أولاً', 'warning');
      return;
    }

    const weatherData = await window.getWeatherForCity(cityKey);
    if (!weatherData) {
      showMessage('❌ فشل تحميل بيانات الطقس', 'error');
      return;
    }

    const weatherInfo = {
      city: weatherData.city,
      cityEn: weatherData.cityEn,
      temperature: weatherData.temperature,
      condition: weatherData.description,
      icon: weatherData.icon,
      humidity: weatherData.humidity,
      wind: weatherData.windSpeed,
      advice: getWeatherAdviceText(weatherData),
      timestamp: new Date().toLocaleString('ar-EG'),
    };

    let savedWeatherInfo = [];
    try {
      const saved = localStorage.getItem('weather_for_plans');
      if (saved) savedWeatherInfo = JSON.parse(saved);
    } catch (_) {
      // ignore
    }

    savedWeatherInfo.unshift(weatherInfo);
    savedWeatherInfo = savedWeatherInfo.slice(0, 10);
    localStorage.setItem('weather_for_plans', JSON.stringify(savedWeatherInfo));

    const lang = document.documentElement.lang || 'ar';
    const message = lang === 'ar'
      ? `✅ تم إضافة طقس ${weatherData.city} إلى خططك!`
      : `✅ Weather for ${weatherData.cityEn} added to your plans!`;

    showMessage(message, 'success');

    setTimeout(() => {
      const plansLink = document.querySelector('[data-section="plans"]');
      if (plansLink) plansLink.click();
    }, 1500);
  } catch (err) {
    console.error('❌ Error adding weather to plan:', err);
    showMessage('❌ حدث خطأ أثناء إضافة معلومات الطقس', 'error');
  }
}

function getWeatherAdviceText(weatherData) {
  const temp = weatherData.temperature;
  const code = weatherData.weatherCode;
  const lang = document.documentElement.lang || 'ar';

  let advice = '';
  if (temp > 40) {
    advice = lang === 'ar'
      ? '🌡️ حر شديد! اشرب الكثير من الماء وتجنب الشمس المباشرة'
      : '🌡️ Very hot! Drink plenty of water and avoid direct sun';
  } else if (temp > 35) {
    advice = lang === 'ar'
      ? '☀️ حار جداً، ارتدِ ملابس خفيفة واستخدم واقي الشمس'
      : '☀️ Very warm, wear light clothes and use sunscreen';
  } else if (temp > 25) {
    advice = lang === 'ar'
      ? '🌤️ طقس دافئ ومناسب للسياحة'
      : '🌤️ Warm and pleasant weather for tourism';
  } else if (temp > 15) {
    advice = lang === 'ar'
      ? '🧥 طقس معتدل، أحضر سترة خفيفة'
      : '🧥 Mild weather, bring a light jacket';
  } else {
    advice = lang === 'ar'
      ? '🧥 طقس بارد، ارتدِ ملابس دافئة'
      : '🧥 Cold weather, wear warm clothes';
  }

  if (code >= 51 && code <= 82) {
    advice += lang === 'ar'
      ? ' | ☔ توقع أمطار، أحضر مظلة'
      : ' | ☔ Rain expected, bring an umbrella';
  }

  return advice;
}

function showMessage(text, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-message toast-message-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    max-width: 400px;
  `;

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${text}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

if (!document.getElementById('weather-toast-styles')) {
  const style = document.createElement('style');
  style.id = 'weather-toast-styles';
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
    [dir="rtl"] .toast-message { right: auto; left: 20px; }
  `;
  document.head.appendChild(style);
}
