const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_img = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');

const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');

// Maps Open-Meteo's WMO weather codes to a simple category + description
function mapWeatherCode(code) {
    if (code === 0) return { main: 'Clear', description: 'clear sky' };
    if ([1, 2, 3].includes(code)) return { main: 'Clouds', description: 'cloudy' };
    if ([45, 48].includes(code)) return { main: 'Mist', description: 'mist / fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Rain', description: 'drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Rain', description: 'rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', description: 'snow' };
    if ([95, 96, 99].includes(code)) return { main: 'Rain', description: 'thunderstorm' };
    return { main: 'Clouds', description: 'cloudy' };
}

async function getCoordinates(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoData = await fetch(geoUrl).then(res => res.json());

    if (!geoData.results || geoData.results.length === 0) {
        return null;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    return { latitude, longitude, name, country };
}

async function checkWeather(city) {
    if (!city || city.trim() === "") return;

    try {
        const location = await getCoordinates(city);

        if (!location) {
            location_not_found.style.display = "flex";
            weather_body.style.display = "none";
            console.log("error: location not found");
            return;
        }

        const { latitude, longitude } = location;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

        const weatherData = await fetch(weatherUrl).then(res => res.json());

        if (!weatherData.current) {
            location_not_found.style.display = "flex";
            weather_body.style.display = "none";
            console.log("error: no current weather data");
            return;
        }

        console.log("run");
        location_not_found.style.display = "none";
        weather_body.style.display = "flex";

        const current = weatherData.current;
        const { main, description: desc } = mapWeatherCode(current.weather_code);

        temperature.innerHTML = `${Math.round(current.temperature_2m)}°C`;
        description.innerHTML = desc;
        humidity.innerHTML = `${current.relative_humidity_2m}%`;
        wind_speed.innerHTML = `${current.wind_speed_10m}Km/H`;

        switch (main) {
            case 'Clouds':
                weather_img.src = "/assets/cloud.png";
                break;
            case 'Clear':
                weather_img.src = "/assets/clear.png";
                break;
            case 'Rain':
                weather_img.src = "/assets/rain.png";
                break;
            case 'Mist':
                weather_img.src = "/assets/mist.png";
                break;
            case 'Snow':
                weather_img.src = "/assets/snow.png";
                break;
        }

        console.log(weatherData);

    } catch (err) {
        console.error("Weather fetch failed:", err);
        location_not_found.style.display = "flex";
        weather_body.style.display = "none";
    }
}

searchBtn.addEventListener('click', () => {
    checkWeather(inputBox.value);
});

inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkWeather(inputBox.value);
    }
});