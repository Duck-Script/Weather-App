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
const appClock = document.querySelector("#app-clock");
const searchForm = document.querySelector(".search-container");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");
const citySuggestions = document.querySelector("#city-suggestions");
const favoriteCitiesList = document.querySelector("#favorite-cities");
const recentSearchesList = document.querySelector("#recent-searches");
const favoriteButton = document.querySelector("#favorite-button");
const duckButton = document.querySelector("#duck-easter-button");

const cityNameElement = document.querySelector("#city-name");
const dateElement = document.querySelector("#date");
const localTimeElement = document.querySelector("#weather-local-time");
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
const STARTUP_DONE_KEY = "weatherAppLocationTried";
const API_COOLDOWN_KEY = "weatherAppApiCooldownUntil";
const FAVORITES_LIMIT = 15;
const CACHE_MAX_AGE = 10 * 60 * 1000;
const WEATHER_BACKGROUND_CLASSES = [
    "weather-default",
    "weather-clear-day",
    "weather-clear-night",
    "weather-cloudy",
    "weather-rain",
    "weather-snow",
    "weather-thunderstorm",
    "weather-fog",
    "weather-wind"
];
const TIME_BACKGROUND_CLASSES = [
    "time-morning",
    "time-day",
    "time-evening",
    "time-night"
];
const CITY_ALIASES = {
    "crimea": "Crimea",
    "крим": "Crimea",
    "kyiv": "Kyiv",
    "київ": "Kyiv",
    "киї": "Kyiv",
    "kiev": "Kyiv",
    "варшава": "Warsaw",
    "вар": "Warsaw",
    "warszawa": "Warsaw",
    "криків": "Krakow",
    "краків": "Krakow",
    "крак": "Krakow",
    "kraków": "Krakow",
    "lviv": "Lviv",
    "львів": "Lviv",
    "львов": "Lviv",
    "rzeszów": "Rzeszow",
    "ряшів": "Rzeszow",
    "ряш": "Rzeszow",
    "мюнхен": "Munich",
    "münchen": "Munich",
    "відень": "Vienna",
    "від": "Vienna",
    "wien": "Vienna"
};
const COUNTRY_ALIASES = {
    "ukraine": "Ukraine",
    "україна": "Ukraine",
    "ua": "Ukraine",
    "poland": "Poland",
    "polska": "Poland",
    "польща": "Poland",
    "germany": "Germany",
    "deutschland": "Germany",
    "німеччина": "Germany",
    "austria": "Austria",
    "österreich": "Austria",
    "австрія": "Austria",
    "france": "France",
    "франція": "France",
    "spain": "Spain",
    "españa": "Spain",
    "іспанія": "Spain",
    "italy": "Italy",
    "італія": "Italy",
    "united states": "United States",
    "usa": "United States",
    "us": "United States",
    "сша": "United States"
};
const COUNTRY_CODES = {
    Ukraine: "UA",
    Poland: "PL",
    Germany: "DE",
    Austria: "AT",
    France: "FR",
    Spain: "ES",
    Italy: "IT",
    "United States": "US"
};

// Small saved state, so refresh feels familiar.
let currentLanguage = localStorage.getItem("weatherAppLanguage") || "en";
let lastLocation = null;
let lastWeather = null;
let lastDailyForecast = null;
let lastCanSaveCity = true;
let currentWeatherState = "default";
let currentCity = null;
let suggestionsTimeout = null;
let weatherRequestId = 0;
let apiCooldownUntil = getSavedApiCooldown();
let isWeatherLoading = false;
let duckModeActive = false;
let duckClickTimeout = null;
const suggestionsCache = {};

// Text content
const translations = {
    en: {
        htmlLang: "en",
        dateLocale: "en-US",
        appSubtitle: "Check the weather, plan your day.",
        loaderText: "Loading weather app...",
        headline: "What's the weather like today?",
        subtitle: "Search for a city and get the latest weather.",
        cityLabel: "City name",
        cityPlaceholder: "Enter city or city, country...",
        searchButton: "Search",
        defaultCity: "Search for a city",
        defaultDate: "Allow location or enter a city name",
        defaultDescription: "Weather will appear here",
        localTime: "Local time",
        feelsLike: "Feels like",
        humidity: "Humidity",
        wind: "Wind",
        pressure: "Pressure",
        footer: "Created by Duck-Script",
        footerPrefix: "Created by",
        favoritesTitle: "Favorite cities",
        favoritesLimit: "Max 15",
        recentTitle: "Recent searches",
        recentLimit: "",
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
            tooManyRequests: "Too many weather requests. Please wait a minute and try again.",
            weatherServiceDown: "Weather service is temporarily unavailable. Please try again later."
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
        cityPlaceholder: "Wpisz miasto albo miasto, kraj...",
        searchButton: "Szukaj",
        defaultCity: "Wyszukaj miasto",
        defaultDate: "Zezwól na lokalizację albo wpisz miasto",
        defaultDescription: "Pogoda pojawi się tutaj",
        localTime: "Czas lokalny",
        feelsLike: "Odczuwalna",
        humidity: "Wilgotność",
        wind: "Wiatr",
        pressure: "Ciśnienie",
        footer: "Stworzone przez Duck-Script",
        footerPrefix: "Stworzone przez",
        favoritesTitle: "Ulubione miasta",
        favoritesLimit: "Max 15",
        recentTitle: "Ostatnie wyszukiwania",
        recentLimit: "",
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
            tooManyRequests: "Zbyt wiele zapytań o pogodę. Poczekaj minutę i spróbuj ponownie.",
            weatherServiceDown: "Serwis pogodowy jest tymczasowo niedostępny. Spróbuj ponownie później."
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
        cityPlaceholder: "Введи місто або місто, країну...",
        searchButton: "Пошук",
        defaultCity: "Знайди місто",
        defaultDate: "Дозволь геолокацію або введи місто",
        defaultDescription: "Погода з'явиться тут",
        localTime: "Місцевий час",
        feelsLike: "Відчувається",
        humidity: "Вологість",
        wind: "Вітер",
        pressure: "Тиск",
        footer: "Створено Duck-Script",
        footerPrefix: "Створено",
        favoritesTitle: "Улюблені міста",
        favoritesLimit: "Макс. 15",
        recentTitle: "Останні пошуки",
        recentLimit: "",
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
            tooManyRequests: "Забагато запитів погоди. Зачекай хвилину та спробуй ще раз.",
            weatherServiceDown: "Сервіс погоди тимчасово недоступний. Спробуй пізніше."
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
    },
    quack: {
        htmlLang: "en",
        dateLocale: "en-US",
        appSubtitle: "Check the pond, plan your waddle.",
        loaderText: "Loading duck weather...",
        headline: "What's the quack outside?",
        subtitle: "Search a pond-city and get the freshest quackcast.",
        cityLabel: "Duck city",
        cityPlaceholder: "Enter pond or pond, duckland...",
        searchButton: "Quack",
        defaultCity: "Find a duck pond",
        defaultDate: "Allow duck location or type a pond",
        defaultDescription: "Quackcast will appear here",
        localTime: "Pond time",
        feelsLike: "Feels ducky",
        humidity: "Pond mist",
        wind: "Waddle wind",
        pressure: "Beak pressure",
        footer: "Quacked by Duck-Script",
        footerPrefix: "Quacked by",
        favoritesTitle: "Favorite ponds",
        favoritesLimit: "Max 15 ponds",
        recentTitle: "Recent quacks",
        recentLimit: "",
        saveCity: "☆ Save pond",
        savedCity: "★ Pond saved",
        noFavorites: "No favorite ponds yet.",
        noRecentSearches: "No recent quacks yet.",
        noSuggestions: "No ponds found",
        yourLocation: "Your pond",
        forecastDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        forecastDates: ["May 19", "May 20", "May 21", "May 22", "May 23"],
        loadingCity: "Quacking...",
        loadingDescription: "Fetching duck weather...",
        weatherUnavailable: "Duck weather unavailable",
        loadingWeatherAlt: "Loading duck weather",
        weatherErrorAlt: "Duck weather error",
        errors: {
            emptyCity: "Please enter a pond-city.",
            cityNotLoaded: "Could not find this pond. Try another waddle.",
            cityNotFound: "Pond not found. Check the spelling.",
            weatherNotLoaded: "Could not load the quackcast. Please try again.",
            networkError: "Pond network error. Check your connection and try again.",
            tooManyRequests: "Too many quacks. Please wait a minute and try again.",
            weatherServiceDown: "The duck weather pond is busy. Please try again later."
        },
        weatherDescriptions: {
            clearSky: "Sunny duck sky",
            partlyCloudy: "Partly quacky",
            cloudy: "Cloudy pond mood",
            foggy: "Foggy feathers",
            drizzle: "Tiny duck rain",
            snow: "Frozen feathers",
            rainShowers: "Wet duck moment",
            thunderstorm: "Angry sky quack"
        }
    }
};
if (!translations[currentLanguage]) {
    currentLanguage = "en";
}

if (currentLanguage === "quack") {
    currentLanguage = "en";
}

// Events

applyLanguage();
renderFavorites();
renderRecentSearches();
updateAppClock();
initializeStartupWeather();

setInterval(updateAppClock, 60000);

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

    const city = normalizeCityInput(cityInput.value);

    searchWeatherByCity(city);
});

favoriteButton.addEventListener("click", () => {
    addFavoriteCity();
});

duckButton.addEventListener("click", () => {
    clearTimeout(duckClickTimeout);

    duckClickTimeout = setTimeout(() => {
        playDuckSound();
        pressDuckButton();
    }, 220);
});

duckButton.addEventListener("dblclick", () => {
    clearTimeout(duckClickTimeout);
    playDuckSound(2);
    pressDuckButton(true);
    activateDuckMode();
});

cityInput.addEventListener("input", () => {
    clearTimeout(suggestionsTimeout);

    const city = normalizeCityInput(cityInput.value);

    if (city.length < 3) {
        hideSuggestions();
        return;
    }

    suggestionsTimeout = setTimeout(() => {
        fetchCitySuggestions(city);
    }, 700);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-input-wrapper")) {
        hideSuggestions();
    }
});

// API

async function searchWeatherByCity(city) {
    const trimmedCity = normalizeCityInput(city);

    if (trimmedCity === "") {
        showError(getText().errors.emptyCity);
        return;
    }

    if (isWeatherLoading) {
        return;
    }

    if (isApiOnCooldown()) {
        showError(getText().errors.tooManyRequests);
        return;
    }

    hideSuggestions();
    showLoading();
    isWeatherLoading = true;

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
    } finally {
        if (isActiveWeatherRequest(requestId)) {
            isWeatherLoading = false;
            searchButton.disabled = false;
        }
    }
}

async function getCityLocation(city) {
    const parsedLocation = parseLocationInput(city);
    const searchQuery = getCitySearchQuery(parsedLocation.cityQuery);
    const countryQuery = normalizeCountryQuery(parsedLocation.countryQuery);
    const url = buildGeocodingUrl(searchQuery, countryQuery, 10);

    try {
        if (searchQuery === "") {
            throw new Error(getText().errors.cityNotFound);
        }

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

        return getBestCityMatch(data.results, searchQuery, countryQuery);
    } catch (error) {
        if (error.message === getText().errors.cityNotFound) {
            const fallbackLocation = getFallbackLocation(searchQuery, countryQuery);

            if (fallbackLocation) {
                return fallbackLocation;
            }
        }

        if (isNetworkError(error)) {
            startApiCooldown();
            throw new Error(getText().errors.networkError);
        }

        throw error;
    }
}

async function getWeatherData(latitude, longitude) {
    const currentValues = "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code,is_day";
    const dailyValues = "weather_code,temperature_2m_max,temperature_2m_min";
    // Current weather and forecast come from the same request.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentValues}&daily=${dailyValues}&forecast_days=5&timezone=auto`;

    try {
        if (isApiOnCooldown()) {
            throw new Error(getText().errors.tooManyRequests);
        }

        let response = await fetch(url);

        if (isRetryableWeatherServiceError(response.status)) {
            await wait(800);
            response = await fetch(url);
        }

        if (response.status === 429) {
            startApiCooldown();
            throw new Error(getText().errors.tooManyRequests);
        }

        if (isWeatherServiceError(response.status)) {
            throw new Error(getText().errors.weatherServiceDown);
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
            startApiCooldown();
            throw new Error(getText().errors.weatherServiceDown);
        }

        throw error;
    }
}

async function searchWeatherByCoordinates(latitude, longitude, displayName) {
    const location = await getLocationByCoordinates(latitude, longitude, displayName);
    const weatherData = await getWeatherData(latitude, longitude);

    renderWeather(location, weatherData.current, weatherData.daily, false);
    saveCachedWeather(location, weatherData.current, weatherData.daily, false);
}

// Rendering

function showLoading() {
    currentWeatherState = "loading";
    searchButton.disabled = true;
    setWeatherBackground();
    setTimeOfDayBackground();

    cityNameElement.textContent = getText().loadingCity;
    dateElement.textContent = "";
    localTimeElement.textContent = getLocalTimeText();
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
    setWeatherBackground();
    setTimeOfDayBackground();

    cityNameElement.textContent = getText().weatherUnavailable;
    dateElement.textContent = "";
    localTimeElement.textContent = getLocalTimeText();
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
    localTimeElement.textContent = getLocalTimeText(weather.time);
    temperatureElement.textContent = `${Math.round(weather.temperature_2m)}°C`;
    descriptionElement.textContent = weatherDescription;
    feelsLikeElement.textContent = `${Math.round(weather.apparent_temperature)}°C`;
    humidityElement.textContent = `${weather.relative_humidity_2m}%`;
    windSpeedElement.textContent = `${Math.round(weather.wind_speed_10m)} km/h`;
    pressureElement.textContent = `${Math.round(weather.pressure_msl)} hPa`;

    weatherIconElement.src = getWeatherIcon(weather.weather_code, isNight, weather.wind_speed_10m);
    weatherIconElement.alt = weatherDescription;
    setWeatherBackground(weather.weather_code, isNight, weather.wind_speed_10m);
    setTimeOfDayBackground(weather.time);
    renderForecast(dailyForecast);
    updateFavoriteButton();
}

// Helpers

function normalizeCityInput(city) {
    return String(city || "")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function parseLocationInput(input) {
    const originalInput = normalizeCityInput(input);
    const inputParts = originalInput.split(",");
    const cityQuery = normalizeCityInput(inputParts[0]);
    const countryQuery = normalizeCityInput(inputParts.slice(1).join(","));

    return {
        cityQuery,
        countryQuery,
        originalInput
    };
}

function getCitySearchQuery(city) {
    const normalizedCity = normalizeCityInput(city);
    const cityKey = normalizedCity.toLowerCase();

    return CITY_ALIASES[cityKey] || normalizedCity;
}

function normalizeCountryQuery(country) {
    const normalizedCountry = normalizeCityInput(country);
    const countryKey = normalizedCountry.toLowerCase();

    return COUNTRY_ALIASES[countryKey] || normalizedCountry;
}

function getCountryCode(country) {
    return COUNTRY_CODES[country] || "";
}

function buildGeocodingUrl(cityQuery, countryQuery, count = 10) {
    const language = getGeocodingLanguage();
    const countryCode = getCountryCode(countryQuery);
    let url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityQuery)}&count=${count}&language=${language}`;

    if (countryCode) {
        url += `&country_code=${countryCode}`;
    }

    return url;
}

function getBestCityMatch(results, cityQuery, countryQuery = "") {
    if (!results || results.length === 0) {
        throw new Error(getText().errors.cityNotFound);
    }

    const normalizedCityQuery = normalizeCityInput(cityQuery).toLowerCase();
    const normalizedCountryQuery = normalizeCountryQuery(countryQuery);
    const countryCode = getCountryCode(normalizedCountryQuery);
    let filteredResults = results;

    if (normalizedCountryQuery) {
        filteredResults = results.filter((city) => {
            return city.country === normalizedCountryQuery || city.country_code === countryCode;
        });

        if (filteredResults.length === 0) {
            throw new Error(getText().errors.cityNotFound);
        }
    }

    const exactMatch = filteredResults.find((city) => {
        return normalizeCityInput(city.name).toLowerCase() === normalizedCityQuery;
    });

    if (exactMatch) {
        return exactMatch;
    }

    const closeMatch = filteredResults.find((city) => {
        const cityName = normalizeCityInput(city.name).toLowerCase();

        return cityName.includes(normalizedCityQuery) || normalizedCityQuery.includes(cityName);
    });

    return closeMatch || filteredResults[0];
}

function getFallbackLocation(cityQuery, countryQuery) {
    const normalizedCity = getCitySearchQuery(cityQuery).toLowerCase();
    const normalizedCountry = normalizeCountryQuery(countryQuery);

    if (normalizedCity === "crimea" && normalizedCountry === "Ukraine") {
        return {
            name: "Crimea",
            country: "Ukraine",
            latitude: 45.35,
            longitude: 34.40
        };
    }

    return null;
}

function getGeocodingLanguage() {
    if (currentLanguage === "pl") {
        return "pl";
    }

    if (currentLanguage === "ua") {
        return "uk";
    }

    if (currentLanguage === "de") {
        return "de";
    }

    return "en";
}

function getText() {
    return translations[currentLanguage];
}

function updateAppClock() {
    if (!appClock) {
        return;
    }

    appClock.textContent = formatTime(new Date());
}

function formatTime(date) {
    if (!date || Number.isNaN(date.getTime())) {
        return "--:--";
    }

    return date.toLocaleTimeString(getText().dateLocale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function getLocalTimeText(weatherTime) {
    const localTime = weatherTime ? formatTime(new Date(weatherTime)) : "--:--";

    return `${getText().localTime}: ${localTime}`;
}

function isNetworkError(error) {
    return error instanceof TypeError || error.message === "Failed to fetch";
}

function isApiOnCooldown() {
    if (Date.now() < apiCooldownUntil) {
        return true;
    }

    localStorage.removeItem(API_COOLDOWN_KEY);
    return false;
}

function startApiCooldown(seconds = 60) {
    apiCooldownUntil = Date.now() + seconds * 1000;
    localStorage.setItem(API_COOLDOWN_KEY, String(apiCooldownUntil));
}

function isWeatherServiceError(status) {
    return status === 500 || status === 502 || status === 503 || status === 504;
}

function isRetryableWeatherServiceError(status) {
    return status === 502 || status === 503 || status === 504;
}

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function setWeatherBackground(weatherCode = null, isNight = false, windSpeed = 0) {
    let backgroundClass = "weather-default";

    document.body.classList.remove(...WEATHER_BACKGROUND_CLASSES);

    if (weatherCode === 0) {
        backgroundClass = isNight ? "weather-clear-night" : "weather-clear-day";
    } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
        backgroundClass = "weather-cloudy";
    } else if (weatherCode === 45 || weatherCode === 48) {
        backgroundClass = "weather-fog";
    } else if (
        weatherCode === 51 ||
        weatherCode === 53 ||
        weatherCode === 55 ||
        weatherCode === 56 ||
        weatherCode === 57 ||
        weatherCode === 61 ||
        weatherCode === 63 ||
        weatherCode === 65 ||
        weatherCode === 80 ||
        weatherCode === 81 ||
        weatherCode === 82
    ) {
        backgroundClass = "weather-rain";
    } else if (
        weatherCode === 66 ||
        weatherCode === 67 ||
        weatherCode === 71 ||
        weatherCode === 73 ||
        weatherCode === 75 ||
        weatherCode === 77 ||
        weatherCode === 85 ||
        weatherCode === 86
    ) {
        backgroundClass = "weather-snow";
    } else if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
        backgroundClass = "weather-thunderstorm";
    } else if (windSpeed >= STRONG_WIND_SPEED_KMH) {
        backgroundClass = "weather-wind";
    }

    document.body.classList.add(backgroundClass);
}

function setTimeOfDayBackground(weatherTime = null) {
    document.body.classList.remove(...TIME_BACKGROUND_CLASSES);

    if (!weatherTime) {
        return;
    }

    const weatherDate = new Date(weatherTime);

    if (Number.isNaN(weatherDate.getTime())) {
        return;
    }

    const hour = weatherDate.getHours();
    let timeClass = "time-day";

    if (hour >= 5 && hour < 10) {
        timeClass = "time-morning";
    } else if (hour >= 10 && hour < 17) {
        timeClass = "time-day";
    } else if (hour >= 17 && hour < 21) {
        timeClass = "time-evening";
    } else {
        timeClass = "time-night";
    }

    document.body.classList.add(timeClass);
}

function getSavedApiCooldown() {
    const savedCooldown = Number(localStorage.getItem(API_COOLDOWN_KEY));

    if (Number.isNaN(savedCooldown)) {
        return 0;
    }

    return savedCooldown;
}

function getCachedWeather() {
    try {
        const cachedWeather = JSON.parse(localStorage.getItem(LAST_WEATHER_KEY));

        if (
            !cachedWeather ||
            !cachedWeather.location ||
            !cachedWeather.current ||
            !cachedWeather.daily ||
            Date.now() - cachedWeather.timestamp > CACHE_MAX_AGE
        ) {
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
    if (currentLanguage === "pl") {
        return "pl";
    }

    if (currentLanguage === "ua") {
        return "uk";
    }

    return "en";
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

    setDefaultWeatherText();

    if (sessionStorage.getItem(STARTUP_DONE_KEY)) {
        return;
    }

    sessionStorage.setItem(STARTUP_DONE_KEY, "true");
    await tryLoadWeatherByGeolocation(getNextWeatherRequestId());
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

        showLoading();

        await searchWeatherByCoordinates(
            position.coords.latitude,
            position.coords.longitude,
            getText().yourLocation
        );

        return true;
    } catch (error) {
        if (isActiveWeatherRequest(startupRequestId)) {
            setDefaultWeatherText();
        }

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
    return false;
}

function applyLanguage() {
    const text = getText();

    document.documentElement.lang = text.htmlLang;
    languageSelect.value = currentLanguage;
    languageButton.textContent = currentLanguage.toUpperCase();
    updateAppClock();

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
    document.querySelector("#footer-prefix").textContent = text.footerPrefix;
    document.querySelector("#favorites-title").textContent = text.favoritesTitle;
    document.querySelector("#favorites-limit").textContent = text.favoritesLimit;
    document.querySelector("#recent-title").textContent = text.recentTitle;
    document.querySelector("#recent-limit").textContent = text.recentLimit;

    document.querySelectorAll("[data-language]").forEach((button) => {
        button.classList.toggle("active", button.dataset.language === currentLanguage);
        button.setAttribute("aria-selected", String(button.dataset.language === currentLanguage));
    });

    if (currentWeatherState === "default") {
        setDefaultWeatherText();
    } else if (currentWeatherState === "weather" && lastDailyForecast) {
        localTimeElement.textContent = getLocalTimeText(lastWeather ? lastWeather.time : null);
        renderForecast(lastDailyForecast);
    } else if (currentWeatherState === "loading" || currentWeatherState === "error") {
        localTimeElement.textContent = getLocalTimeText();
    }

    renderFavorites();
    renderRecentSearches();
    updateFavoriteButton();
}

function changeLanguage(language) {
    currentLanguage = language;

    if (currentLanguage !== "quack") {
        localStorage.setItem("weatherAppLanguage", currentLanguage);
        deactivateDuckMode();
    }

    applyLanguage();

    // Dates and descriptions need the new language too.
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

function playDuckSound(count = 1) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }

    const audioContext = new AudioContext();

    for (let i = 0; i < count; i++) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startTime = audioContext.currentTime + i * 0.18;

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(260, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, startTime + 0.12);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.13);
    }
}

function pressDuckButton(stronger = false) {
    const pressedClass = stronger ? "is-double-pressed" : "is-pressed";

    duckButton.classList.add(pressedClass);

    setTimeout(() => {
        duckButton.classList.remove(pressedClass);
    }, 180);
}

function activateDuckMode() {
    if (duckModeActive) {
        changeLanguage("quack");
        return;
    }

    duckModeActive = true;
    document.body.classList.add("duck-mode");
    addQuackLanguageOption();
    changeLanguage("quack");
}

function deactivateDuckMode() {
    if (!duckModeActive) {
        return;
    }

    duckModeActive = false;
    document.body.classList.remove("duck-mode");
    removeQuackLanguageOption();
}

function addQuackLanguageOption() {
    if (!languageSelect.querySelector('option[value="quack"]')) {
        const quackSelectOption = document.createElement("option");

        quackSelectOption.value = "quack";
        quackSelectOption.textContent = "Quack";
        languageSelect.append(quackSelectOption);
    }

    if (!languageOptions.querySelector('[data-language="quack"]')) {
        const quackButton = document.createElement("button");

        quackButton.type = "button";
        quackButton.dataset.language = "quack";
        quackButton.setAttribute("role", "option");
        quackButton.textContent = "🦆 Quack";
        quackButton.addEventListener("click", () => {
            changeLanguage("quack");
            closeLanguageMenu();
        });

        languageOptions.append(quackButton);
    }
}

function removeQuackLanguageOption() {
    const quackSelectOption = languageSelect.querySelector('option[value="quack"]');
    const quackButton = languageOptions.querySelector('[data-language="quack"]');

    if (quackSelectOption) {
        quackSelectOption.remove();
    }

    if (quackButton) {
        quackButton.remove();
    }
}

function getFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem("weatherAppFavorites")) || [];

        return favorites.slice(0, FAVORITES_LIMIT);
    } catch (error) {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem("weatherAppFavorites", JSON.stringify(favorites.slice(0, FAVORITES_LIMIT)));
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
        return;
    }

    if (favorites.length >= FAVORITES_LIMIT) {
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

    // Keep the newest search on top.
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
    const normalizedCity = normalizeCityInput(city);

    if (normalizedCity.length < 3) {
        hideSuggestions();
        return;
    }

    const parsedLocation = parseLocationInput(normalizedCity);
    const searchQuery = getCitySearchQuery(parsedLocation.cityQuery);
    const countryQuery = normalizeCountryQuery(parsedLocation.countryQuery);
    const language = getGeocodingLanguage();
    const query = `${language}:${searchQuery.toLowerCase()}:${countryQuery.toLowerCase()}`;

    if (searchQuery === "") {
        hideSuggestions();
        return;
    }

    if (isApiOnCooldown()) {
        hideSuggestions();
        showError(getText().errors.tooManyRequests);
        return;
    }

    if (suggestionsCache[query]) {
        renderCitySuggestions(suggestionsCache[query]);
        return;
    }

    const url = buildGeocodingUrl(searchQuery, countryQuery, 10);

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
        if (isNetworkError(error)) {
            startApiCooldown();
        }

        hideSuggestions();
    }
}

function renderCitySuggestions(cities) {
    citySuggestions.innerHTML = "";

    if (cities.length === 0) {
        citySuggestions.innerHTML = `<li class="city-suggestions__empty" role="option">${getText().noSuggestions}</li>`;
        citySuggestions.hidden = false;
        cityInput.setAttribute("aria-expanded", "true");
        return;
    }

    cities.forEach((city) => {
        const cityItem = document.createElement("li");
        const cityButton = document.createElement("button");
        const cityName = document.createElement("strong");
        const cityMeta = document.createElement("span");
        const cityDetails = [city.admin1, city.country].filter(Boolean).join(", ");

        cityItem.setAttribute("role", "option");
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
    cityInput.setAttribute("aria-expanded", "true");
}

function hideSuggestions() {
    citySuggestions.hidden = true;
    citySuggestions.innerHTML = "";
    cityInput.setAttribute("aria-expanded", "false");
}

function setDefaultWeatherText() {
    const text = getText();

    currentCity = null;
    searchButton.disabled = false;
    setWeatherBackground();
    setTimeOfDayBackground();
    cityNameElement.textContent = text.defaultCity;
    dateElement.textContent = text.defaultDate;
    localTimeElement.textContent = getLocalTimeText();
    temperatureElement.textContent = "--°C";
    descriptionElement.textContent = text.defaultDescription;
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
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

    // The cards stay in HTML; JS only fills in fresh data.
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

    // Noon keeps parsed API dates from slipping a day.
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
