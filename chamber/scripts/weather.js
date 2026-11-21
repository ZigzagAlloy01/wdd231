const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast?latitude=31.73&longitude=-106.48&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FCiudad_Juarez&forecast_days=12&temperature_unit=celsius&wind_speed_unit=kmh";

const currentWeatherContainer = document.querySelector("#current-weather");
const forecastContainer = document.querySelector("#weather-forecast");

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

const createWeatherElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

const getWeatherDescription = (weatherCode) => weatherDescriptions[weatherCode] ?? "Weather conditions unavailable";

const getWeatherSymbol = (weatherCode) => {
    if (weatherCode === 0) return "☀️";
    if (weatherCode === 1) return "🌤️";
    if (weatherCode === 2) return "⛅";
    if (weatherCode === 3) return "☁️";
    if (weatherCode === 45 || weatherCode === 48) return "🌫️";
    if (weatherCode >= 51 && weatherCode <= 57) return "🌦️";
    if (weatherCode >= 61 && weatherCode <= 67) return "🌧️";
    if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) return "❄️";
    if (weatherCode >= 80 && weatherCode <= 82) return "🌧️";
    if (weatherCode >= 95) return "⛈️";
    return "☁️";
};

const formatLocalTime = (dateTime) => {
    const timePart = dateTime.split("T")[1];
    const [hours, minutes] = timePart.split(":").map(Number);
    const localTime = new Date(2000, 0, 1, hours, minutes);
    return localTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
};

const formatDayName = (dateString) => {
    const date = new Date(`${dateString}T12:00:00Z`);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    });
};

const renderCurrentWeather = (weather) => {
    const current = weather.current;
    const weatherCode = current.weather_code;

    const icon = createWeatherElement("span", "weather-symbol", getWeatherSymbol(weatherCode));
    icon.setAttribute("aria-hidden", "true");

    const temperature = createWeatherElement("p", "weather-temperature", `${Math.round(current.temperature_2m)}°C`);
    const main = createWeatherElement("div", "weather-current-main");
    main.append(icon, temperature);

    const details = createWeatherElement("div", "weather-current-details");
    details.append(
        createWeatherElement("p", "weather-description", getWeatherDescription(weatherCode)),
        createWeatherElement("p", "weather-location", "Ciudad Juárez, Chihuahua"),
        createWeatherElement("p", "weather-feels-like", `Humidity: ${Math.round(current.relative_humidity_2m)}%`),
        createWeatherElement("p", "weather-feels-like", `Wind: ${Math.round(current.wind_speed_10m)} km/h`)
    );

    const updated = createWeatherElement(
        "p",
        "weather-updated",
        `Updated ${formatLocalTime(current.time)} local time`
    );

    currentWeatherContainer.replaceChildren(main, details, updated);
};

const getForecastDays = (weather) => {
    const currentDate = weather.current.time.split("T")[0];
    const daily = weather.daily;

    return daily.time
        .map((date, index) => ({
            date,
            weatherCode: daily.weather_code[index],
            high: daily.temperature_2m_max[index],
            low: daily.temperature_2m_min[index],
            precipitationProbability: daily.precipitation_probability_max[index]
        }))
        .filter((day) => day.date > currentDate)
        .slice(0, 3);
};

const renderForecast = (weather) => {
    const days = getForecastDays(weather);
    forecastContainer.replaceChildren();

    if (days.length !== 3 || days.some((day) => day.high === null || day.low === null)) {
        throw new Error("The three-day temperature forecast is incomplete.");
    }

    days.forEach((day) => {
        const card = createWeatherElement("article", "forecast-day");
        const heading = createWeatherElement("h4", "forecast-day-name", formatDayName(day.date));
        const symbol = createWeatherElement("span", "forecast-symbol", getWeatherSymbol(day.weatherCode));
        symbol.setAttribute("aria-hidden", "true");

        const description = createWeatherElement("p", "forecast-description", getWeatherDescription(day.weatherCode));
        const high = createWeatherElement("p", "forecast-temperature", `${Math.round(day.high)}°C high`);
        const low = createWeatherElement("p", "forecast-range", `${Math.round(day.low)}°C low`);
        const precipitation = day.precipitationProbability === null
            ? null
            : createWeatherElement("p", "forecast-range", `Precipitation: ${Math.round(day.precipitationProbability)}%`);

        card.append(heading, symbol, description, high, low);
        if (precipitation) card.append(precipitation);
        forecastContainer.append(card);
    });
};

const showWeatherError = (error) => {
    console.error("Weather loading error:", error);
    currentWeatherContainer.replaceChildren(
        createWeatherElement("p", "weather-error", "Live weather is unavailable right now. Please try again later.")
    );
    forecastContainer.replaceChildren(
        createWeatherElement("p", "weather-error", "The three-day forecast could not be loaded.")
    );
};

const loadWeather = async () => {
    try {
        const response = await fetch(WEATHER_API_URL);
        if (!response.ok) {
            throw new Error(`Open-Meteo request failed with status ${response.status}.`);
        }

        const weather = await response.json();
        if (!weather.current || !weather.daily || !Array.isArray(weather.daily.time)) {
            throw new Error("The weather API returned an unexpected response.");
        }

        renderCurrentWeather(weather);
        renderForecast(weather);
    } catch (error) {
        showWeatherError(error);
    }
};

loadWeather();
