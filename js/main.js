// Switching between light and dark themes

const themeSwitch = document.querySelector("#switch");
const savedTheme = getInitialTheme();

applyTheme(savedTheme);

themeSwitch.addEventListener("change", () => {
    const theme = themeSwitch.checked ? "dark" : "light";

    applyTheme(theme);
    localStorage.setItem("weatherAppTheme", theme);
});

// DOM elements
const pageLoader = document.querySelector("#page-loader");
const languageSelect = document.querySelector("#language-select");
const languageButton = document.querySelector("#language-button");
const languageOptions = document.querySelector("#language-options");
const languageOptionButtons = document.querySelectorAll("[data-language]");
const searchForm = document.querySelector(".search-container");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const citySuggestions = document.querySelector("#city-suggestions");
const favoriteCitiesList = document.querySelector("#favorite-cities");
const recentSearchesList = document.querySelector("#recent-searches");
const favoriteButton = document.querySelector("#favorite-button");

const cityNameElement = document.querySelector("#city-name");
const dateElement = document.querySelector("#date");
const temperatureElement = document.querySelector("#temperature");
const descriptionElement = document.querySelector("#description");
const weatherIconElement = document.querySelector("#current-weather-icon");

const feelsLikeElement = document.querySelector("#feels-like");
const humidityElement = document.querySelector("#humidity");
const windSpeedElement = document.querySelector("#wind-speed");
const pressureElement = document.querySelector("#pressure");
const forecastCards = document.querySelectorAll(".forecast-card");
const forecastDayElements = document.querySelectorAll(".day-month h3");
const forecastDateElements = document.querySelectorAll(".day-month p");
const forecastIconElements = document.querySelectorAll(".forecast-card img");
const forecastTemperatureElements = document.querySelectorAll(".temp-range p");

const WEATHER_ICON_PATH = "./assets/icons/weather/";
const WARNING_ICON_PATH = "./assets/icons/warnings/";
const STRONG_WIND_SPEED_KMH = 54;
const LAST_CITY_KEY = "weatherAppLastCity";
const LAST_WEATHER_KEY = "weatherAppLastWeather";
const STARTUP_DONE_KEY = "weatherAppStartupDone";
const CACHE_MAX_AGE = 10 * 60 * 1000;

// Small saved state, so the app feels the same after refresh.
let currentLanguage = localStorage.getItem("weatherAppLanguage") || "en";
let lastLocation = null;
let lastWeather = null;
let lastDailyForecast = null;
let lastCanSaveCity = true;
let currentWeatherState = "default";
let currentCity = null;
let suggestionsTimeout = null;
let weatherRequestId = 0;
let apiCooldownUntil = 0;
const suggestionsCache = {};

// UI
const translations = {
    en: {
        htmlLang: "en",
        dateLocale: "en-US",
        appSubtitle: "Check the weather, plan your day.",
        loaderText: "Loading weather app...",
        headline: "What's the weather like today?",
        subtitle: "Search for a city and get the latest weather.",
        cityLabel: "City name",
        cityPlaceholder: "Enter city name...",
        searchButton: "Search",
        defaultCity: "New York, USA",
        defaultDate: "Monday, May 19 - 12:00 PM",
        defaultDescription: "Partly cloudy",
        feelsLike: "Feels like",
        humidity: "Humidity",
        wind: "Wind",
        pressure: "Pressure",
        footer: "Created by Duck-Script",
        favoritesTitle: "Favorite cities",
        favoritesLimit: "Max 5",
        recentTitle: "Recent searches",
        recentLimit: "Last 5",
        saveCity: "☆ Save city",
        savedCity: "★ Saved",
        noFavorites: "No favorite cities yet.",
        noRecentSearches: "No recent searches yet.",
        noSuggestions: "No results",
        yourLocation: "Your location",
        forecastDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        forecastDates: ["May 19", "May 20", "May 21", "May 22", "May 23"],
        loadingCity: "Loading...",
        loadingDescription: "Getting current weather...",
        weatherUnavailable: "Weather unavailable",
        loadingWeatherAlt: "Loading weather",
        weatherErrorAlt: "Weather error",
        errors: {
            emptyCity: "Please enter a city name.",
            cityNotLoaded: "Could not find this city. Please try again.",
            cityNotFound: "City not found. Please check the spelling.",
            weatherNotLoaded: "Could not load weather data. Please try again.",
            networkError: "Network error. Please check your connection and try again.",
            tooManyRequests: "Too many weather requests. Please wait a minute and try again."
        },
        weatherDescriptions: {
            clearSky: "Clear sky",
            partlyCloudy: "Partly cloudy",
            cloudy: "Cloudy",
            foggy: "Foggy",
            drizzle: "Drizzle",
            snow: "Snow",
            rainShowers: "Rain showers",
            thunderstorm: "Thunderstorm"
        }
    },
    pl: {
        htmlLang: "pl",
        dateLocale: "pl-PL",
        appSubtitle: "Sprawdź pogodę i zaplanuj dzień.",
        loaderText: "Ładowanie aplikacji pogodowej...",
        headline: "Jaka jest dziś pogoda?",
        subtitle: "Wyszukaj miasto i sprawdź aktualną pogodę.",
        cityLabel: "Nazwa miasta",
        cityPlaceholder: "Wpisz nazwę miasta...",
        searchButton: "Szukaj",
        defaultCity: "Nowy Jork, USA",
        defaultDate: "Poniedziałek, 19 maja - 12:00",
        defaultDescription: "Częściowe zachmurzenie",
        feelsLike: "Odczuwalna",
        humidity: "Wilgotność",
        wind: "Wiatr",
        pressure: "Ciśnienie",
        footer: "Stworzone przez Duck-Script",
        favoritesTitle: "Ulubione miasta",
        favoritesLimit: "Max 5",
        recentTitle: "Ostatnie wyszukiwania",
        recentLimit: "Ostatnie 5",
        saveCity: "☆ Zapisz miasto",
        savedCity: "★ Zapisane",
        noFavorites: "Brak ulubionych miast.",
        noRecentSearches: "Brak ostatnich wyszukiwań.",
        noSuggestions: "Brak wyników",
        yourLocation: "Twoja lokalizacja",
        forecastDays: ["Pon", "Wt", "Śr", "Czw", "Pt"],
        forecastDates: ["19 maja", "20 maja", "21 maja", "22 maja", "23 maja"],
        loadingCity: "Ładowanie...",
        loadingDescription: "Pobieranie aktualnej pogody...",
        weatherUnavailable: "Pogoda niedostępna",
        loadingWeatherAlt: "Ładowanie pogody",
        weatherErrorAlt: "Błąd pogody",
        errors: {
            emptyCity: "Wpisz nazwę miasta.",
            cityNotLoaded: "Nie udało się znaleźć tego miasta. Spróbuj ponownie.",
            cityNotFound: "Nie znaleziono miasta. Sprawdź pisownię.",
            weatherNotLoaded: "Nie udało się pobrać pogody. Spróbuj ponownie.",
            networkError: "Błąd sieci. Sprawdź połączenie i spróbuj ponownie.",
            tooManyRequests: "Zbyt wiele zapytań o pogodę. Poczekaj minutę i spróbuj ponownie."
        },
        weatherDescriptions: {
            clearSky: "Bezchmurnie",
            partlyCloudy: "Częściowe zachmurzenie",
            cloudy: "Pochmurno",
            foggy: "Mgła",
            drizzle: "Mżawka",
            snow: "Śnieg",
            rainShowers: "Przelotny deszcz",
            thunderstorm: "Burza"
        }
    },
    ua: {
        htmlLang: "uk",
        dateLocale: "uk-UA",
        appSubtitle: "Перевір погоду та сплануй свій день.",
        loaderText: "Завантаження застосунку погоди...",
        headline: "Яка сьогодні погода?",
        subtitle: "Знайди місто та отримай актуальну погоду.",
        cityLabel: "Назва міста",
        cityPlaceholder: "Введи назву міста...",
        searchButton: "Пошук",
        defaultCity: "Нью-Йорк, США",
        defaultDate: "Понеділок, 19 травня - 12:00",
        defaultDescription: "Мінлива хмарність",
        feelsLike: "Відчувається",
        humidity: "Вологість",
        wind: "Вітер",
        pressure: "Тиск",
        footer: "Створено Duck-Script",
        favoritesTitle: "Улюблені міста",
        favoritesLimit: "Макс. 5",
        recentTitle: "Останні пошуки",
        recentLimit: "Останні 5",
        saveCity: "☆ Зберегти місто",
        savedCity: "★ Збережено",
        noFavorites: "Улюблених міст ще немає.",
        noRecentSearches: "Останніх пошуків ще немає.",
        noSuggestions: "Нічого не знайдено",
        yourLocation: "Твоя локація",
        forecastDays: ["Пн", "Вт", "Ср", "Чт", "Пт"],
        forecastDates: ["19 травня", "20 травня", "21 травня", "22 травня", "23 травня"],
        loadingCity: "Завантаження...",
        loadingDescription: "Отримуємо актуальну погоду...",
        weatherUnavailable: "Погода недоступна",
        loadingWeatherAlt: "Завантаження погоди",
        weatherErrorAlt: "Помилка погоди",
        errors: {
            emptyCity: "Будь ласка, введи назву міста.",
            cityNotLoaded: "Не вдалося знайти це місто. Спробуй ще раз.",
            cityNotFound: "Місто не знайдено. Перевір написання.",
            weatherNotLoaded: "Не вдалося завантажити погоду. Спробуй ще раз.",
            networkError: "Помилка мережі. Перевір підключення та спробуй ще раз.",
            tooManyRequests: "Забагато запитів погоди. Зачекай хвилину та спробуй ще раз."
        },
        weatherDescriptions: {
            clearSky: "Ясно",
            partlyCloudy: "Мінлива хмарність",
            cloudy: "Хмарно",
            foggy: "Туман",
            drizzle: "Мряка",
            snow: "Сніг",
            rainShowers: "Зливи",
            thunderstorm: "Гроза"
        }
    }
};
if (!translations[currentLanguage]) {
    currentLanguage = "en";
}

// Event listeners

applyLanguage();
renderFavorites();
renderRecentSearches();
initializeStartupWeather();

window.addEventListener("load", () => {
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.classList.add("hidden");
        }, 900);
    }
});

languageSelect.addEventListener("change", () => {
    changeLanguage(languageSelect.value);
});

languageButton.addEventListener("click", () => {
    const isOpen = !languageOptions.hidden;

    languageOptions.hidden = isOpen;
    languageButton.setAttribute("aria-expanded", String(!isOpen));
});

languageOptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        changeLanguage(button.dataset.language);
        closeLanguageMenu();
    });
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-menu")) {
        closeLanguageMenu();
    }
});

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    searchWeatherByCity(city);
});

favoriteButton.addEventListener("click", () => {
    addFavoriteCity();
});

cityInput.addEventListener("input", () => {
    clearTimeout(suggestionsTimeout);

    const city = cityInput.value.trim();

    if (city.length < 3) {
        hideSuggestions();
        return;
    }

    suggestionsTimeout = setTimeout(() => {
        fetchCitySuggestions(city);
    }, 600);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-input-wrapper")) {
        hideSuggestions();
    }
});

// API functions

async function searchWeatherByCity(city) {
    const trimmedCity = city.trim();

    if (trimmedCity === "") {
        showError(getText().errors.emptyCity);
        return;
    }

    if (searchButton.disabled) {
        return;
    }

    if (isApiOnCooldown()) {
        showError(getText().errors.tooManyRequests);
        return;
    }

    hideSuggestions();
    showLoading();

    const requestId = getNextWeatherRequestId();

    try {
        const location = await getCityLocation(trimmedCity);
        const weatherData = await getWeatherData(location.latitude, location.longitude);

        if (!isActiveWeatherRequest(requestId)) {
            return;
        }

        renderWeather(location, weatherData.current, weatherData.daily);
        saveCachedWeather(location, weatherData.current, weatherData.daily, true);
        saveLastCity(currentCity);
        addRecentSearch(currentCity);
    } catch (error) {
        if (!isActiveWeatherRequest(requestId)) {
            return;
        }

        showError(error.message);
    }
}

async function getCityLocation(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

    try {
        if (isApiOnCooldown()) {
            throw new Error(getText().errors.tooManyRequests);
        }

        const response = await fetch(url);

        if (response.status === 429) {
            startApiCooldown();
            throw new Error(getText().errors.tooManyRequests);
        }

        if (!response.ok) {
            throw new Error(getText().errors.cityNotLoaded);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error(getText().errors.cityNotFound);
        }

        return data.results[0];
    } catch (error) {
        if (isNetworkError(error)) {
            throw new Error(getText().errors.networkError);
        }

        throw error;
    }
}

async function getWeatherData(latitude, longitude) {
    const currentValues = "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code,is_day";
    const dailyValues = "weather_code,temperature_2m_max,temperature_2m_min";
    // One API call gives current weather and the 5 day forecast.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentValues}&daily=${dailyValues}&forecast_days=5&timezone=auto`;

    try {
        if (isApiOnCooldown()) {
            throw new Error(getText().errors.tooManyRequests);
        }

        const response = await fetch(url);

        if (response.status === 429) {
            startApiCooldown();
            throw new Error(getText().errors.tooManyRequests);
        }

        if (!response.ok) {
            throw new Error(getText().errors.weatherNotLoaded);
        }

        const data = await response.json();

        return {
            current: data.current,
            daily: data.daily
        };
    } catch (error) {
        if (isNetworkError(error)) {
            throw new Error(getText().errors.networkError);
        }

        throw error;
    }
}

async function searchWeatherByCoordinates(latitude, longitude, displayName) {
    const requestId = getNextWeatherRequestId();

    showLoading();

    try {
        const weatherData = await getWeatherData(latitude, longitude);
        const location = await getLocationByCoordinates(latitude, longitude, displayName);
        const canSaveCity = !location.isCurrentLocation;

        if (!isActiveWeatherRequest(requestId)) {
            return;
        }

        renderWeather(location, weatherData.current, weatherData.daily, canSaveCity);
        saveCachedWeather(location, weatherData.current, weatherData.daily, canSaveCity);
    } catch (error) {
        if (!isActiveWeatherRequest(requestId)) {
            return;
        }

        showError(error.message);
    }
}

// Render functions

function showLoading() {
    currentWeatherState = "loading";
    searchButton.disabled = true;

    cityNameElement.textContent = getText().loadingCity;
    dateElement.textContent = "";
    temperatureElement.textContent = "--°C";
    descriptionElement.textContent = getText().loadingDescription;
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
    weatherIconElement.src = `${WEATHER_ICON_PATH}partly-cloudy.svg`;
    weatherIconElement.alt = getText().loadingWeatherAlt;
    setForecastPlaceholders();
}

function showError(message) {
    currentWeatherState = "error";
    currentCity = null;
    searchButton.disabled = false;

    cityNameElement.textContent = getText().weatherUnavailable;
    dateElement.textContent = "";
    temperatureElement.textContent = "--°C";
    descriptionElement.textContent = message;
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
    weatherIconElement.src = `${WARNING_ICON_PATH}warning.svg`;
    weatherIconElement.alt = getText().weatherErrorAlt;
    setForecastPlaceholders();
    updateFavoriteButton();
}

function renderWeather(location, weather, dailyForecast, canSaveCity = true) {
    const weatherDescription = getWeatherDescription(weather.weather_code);
    const isNight = weather.is_day === 0;
    const text = getText();

    lastLocation = location;
    lastWeather = weather;
    lastDailyForecast = dailyForecast;
    lastCanSaveCity = canSaveCity;
    currentWeatherState = "weather";
    searchButton.disabled = false;
    currentCity = canSaveCity ? {
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
    } : null;

    cityNameElement.textContent = getLocationLabel(location);
    dateElement.textContent = new Date(weather.time).toLocaleDateString(text.dateLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    temperatureElement.textContent = `${Math.round(weather.temperature_2m)}°C`;
    descriptionElement.textContent = weatherDescription;
    feelsLikeElement.textContent = `${Math.round(weather.apparent_temperature)}°C`;
    humidityElement.textContent = `${weather.relative_humidity_2m}%`;
    windSpeedElement.textContent = `${Math.round(weather.wind_speed_10m)} km/h`;
    pressureElement.textContent = `${Math.round(weather.pressure_msl)} hPa`;

    weatherIconElement.src = getWeatherIcon(weather.weather_code, isNight, weather.wind_speed_10m);
    weatherIconElement.alt = weatherDescription;
    renderForecast(dailyForecast);
    updateFavoriteButton();
}

// Helper functions

function getText() {
    return translations[currentLanguage];
}

function isNetworkError(error) {
    return error instanceof TypeError || error.message === "Failed to fetch";
}

function isApiOnCooldown() {
    return Date.now() < apiCooldownUntil;
}

function startApiCooldown(seconds = 60) {
    apiCooldownUntil = Date.now() + seconds * 1000;
}

function isTooManyRequestsError(error) {
    return error.message === getText().errors.tooManyRequests;
}

function getCachedWeather() {
    try {
        const cachedWeather = JSON.parse(localStorage.getItem(LAST_WEATHER_KEY));

        if (!cachedWeather || Date.now() - cachedWeather.timestamp > CACHE_MAX_AGE) {
            return null;
        }

        return cachedWeather;
    } catch (error) {
        return null;
    }
}

function saveCachedWeather(location, weather, dailyForecast, canSaveCity) {
    const cachedWeather = {
        location,
        current: weather,
        daily: dailyForecast,
        canSaveCity,
        timestamp: Date.now()
    };

    localStorage.setItem(LAST_WEATHER_KEY, JSON.stringify(cachedWeather));
}

function applyTheme(theme) {
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
        themeSwitch.checked = true;
    } else {
        document.body.classList.remove("dark-theme");
        themeSwitch.checked = false;
    }
}

function getInitialTheme() {
    const savedTheme = localStorage.getItem("weatherAppTheme");

    if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }

    return "light";
}

async function getLocationByCoordinates(latitude, longitude, fallbackName) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${getReverseGeocodeLanguage()}`;

    try {
        const response = await fetch(url);

        if (response.status === 429) {
            startApiCooldown();
            throw new Error(getText().errors.tooManyRequests);
        }

        if (!response.ok) {
            throw new Error(getText().errors.cityNotLoaded);
        }

        const data = await response.json();
        const cityName = data.city || data.locality || data.principalSubdivision;
        const countryName = data.countryName || data.countryCode || "";

        if (!cityName) {
            throw new Error(getText().errors.cityNotLoaded);
        }

        return {
            name: cityName,
            country: countryName,
            latitude,
            longitude
        };
    } catch (error) {
        return {
            name: fallbackName || getText().yourLocation,
            country: "",
            latitude,
            longitude,
            isCurrentLocation: true
        };
    }
}

function getReverseGeocodeLanguage() {
    if (currentLanguage === "ua") {
        return "uk";
    }

    return currentLanguage;
}

function getNextWeatherRequestId() {
    weatherRequestId++;

    return weatherRequestId;
}

function isActiveWeatherRequest(requestId) {
    return requestId === weatherRequestId;
}

async function initializeStartupWeather() {
    const cachedWeather = getCachedWeather();

    if (cachedWeather) {
        renderWeather(cachedWeather.location, cachedWeather.current, cachedWeather.daily, cachedWeather.canSaveCity);
        return;
    }

    if (sessionStorage.getItem(STARTUP_DONE_KEY)) {
        return;
    }

    sessionStorage.setItem(STARTUP_DONE_KEY, "true");

    if (isApiOnCooldown()) {
        showError(getText().errors.tooManyRequests);
        return;
    }

    if (getLastCity()) {
        await loadLastCityWeather();
        return;
    }

    const startupRequestId = weatherRequestId;
    const loadedByLocation = await tryLoadWeatherByGeolocation(startupRequestId);

    if (!loadedByLocation && isActiveWeatherRequest(startupRequestId)) {
        setDefaultWeatherText();
    }
}

async function tryLoadWeatherByGeolocation(startupRequestId) {
    if (!navigator.geolocation) {
        return false;
    }

    try {
        const position = await getCurrentPosition();

        if (!isActiveWeatherRequest(startupRequestId)) {
            return false;
        }

        await searchWeatherByCoordinates(
            position.coords.latitude,
            position.coords.longitude,
            getText().yourLocation
        );

        return true;
    } catch (error) {
        return false;
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 7000,
            maximumAge: 600000
        });
    });
}

async function loadLastCityWeather() {
    const lastCity = getLastCity();
    const requestId = getNextWeatherRequestId();

    if (!lastCity) {
        return false;
    }

    showLoading();

    try {
        const location = typeof lastCity.latitude === "number" && typeof lastCity.longitude === "number"
            ? lastCity
            : await getCityLocation(lastCity.name);
        const weatherData = await getWeatherData(location.latitude, location.longitude);

        if (!isActiveWeatherRequest(requestId)) {
            return;
        }

        renderWeather(location, weatherData.current, weatherData.daily);
        saveCachedWeather(location, weatherData.current, weatherData.daily, true);
        saveLastCity(currentCity);
        return true;
    } catch (error) {
        if (!isActiveWeatherRequest(requestId)) {
            return false;
        }

        if (isTooManyRequestsError(error)) {
            showError(error.message);
            return true;
        }

        setDefaultWeatherText();
        return false;
    }
}

function applyLanguage() {
    const text = getText();

    document.documentElement.lang = text.htmlLang;
    languageSelect.value = currentLanguage;
    languageButton.textContent = currentLanguage.toUpperCase();

    if (pageLoader) {
        pageLoader.querySelector("p").textContent = text.loaderText;
    }

    document.querySelector(".app-subtitle").textContent = text.appSubtitle;
    document.querySelector("#headline").textContent = text.headline;
    document.querySelector("#subtitle").textContent = text.subtitle;
    document.querySelector("label[for='city-input']").textContent = text.cityLabel;
    cityInput.placeholder = text.cityPlaceholder;
    document.querySelector("#search-button").textContent = text.searchButton;

    document.querySelector(".feels-like-container h3").textContent = text.feelsLike;
    document.querySelector(".humidity-container h3").textContent = text.humidity;
    document.querySelector(".wind-container h3").textContent = text.wind;
    document.querySelector(".pressure-container h3").textContent = text.pressure;
    document.querySelector("footer p").textContent = text.footer;
    document.querySelector("#favorites-title").textContent = text.favoritesTitle;
    document.querySelector("#favorites-limit").textContent = text.favoritesLimit;
    document.querySelector("#recent-title").textContent = text.recentTitle;
    document.querySelector("#recent-limit").textContent = text.recentLimit;

    languageOptionButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.language === currentLanguage);
        button.setAttribute("aria-selected", String(button.dataset.language === currentLanguage));
    });

    if (currentWeatherState === "default") {
        setDefaultWeatherText();
    } else if (currentWeatherState === "weather" && lastDailyForecast) {
        renderForecast(lastDailyForecast);
    }

    renderFavorites();
    renderRecentSearches();
    updateFavoriteButton();
}

function changeLanguage(language) {
    currentLanguage = language;
    localStorage.setItem("weatherAppLanguage", currentLanguage);
    applyLanguage();

    // Re-render weather after language change, so dates and descriptions update too.
    if (lastLocation && lastWeather) {
        renderWeather(lastLocation, lastWeather, lastDailyForecast, lastCanSaveCity);
    } else if (currentWeatherState === "loading") {
        showLoading();
    } else if (currentWeatherState === "default") {
        setDefaultWeatherText();
    }
}

function closeLanguageMenu() {
    languageOptions.hidden = true;
    languageButton.setAttribute("aria-expanded", "false");
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("weatherAppFavorites")) || [];
    } catch (error) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem("weatherAppFavorites", JSON.stringify(favorites));
}

function getLastCity() {
    try {
        return JSON.parse(localStorage.getItem(LAST_CITY_KEY));
    } catch (error) {
        return null;
    }
}

function saveLastCity(city) {
    if (!city || !city.name) {
        return;
    }

    localStorage.setItem(LAST_CITY_KEY, JSON.stringify(city));
}

function renderFavorites() {
    const favorites = getFavorites();
    favoriteCitiesList.innerHTML = "";

    if (favorites.length === 0) {
        favoriteCitiesList.innerHTML = `<li><p class="city-list__empty">${getText().noFavorites}</p></li>`;
        return;
    }

    favorites.forEach((city) => {
        const cityItem = document.createElement("li");
        const cityButton = document.createElement("button");
        const removeButton = document.createElement("button");

        cityButton.className = "city-list__button";
        cityButton.type = "button";
        cityButton.textContent = getCityLabel(city);
        cityButton.addEventListener("click", () => {
            searchWeatherByCity(city.name);
        });

        removeButton.className = "city-list__remove";
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.addEventListener("click", () => {
            removeFavoriteCity(city.name);
        });

        cityItem.append(cityButton, removeButton);
        favoriteCitiesList.append(cityItem);
    });
}

function addFavoriteCity() {
    if (!currentCity) {
        return;
    }

    const favorites = getFavorites();
    const isAlreadyFavorite = favorites.some((city) => city.name === currentCity.name);

    if (isAlreadyFavorite) {
        console.log("City is already in favorites.");
        return;
    }

    if (favorites.length >= 5) {
        console.log("You can save up to 5 favorite cities.");
        return;
    }

    favorites.unshift(currentCity);
    saveFavorites(favorites);
    renderFavorites();
    updateFavoriteButton();
}

function removeFavoriteCity(cityName) {
    const favorites = getFavorites().filter((city) => city.name !== cityName);

    saveFavorites(favorites);
    renderFavorites();
    updateFavoriteButton();
}

function getRecentSearches() {
    try {
        return JSON.parse(localStorage.getItem("weatherAppRecentSearches")) || [];
    } catch (error) {
        return [];
    }
}

function saveRecentSearches(recentSearches) {
    localStorage.setItem("weatherAppRecentSearches", JSON.stringify(recentSearches));
}

function addRecentSearch(city) {
    if (!city || !city.name) {
        return;
    }

    // Keep latest search on top and avoid duplicated cities.
    const recentSearches = getRecentSearches().filter((recentCity) => recentCity.name !== city.name);

    recentSearches.unshift(city);
    saveRecentSearches(recentSearches.slice(0, 5));
    renderRecentSearches();
}

function renderRecentSearches() {
    const recentSearches = getRecentSearches();
    recentSearchesList.innerHTML = "";

    if (recentSearches.length === 0) {
        recentSearchesList.innerHTML = `<li><p class="city-list__empty">${getText().noRecentSearches}</p></li>`;
        return;
    }

    recentSearches.forEach((city) => {
        const cityItem = document.createElement("li");
        const cityButton = document.createElement("button");

        cityButton.className = "city-list__button";
        cityButton.type = "button";
        cityButton.textContent = getCityLabel(city);
        cityButton.addEventListener("click", () => {
            searchWeatherByCity(city.name);
        });

        cityItem.append(cityButton);
        recentSearchesList.append(cityItem);
    });
}

function updateFavoriteButton() {
    if (!currentCity) {
        favoriteButton.textContent = getText().saveCity;
        favoriteButton.disabled = true;
        return;
    }

    const isFavorite = getFavorites().some((city) => city.name === currentCity.name);

    favoriteButton.disabled = false;
    favoriteButton.textContent = isFavorite ? getText().savedCity : getText().saveCity;
}

function getCityLabel(city) {
    return city.country ? `${city.name}, ${city.country}` : city.name;
}

function getLocationLabel(location) {
    if (location.isCurrentLocation) {
        return getText().yourLocation;
    }

    return getCityLabel(location);
}

async function fetchCitySuggestions(city) {
    const query = city.toLowerCase();

    if (isApiOnCooldown()) {
        hideSuggestions();
        return;
    }

    if (suggestionsCache[query]) {
        renderCitySuggestions(suggestionsCache[query]);
        return;
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5`;

    try {
        const response = await fetch(url);

        if (response.status === 429) {
            startApiCooldown();
            hideSuggestions();
            showError(getText().errors.tooManyRequests);
            return;
        }

        if (!response.ok) {
            hideSuggestions();
            return;
        }

        const data = await response.json();
        const suggestions = data.results || [];

        suggestionsCache[query] = suggestions;
        renderCitySuggestions(suggestions);
    } catch (error) {
        hideSuggestions();
    }
}

function renderCitySuggestions(cities) {
    citySuggestions.innerHTML = "";

    if (cities.length === 0) {
        citySuggestions.innerHTML = `<li class="city-suggestions__empty">${getText().noSuggestions}</li>`;
        citySuggestions.hidden = false;
        return;
    }

    cities.forEach((city) => {
        const cityItem = document.createElement("li");
        const cityButton = document.createElement("button");
        const cityName = document.createElement("strong");
        const cityMeta = document.createElement("span");
        const cityDetails = [city.admin1, city.country].filter(Boolean).join(", ");

        cityButton.type = "button";
        cityName.textContent = city.name;
        cityMeta.textContent = cityDetails;

        cityButton.append(cityName, cityMeta);
        cityButton.addEventListener("click", () => {
            cityInput.value = city.name;
            searchWeatherByCity(city.name);
        });

        cityItem.append(cityButton);
        citySuggestions.append(cityItem);
    });

    citySuggestions.hidden = false;
}

function hideSuggestions() {
    citySuggestions.hidden = true;
    citySuggestions.innerHTML = "";
}

function setDefaultWeatherText() {
    const text = getText();

    currentCity = null;
    searchButton.disabled = false;
    cityNameElement.textContent = text.defaultCity;
    dateElement.textContent = text.defaultDate;
    temperatureElement.textContent = "18°C";
    descriptionElement.textContent = text.defaultDescription;
    feelsLikeElement.textContent = "18°C";
    humidityElement.textContent = "68%";
    windSpeedElement.textContent = "12 km/h";
    pressureElement.textContent = "1015 hPa";
    weatherIconElement.src = `${WEATHER_ICON_PATH}partly-cloudy.svg`;
    weatherIconElement.alt = text.defaultDescription;
    setDefaultForecast();
    updateFavoriteButton();
}

function renderForecast(dailyForecast) {
    if (!dailyForecast || !dailyForecast.time) {
        setForecastPlaceholders();
        return;
    }

    // Forecast cards already exist in HTML, JS only fills them with fresh data.
    for (let i = 0; i < forecastCards.length; i++) {
        const weatherCode = dailyForecast.weather_code[i];
        const date = dailyForecast.time[i] || getFutureDate(i);
        const maxTemp = dailyForecast.temperature_2m_max[i];
        const minTemp = dailyForecast.temperature_2m_min[i];
        const forecastDescription = getWeatherDescription(weatherCode);

        forecastCards[i].classList.toggle("forecast-card--today", i === 0);
        forecastDayElements[i].textContent = getForecastDayName(date);
        forecastDateElements[i].textContent = getForecastDate(date);
        forecastIconElements[i].src = getWeatherIcon(weatherCode);
        forecastIconElements[i].alt = forecastDescription;
        forecastTemperatureElements[i * 2].textContent = formatTemperature(maxTemp);
        forecastTemperatureElements[i * 2 + 1].textContent = formatTemperature(minTemp);
    }
}

function setDefaultForecast() {
    // Demo forecast for the first screen before user searches a real city.
    const defaultMaxTemperatures = [18, 21, 16, 19, 22];
    const defaultMinTemperatures = [10, 11, 9, 12, 13];
    const defaultWeatherCodes = [2, 1, 3, 61, 0];

    for (let i = 0; i < forecastCards.length; i++) {
        const date = new Date();

        date.setDate(date.getDate() + i);

        forecastCards[i].classList.toggle("forecast-card--today", i === 0);
        forecastDayElements[i].textContent = getForecastDayName(date);
        forecastDateElements[i].textContent = getForecastDate(date);
        forecastIconElements[i].src = getWeatherIcon(defaultWeatherCodes[i]);
        forecastIconElements[i].alt = getWeatherDescription(defaultWeatherCodes[i]);
        forecastTemperatureElements[i * 2].textContent = `${defaultMaxTemperatures[i]}°C`;
        forecastTemperatureElements[i * 2 + 1].textContent = `${defaultMinTemperatures[i]}°C`;
    }
}

function setForecastPlaceholders() {
    for (let i = 0; i < forecastCards.length; i++) {
        const date = new Date();

        date.setDate(date.getDate() + i);

        forecastCards[i].classList.toggle("forecast-card--today", i === 0);
        forecastDayElements[i].textContent = getForecastDayName(date);
        forecastDateElements[i].textContent = getForecastDate(date);
        forecastIconElements[i].src = `${WEATHER_ICON_PATH}partly-cloudy.svg`;
        forecastIconElements[i].alt = getText().loadingWeatherAlt;
        forecastTemperatureElements[i * 2].textContent = "--°C";
        forecastTemperatureElements[i * 2 + 1].textContent = "--°C";
    }
}

function getForecastDayName(dateValue) {
    return getForecastDateObject(dateValue).toLocaleDateString(getText().dateLocale, {
        weekday: "short"
    });
}

function getForecastDate(dateValue) {
    return getForecastDateObject(dateValue).toLocaleDateString(getText().dateLocale, {
        month: "short",
        day: "numeric"
    });
}

function getForecastDateObject(dateValue) {
    if (dateValue instanceof Date) {
        return dateValue;
    }

    // Noon avoids timezone edge cases when parsing API dates.
    return new Date(`${dateValue}T12:00:00`);
}

function getFutureDate(daysAhead) {
    const date = new Date();

    date.setDate(date.getDate() + daysAhead);

    return date;
}

function formatTemperature(temperature) {
    if (typeof temperature !== "number") {
        return "--°C";
    }

    return `${Math.round(temperature)}°C`;
}

function getWeatherDescription(weatherCode) {
    const weatherDescriptions = getText().weatherDescriptions;

    if (weatherCode === 0) {
        return weatherDescriptions.clearSky;
    } else if (weatherCode === 1 || weatherCode === 2) {
        return weatherDescriptions.partlyCloudy;
    } else if (weatherCode === 3) {
        return weatherDescriptions.cloudy;
    } else if (weatherCode === 45 || weatherCode === 48) {
        return weatherDescriptions.foggy;
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        return weatherDescriptions.drizzle;
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        return weatherDescriptions.snow;
    } else if (weatherCode >= 80 && weatherCode <= 82) {
        return weatherDescriptions.rainShowers;
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        return weatherDescriptions.thunderstorm;
    } else {
        return weatherDescriptions.cloudy;
    }
}

function getWeatherIcon(weatherCode, isNight = false, windSpeed = 0) {
    let iconName = "partly-cloudy.svg";

    if (windSpeed >= STRONG_WIND_SPEED_KMH && weatherCode !== 95 && weatherCode !== 96 && weatherCode !== 99) {
        iconName = "strong-wind.svg";
    } else if (weatherCode === 0) {
        iconName = isNight ? "night.svg" : "day.svg";
    } else if (weatherCode === 1 || weatherCode === 2) {
        iconName = "partly-cloudy.svg";
    } else if (weatherCode === 3) {
        iconName = "cloudy.svg";
    } else if (weatherCode === 45 || weatherCode === 48) {
        iconName = "fog.svg";
    } else if (
        weatherCode === 51 ||
        weatherCode === 53 ||
        weatherCode === 55 ||
        weatherCode === 56 ||
        weatherCode === 57 ||
        weatherCode === 66 ||
        weatherCode === 67
    ) {
        iconName = "sleet.svg";
    } else if (
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65 ||
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {
        iconName = "rain.svg";
    } else if (
        weatherCode === 71 ||
        weatherCode === 73 ||
        weatherCode === 75 ||
        weatherCode === 77 ||
        weatherCode === 85 ||
        weatherCode === 86
    ) {
        iconName = "snow.svg";
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        iconName = "thunderstorm.svg";
    }

    return `${WEATHER_ICON_PATH}${iconName}`;
}
