let urlBase = "https://api.openweathermap.org/data/2.5/weather";
let urlForecast = "https://api.openweathermap.org/data/2.5/forecast";
let api_key = "750d8443a227b5e847d2c1e53af23b9d";
let geoNamesUser = "pelusa23";
const citySearch = document.getElementById("citySearch");
const suggestionsContainer = document.getElementById("suggestions");
let kelvinDegree = 273.15;
let selectedIndex = -1;
let suggestions = [];

let currentSearchId = 0; // Identificador de búsqueda


// --- Evento 'input' (Sugerencias) ---
citySearch.addEventListener("input", async () => {
    let query = citySearch.value.trim();

    if (query.length >= 2) {
        suggestionsContainer.style.display = "block";
        suggestionsContainer.classList.add("empty");
        await fetchCitySuggestions(query);
    } else {
        // Limpieza completa:
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = "none";
        suggestionsContainer.classList.remove("empty");
        suggestions = [];
        selectedIndex = -1;
    }
});

// --- Evento 'keydown' (Flechas y Enter) ---
citySearch.addEventListener("keydown", (e) => {
    let suggestionItems = document.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % suggestions.length;
        updateSelection(suggestionItems);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
        updateSelection(suggestionItems);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            citySearch.value = suggestions[selectedIndex].name;
            handleSearch(suggestions[selectedIndex].name); // Pasa el nombre
            suggestionsContainer.style.display = "none"; // Oculta
        } else {
            handleSearch(); // Llama a handleSearch sin argumentos
        }
    }
});

// --- Función fetchCitySuggestions (sin cambios) ---
async function fetchCitySuggestions(query) {
    try {
        let response = await fetch(`http://api.geonames.org/searchJSON?q=${query}&maxRows=5&username=${geoNamesUser}&lang=es`);
        let data = await response.json();

        if (data.geonames.length > 0) {
            suggestionsContainer.classList.remove("empty");
            displaySuggestions(data.geonames);
        } else {
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.classList.add("empty");
            suggestions = []; // Vacía
            selectedIndex = -1; // Resetea
        }
    } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
        suggestionsContainer.classList.add("empty");
    }
}

// --- Función displaySuggestions (sin cambios) ---
function displaySuggestions(cities) {
    suggestionsContainer.innerHTML = "";
    suggestions = cities;
    selectedIndex = -1; // Reinicia
    suggestionsContainer.classList.remove("empty");

    cities.forEach((city) => {
        let suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = `${city.name}, ${city.countryName}`;

        suggestion.addEventListener("pointerdown", () => {
            handleSearch(city.name); // Llama a handleSearch
            citySearch.value = "";
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.classList.add("empty");
            suggestions = [];
        });

        suggestionsContainer.appendChild(suggestion);
    });
}

// --- Función updateSelection (sin cambios) ---
function updateSelection(items) {
  if (suggestions.length === 0) return; // No hace nada si no hay

    items.forEach(item => item.classList.remove("selected"));

    if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].classList.add("selected");
        citySearch.value = suggestions[selectedIndex].name; // Actualiza
    }
}


// --- Evento click del botón (sin cambios) ---
document.addEventListener("pointerdown", (e) => { // Usa pointerdown
    if (!citySearch.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.classList.add("empty");
    }
});


// --- Función handleSearch (MODIFICADA) ---
function handleSearch(cityParam) {
    const cityInput = document.getElementById("citySearch");
    const city = cityParam || cityInput.value.trim();

    if (!city) {
        document.getElementById("backButton").style.display = "none";
        Toastify({
            text: "Por favor, ingrese una ciudad.",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "orange",
        }).showToast();
        return;
    }

    // Incrementa el ID de búsqueda *antes* de iniciar.
    currentSearchId++;
    const thisSearchId = currentSearchId; // Guarda el ID

    // Inicia el spinner.
    spinner = new Spinner(spinnerOpts).spin(document.getElementById("spinner-container"));
    document.getElementById("spinner-container").style.display = "flex";

    // Limpia y oculta sugerencias.
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.style.display = "none";
    suggestionsContainer.classList.add("empty");
    suggestions = [];
    selectedIndex = -1;

    // Oculta el botón "backButton".
    document.getElementById("backButton").style.display = "none";

    // Limpia *inmediatamente* los resultados anteriores.  ¡IMPORTANTE!
    document.getElementById("results").innerHTML = "";

    document.body.classList.add("results-active");
    cityInput.value = "";
    document.getElementById("card").style.display = "none"; // Oculta

    fetchCityData(city, thisSearchId); // Pasa la ciudad y el ID
}

// --- Evento para volver al inicio (sin cambios) ---
document.getElementById("backButton").addEventListener("click", () => {
    document.getElementById("resultsContainer").style.display = "none";
    document.body.classList.remove("results-active");
    document.getElementById("backButton").style.display = "none";
    document.getElementById("card").style.display = "block";
});

// --- Función fetchCityData (MODIFICADA) ---
/* async function fetchCityData(city, searchId) { // Recibe searchId
    try {
        suggestionsContainer.style.display = "none";
        suggestions = [];

        const response = await fetch(`${urlBase}?q=${city}&appid=${api_key}&lang=es`);

        if (!response.ok) {
            // Ya limpiamos en handleSearch, no es necesario aquí.
            document.getElementById("resultsContainer").style.display = "none";
            document.getElementById("card").style.display = "block";
            document.getElementById("backButton").style.display = "none";
            Toastify({
                text: "Ciudad no encontrada.<br>Por favor inténtalo nuevamente",
                duration: 2000,
                gravity: "top",
                position: "right",
                backgroundColor: "rgb(18, 91, 143, 0.7)",
                className: "multi-line-toast",
                escapeMarkup: false
            }).showToast();
            return;
        }
        const data = await response.json();

        // Detener el spinner (si existe)
        if (spinner) {
            spinner.stop();
            spinner = null;
            document.getElementById("spinner-container").style.display = "none";
        }

        // *** Comprueba si la búsqueda sigue siendo válida ***
        if (searchId !== currentSearchId) {
            return; // Ignora resultados de búsquedas antiguas
        }

        await showData(data, searchId); // Pasa searchId
        await fetchForecast(city, searchId); // Pasa searchId y city

        document.getElementById("resultsContainer").style.display = "flex"; // Muestra
        document.getElementById("card").style.display = "none";
        document.getElementById("backButton").style.display = "block";

    } catch (error) {
       // Detener el spinner en caso de error
        if (spinner) {
            spinner.stop();
            spinner = null;
            document.getElementById("spinner-container").style.display = "none";// Oculta
        }
        document.getElementById("card").style.display = "block";
        document.getElementById("backButton").style.display = "none";
        console.error("Error al obtener datos:", error);

        if (error instanceof TypeError && error.message === "Failed to fetch") {
            Toastify({
                text: "Error de red: No se pudo conectar con el servidor.",
                duration: 5000,
                gravity: "top",
                position: "right",
                backgroundColor: "red",
            }).showToast();
        } else {
            Toastify({
                text: `Error al obtener datos: ${error.message}`,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "red",
            }).showToast();
        }
    }
} */
    async function fetchCityData(city, searchId) {
        try {
            suggestionsContainer.style.display = "none";
            suggestions = [];
    
            const response = await fetch(`${urlBase}?q=${city}&appid=${api_key}&lang=es`);
    
            if (!response.ok) {
                  // Detener el spinner en caso de error
                if (spinner) {
                    spinner.stop();
                    spinner = null;
                    document.getElementById("spinner-container").style.display = "none";//Ocultar
                }
                // NO mostramos resultsContainer aquí: document.getElementById("resultsContainer").style.display = "none";
                document.getElementById("card").style.display = "block";
                document.getElementById("backButton").style.display = "none";
                Toastify({
                    text: "Ciudad no encontrada.<br>Por favor inténtalo nuevamente",
                    duration: 2000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "rgb(18, 91, 143, 0.7)",
                    className: "multi-line-toast",
                    escapeMarkup: false
                }).showToast();
                return;
            }
    
            const data = await response.json();
    
            // Detener y eliminar el spinner
            if (spinner) {
                spinner.stop();
                spinner = null;
                document.getElementById("spinner-container").style.display = "none"; //Ocultar contenedor
            }
    
            // *** Comprueba si la búsqueda sigue siendo válida ***
            if (searchId !== currentSearchId) {
                return; // Ignora resultados de búsquedas antiguas
            }
    
            await showData(data, searchId);
            await fetchForecast(city, searchId);
    
            // *AHORA SÍ* mostramos resultsContainer:
            document.getElementById("resultsContainer").style.display = "flex";
            document.getElementById("card").style.display = "none";
            document.getElementById("backButton").style.display = "block";
    
        } catch (error) {
              // Detener el spinner en caso de error
            if (spinner) {
                spinner.stop();
                spinner = null;
                document.getElementById("spinner-container").style.display = "none"; //Ocultar
            }
            document.getElementById("card").style.display = "block";
            document.getElementById("backButton").style.display = "none";
            console.error("Error al obtener datos:", error);
    
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                Toastify({
                    text: "Error de red: No se pudo conectar con el servidor.",
                    duration: 5000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "red",
                }).showToast();
            } else {
                Toastify({
                    text: `Error al obtener datos: ${error.message}`,
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    backgroundColor: "red",
                }).showToast();
            }
        }
    }

// --- Función showData (MODIFICADA) ---
async function showData(data, searchId) {
     // Comprueba si la búsqueda sigue siendo válida.
    if (searchId !== currentSearchId) {
        return;  // Ignora resultados de búsquedas antiguas
    }

    const results = document.getElementById("results");
    // No limpiamos aquí, ya se limpió en handleSearch.

    const cityName = data.name;
    const countryCode = data.sys.country;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const realFeels = data.main.feels_like;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const pressure = data.main.pressure;
    const tempMax = data.main.temp_max;
    const tempMin = data.main.temp_min;

    const countryName = await getCountryFullName(countryCode);

    const currentWeather = document.createElement("div");
    currentWeather.id = "currentWeather";

    const cityTitle = document.createElement("h2");
    cityTitle.textContent = `${cityName}, ${countryName}`;

    const tempData = document.createElement("p");
    tempData.textContent = `${Math.floor(temp - kelvinDegree)}°C`;
    tempData.id = "tempData";

    const iconData = document.createElement("img");
    iconData.src = `http://openweathermap.org/img/wn/${icon}@4x.png`;
    iconData.id = "iconData";

    const descriptionData = document.createElement("p");
    descriptionData.textContent = capFirstLetter(`${description}`);
    descriptionData.id = "descriptionData";

    const divsContainerWeather = document.createElement("div");
    divsContainerWeather.id = "divsContainerWeather"

    const divOneCurrentWeather = document.createElement("div")
    divOneCurrentWeather.id = "divOneCurrentWeather"

    const tempMaxMinData = document.createElement("p");
    tempMaxMinData.textContent = `Max ${Math.floor(tempMax - kelvinDegree)}°C | Min ${Math.floor(tempMin - kelvinDegree)}°C`;
    tempMaxMinData.id = "tempMaxMinData"

    const realFeelsData = document.createElement("p");
    realFeelsData.textContent = `Sensación térmica ${Math.floor(realFeels - kelvinDegree)}°C`

    const divTwoCurrentWeather = document.createElement("div")
    divTwoCurrentWeather.id = "divTwoCurrentWeather"

    const humidityData = document.createElement("p");
    humidityData.textContent = `Humedad ${humidity}%`;
    humidityData.id = "humidityData"

    const pressureData = document.createElement("p");
    pressureData.textContent = `Presión ${pressure}hPa`

    currentWeather.appendChild(cityTitle);
    currentWeather.appendChild(tempData);
    currentWeather.appendChild(iconData);
    currentWeather.appendChild(descriptionData);

    divOneCurrentWeather.appendChild(tempMaxMinData)
    divOneCurrentWeather.appendChild(realFeelsData)

    divTwoCurrentWeather.appendChild(humidityData)
    divTwoCurrentWeather.appendChild(pressureData)

    divsContainerWeather.appendChild(divOneCurrentWeather);
    divsContainerWeather.appendChild(divTwoCurrentWeather)

    results.appendChild(currentWeather);
    results.appendChild(divsContainerWeather)

    results.style.display = "flex"; // Asegura visibilidad

}

// --- Función fetchForecast (MODIFICADA) ---
function fetchForecast(city, searchId) {
    fetch(`${urlForecast}?q=${city}&appid=${api_key}&lang=es`)
        .then(data => data.json())
        .then(forecastData => {
            // *** Comprueba si la búsqueda sigue siendo válida ***
            if (searchId === currentSearchId) {
                showForecast(forecastData, searchId); // Pasa el searchId
            }
        });
}

// --- Función showForecast (MODIFICADA) ---
function showForecast(data, searchId) {
    // Comprueba si la búsqueda sigue siendo válida.
    if (searchId !== currentSearchId) {
        return; // Ignora resultados de búsquedas antiguas
    }

    const results = document.getElementById("results");

    // Ya no hace falta eliminar, se hace al inicio de la nueva búsqueda
    // let previousForecast = document.getElementById("forecastContainer");
    // if (previousForecast) {
    //     previousForecast.remove();
    // }

    const forecastContainer = document.createElement("div");
    forecastContainer.id = "forecastContainer";

    // Filtrar para obtener solo 4 días (cada 8 elementos, empezando por el primero)
    const fourDaysForecast = data.list.filter((forecast, index) => index % 8 === 0).slice(0, 4);

    fourDaysForecast.forEach((forecast) => {
        const forecastDate = new Date(forecast.dt * 1000);
        const dayOfWeek = capFirstLetter(forecastDate.toLocaleDateString("es-ES", { weekday: "long" }));
        const forecastDescription = capFirstLetter(forecast.weather[0].description);
        const forecastIcon = forecast.weather[0].icon;
        const forecastTempMin = Math.floor(forecast.main.temp_min - kelvinDegree);
        const forecastTempMax = Math.floor(forecast.main.temp_max - kelvinDegree);
        const forecastItem = document.createElement("div");
        forecastItem.id = "forecastItem";
        forecastItem.innerHTML = `
            <p id="forecastDay"><strong>${dayOfWeek}</strong></p>
            <p id="forecastMinMax"> ${forecastTempMax}° / ${forecastTempMin}°</p>
            <p id="forecastDescription">${forecastDescription}</p>
            <img src="http://openweathermap.org/img/wn/${forecastIcon}@4x.png" id="imgForecast">
        `;
        forecastContainer.appendChild(forecastItem);
    });

    results.appendChild(forecastContainer);
}

// Obtener el nombre completo del país (SIN CAMBIOS)
function getCountryFullName(countryCode) {
    return fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(response => response.json())
        .then(data => data[0]?.translations?.spa?.common || data[0]?.name?.common || countryCode)
        .catch(error => {
            console.error("Error obteniendo el nombre del país:", error);
            return countryCode;
        });
}

// Capitalizar la primera letra de una cadena (SIN CAMBIOS)
function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}