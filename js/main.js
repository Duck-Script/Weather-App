// Switching between light and dark themes

const themeSwitch = document.querySelector("#switch");

themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark-theme", themeSwitch.checked);
});

// ---

// DOM 
const searchForm = document.querySelector(".search-container");
const cityInput = document.querySelector("#city-input");

const cityNameElement = document.querySelector("#city-name");
const dateElement = document.querySelector("#date");
const temperatureElement = document.querySelector("#temperature");
const descriptionElement = document.querySelector("#description");
const weatherIconElement = document.querySelector("#current-weather-icon");

const feelsLikeElement = document.querySelector("#feels-like");
const humidityElement = document.querySelector("#humidity");
const windSpeedElement = document.querySelector("#wind-speed");
const pressureElement = document.querySelector("#pressure");

// ---

// Event listeners

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        return;
    }

    showLoading();

    try {
        const location = await getCityLocation(city);
        const weather = await getCurrentWeather(location.latitude, location.longitude);

        renderWeather(location, weather);
    } catch (error) {
        showError(error.message);
    }
});

// ---

// API functions

async function getCityLocation(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not find this city. Please try again.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please check the spelling.");
    }

    return data.results[0];
}

async function getCurrentWeather(latitude, longitude) {
    const currentValues = "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,pressure_msl,weather_code";
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentValues}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not load weather data. Please try again.");
    }

    const data = await response.json();

    return data.current;
}

// ---

// Render functions

function showLoading() {
    cityNameElement.textContent = "Loading...";
    dateElement.textContent = "";
    temperatureElement.textContent = "--°C";
    descriptionElement.textContent = "Getting current weather...";
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
    weatherIconElement.src = "";
    weatherIconElement.alt = "";
}

function showError(message) {
    cityNameElement.textContent = "Weather unavailable";
    dateElement.textContent = "";
    temperatureElement.textContent = "--°C";
    descriptionElement.textContent = message;
    feelsLikeElement.textContent = "--°C";
    humidityElement.textContent = "--%";
    windSpeedElement.textContent = "-- km/h";
    pressureElement.textContent = "-- hPa";
    weatherIconElement.src = "";
    weatherIconElement.alt = "";
}

function renderWeather(location, weather) {
    const weatherDescription = getWeatherDescription(weather.weather_code);

    cityNameElement.textContent = location.name;
    dateElement.textContent = new Date(weather.time).toLocaleDateString("en-US", {
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

    weatherIconElement.src = getWeatherIcon(weather.weather_code);
    weatherIconElement.alt = weatherDescription;
}

// ---

// Helper functions

function getWeatherDescription(weatherCode) {
    if (weatherCode === 0) {
        return "Clear sky";
    } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
        return "Partly cloudy";
    } else if (weatherCode === 45 || weatherCode === 48) {
        return "Foggy";
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        return "Drizzle";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        return "Snow";
    } else if (weatherCode >= 80 && weatherCode <= 82) {
        return "Rain showers";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        return "Thunderstorm";
    } else {
        return "Cloudy";
    }
}

function getWeatherIcon(weatherCode) {
    if (weatherCode === 0) {
        return "https://openweathermap.org/img/wn/01d@2x.png";
    } else if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
        return "https://openweathermap.org/img/wn/02d@2x.png";
    } else if (weatherCode === 45 || weatherCode === 48) {
        return "https://openweathermap.org/img/wn/50d@2x.png";
    } else if (weatherCode >= 51 && weatherCode <= 67) {
        return "https://openweathermap.org/img/wn/09d@2x.png";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
        return "https://openweathermap.org/img/wn/13d@2x.png";
    } else if (weatherCode >= 80 && weatherCode <= 82) {
        return "https://openweathermap.org/img/wn/10d@2x.png";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        return "https://openweathermap.org/img/wn/11d@2x.png";
    } else {
        return "https://openweathermap.org/img/wn/03d@2x.png";
    }
}
