// --- Variables Globales ---
const urlBase = "https://api.openweathermap.org/data/2.5/weather";
const urlForecast = "https://api.openweathermap.org/data/2.5/forecast";
const api_key = "750d8443a227b5e847d2c1e53af23b9d"; // Reemplaza con tu API KEY de OpenWeatherMap
const citySearch = document.getElementById("citySearch");
const suggestionsContainer = document.getElementById("suggestions");
const kelvinDegree = 273.15;
let selectedIndex = -1;
let suggestions = [];
let currentSearchId = 0; // Identificador de búsqueda

const geoapifyKey = "167bd6a4fc984f3ab6a8c36f62e7dde6"; // <---  ¡ASEGÚRATE DE PONER TU CLAVE AQUÍ!

// --- Evento 'input' (Sugerencias) con Debouncing ---
let debounceTimer;
citySearch.addEventListener("input", () => {
    clearTimeout(debounceTimer); // Cancela cualquier temporizador anterior
    debounceTimer = setTimeout(async () => {
        let query = citySearch.value.trim(); // Obtiene el valor y elimina espacios

        if (query.length >= 2) { // Solo busca si hay al menos 2 caracteres
            suggestionsContainer.style.display = "block"; // Muestra el contenedor
            suggestionsContainer.classList.add("empty");  //Clase para que el css funcione bien
            await fetchCitySuggestions(query); // Llama a la función para obtener sugerencias
        } else {
            // Limpia las sugerencias si la entrada es menor a 2 caracteres
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.style.display = "none";
            suggestionsContainer.classList.remove("empty");
            suggestions = [];
            selectedIndex = -1;
        }
    }, 300); // Espera 300ms después de la última pulsación de tecla
});

// --- Evento 'keydown' (Flechas y Enter) ---
citySearch.addEventListener("keydown", (e) => {
    let suggestionItems = document.querySelectorAll(".suggestion-item"); //Obtiene los items

    if (e.key === "ArrowDown") {
        e.preventDefault(); // Evita el comportamiento predeterminado
        selectedIndex = (selectedIndex + 1) % suggestions.length; // Avanza al siguiente
        updateSelection(suggestionItems); // Actualiza la selección visual
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length; // Retrocede
        updateSelection(suggestionItems);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            citySearch.value = suggestions[selectedIndex].properties.formatted; // Usamos formatted de Geoapify
            handleSearch(); // Realiza la búsqueda
            suggestionsContainer.style.display = "none"; // Oculta sugerencias
        } else {
            handleSearch(); // Realiza busqueda
        }
    }
});

// --- Función fetchCitySuggestions (Geoapify) ---
async function fetchCitySuggestions(query) {
    try {
        // URL de la API de Geoapify, construida correctamente.
        const url = "https://api.geoapify.com/v1/geocode/autocomplete?text=" + encodeURIComponent(query) + "&apiKey=" + geoapifyKey + "&limit=5&lang=es";
        const response = await fetch(url);

        // Verificar el estado de la respuesta ANTES de intentar parsear JSON
        if (!response.ok) {
            throw new Error(`Error de Geoapify: ${response.status} - ${response.statusText}`); // Lanza un error más descriptivo
        }

        const data = await response.json(); // Parsea la respuesta como JSON

        //Si hay data y si data.features tiene longitud mayor a 0
        if (data.features && data.features.length > 0) {
            suggestionsContainer.classList.remove("empty");
            displaySuggestionsGeoapify(data.features); // Llama a la función para mostrar
        } else {
            // Limpia si no hay resultados
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.classList.add("empty");
            suggestions = [];
            selectedIndex = -1;
        }
    } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
        suggestionsContainer.classList.add("empty");
        // Considera mostrar un mensaje de error al usuario aquí, si es apropiado.
    }
}

// --- Función displaySuggestions (Geoapify) ---
function displaySuggestionsGeoapify(places) {
    suggestionsContainer.innerHTML = ""; // Limpia resultados anteriores
    suggestions = places; // Actualiza la lista global de sugerencias
    selectedIndex = -1; // Restablece la selección
    suggestionsContainer.classList.remove("empty");

    places.forEach((place) => {
        let suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item"); // Agrega la clase CSS
        suggestion.textContent = place.properties.formatted; // Usa 'formatted'

        suggestion.addEventListener("click", () => {
            handleSearch(); //Llama a la funcion handleSearch.
            citySearch.value = ""; // Limpia la entrada
            suggestionsContainer.innerHTML = ""; // Limpia las sugerencias
            suggestionsContainer.classList.add("empty");
            suggestions = []; // Limpia
        });

        suggestionsContainer.appendChild(suggestion); // Agrega la sugerencia al contenedor
    });
}

// --- Función updateSelection (Adaptada para Geoapify) ---
function updateSelection(items) {
    if (suggestions.length === 0) return; // No hace nada si no hay sugerencias

    items.forEach(item => item.classList.remove("selected")); // Quita la clase 'selected'

    if (selectedIndex >= 0 && selectedIndex < items.length) {
        items[selectedIndex].classList.add("selected"); // Agrega la clase al seleccionado
        // Actualiza el valor del input con la sugerencia seleccionada
        citySearch.value = suggestions[selectedIndex].properties.formatted;
    }
}

// --- Evento click del botón (sin cambios) ---
document.getElementById("button").addEventListener("click", (e) => {
    e.preventDefault(); // Evita el envío del formulario
    handleSearch(); // Llama a la función
});

// --- Función handleSearch ---
function handleSearch() {
    const cityInput = document.getElementById("citySearch");
    const city = cityInput.value.trim(); // Obtiene la ciudad

    if (!city) {
        document.getElementById("backButton").style.display = "none";
        Toastify({ // Muestra una notificación si no hay entrada
            text: "Por favor, ingrese una ciudad.",
            duration: 3000,
            gravity: "top",
            position: "right",
            stylebackground: "blue",
        }).showToast();
        return;
    }

    // --- Gestión del ID de búsqueda ---
    currentSearchId++;       // Incrementa el ID ANTES de la petición
    const thisSearchId = currentSearchId; // Guarda el ID actual

    // --- Iniciar el Spinner ---
    spinner = new Spinner(spinnerOpts).spin(document.getElementById("spinner-container"));
    document.getElementById("spinner-container").style.display = "flex"; //Mostrar contenedor

    // --- Limpiar y ocultar sugerencias ---
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.style.display = "none";
    suggestionsContainer.classList.add("empty");
    suggestions = [];
    selectedIndex = -1;

    //Ocultar boton de back
    document.getElementById("backButton").style.display = "none";

    // --- Limpiar resultados anteriores *INMEDIATAMENTE* ---
    document.getElementById("results").innerHTML = "";

    // --- Cambios visuales ---
    document.body.classList.add("results-active");
    cityInput.value = "";
    document.getElementById("card").style.display = "none";

    // --- Llamar a la función para obtener datos ---
    fetchCityData(city, thisSearchId); // Pasa la ciudad y el ID
}

// --- Evento para volver al inicio (sin cambios) ---
document.getElementById("backButton").addEventListener("click", () => {
    document.getElementById("resultsContainer").style.display = "none"; // Oculta resultados
    document.body.classList.remove("results-active");              // Restaura estilos
    document.getElementById("backButton").style.display = "none"; //Oculta
    document.getElementById("card").style.display = "block";     //Muestra el card
});

// --- Función fetchCityData (Geoapify + OpenWeatherMap) ---
async function fetchCityData(city, searchId) {
    try {
        suggestionsContainer.style.display = "none"; //Ocultamos las suggestions
        suggestions = []; // Limpia las sugerencias

        // --- 1. Obtener coordenadas de Geoapify ---
        const geocodingUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${geoapifyKey}&lang=es`; const geocodingResponse = await fetch(geocodingUrl);

        // Verificar el estado de la respuesta de Geoapify
        if (!geocodingResponse.ok) {
            throw new Error(`Error de Geoapify en fetchCityData: ${geocodingResponse.status} - ${geocodingResponse.statusText}`);
        }

        const geocodingData = await geocodingResponse.json();

        if (!geocodingData.features || geocodingData.features.length === 0) {
            handleGeocodingError(); // Llama a la función en caso de no encontrar la ciudad
            return;
        }

        //Geoapify retorna [longitud, latitud]
        const location = geocodingData.features[0].geometry.coordinates;
        const longitude = location[0];
        const latitude = location[1];


        // --- 2. Obtener datos del clima de OpenWeatherMap ---
        const response = await fetch(urlBase + "?lat=" + latitude + "&lon=" + longitude + "&appid=" + api_key + "&lang=es");
        // Verificar el estado de la respuesta de OpenWeatherMap
        if (!response.ok) {
            handleGeocodingError();
            return;
        }

        const data = await response.json(); // Parsea la respuesta

        // --- Detener el Spinner (si existe) ---
        if (spinner) {
            spinner.stop();
            spinner = null;
            document.getElementById("spinner-container").style.display = "none";//Ocultar
        }

        // --- Comprobar si la búsqueda sigue siendo válida ---
        if (searchId !== currentSearchId) {
            return; // Si no es válida, abandona
        }

        // --- Mostrar datos (OpenWeatherMap) ---
        await showData(data, searchId);
        await fetchForecast(latitude, longitude, searchId); // Pasa lat/lon

        // --- Mostrar resultados ---
        document.getElementById("resultsContainer").style.display = "flex";
        document.getElementById("card").style.display = "none"; // Oculta input
        document.getElementById("backButton").style.display = "block"; //Muestra

    } catch (error) {
        handleGeocodingError(error); // Manejo de errores
    }
}

// --- Función showData (OpenWeatherMap - sin cambios importantes) ---
async function showData(data, searchId) {
    // Comprueba si la búsqueda sigue siendo válida
    if (searchId !== currentSearchId) {
        return;
    }

    const results = document.getElementById("results");
    // Los resultados ya se limpiaron en handleSearch

    //Datos que necesito de la API
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

    results.style.display = "flex"; // Asegura la visibilidad
}

// --- Función fetchForecast (OpenWeatherMap - adaptada) ---
function fetchForecast(latitude, longitude, searchId) {
    //Usa la latitud y longitud
    fetch(urlForecast + "?lat=" + latitude + "&lon=" + longitude + "&appid=" + api_key + "&lang=es")
        .then(data => data.json()) // Parsea como JSON
        .then(forecastData => {
            // Comprueba si la búsqueda sigue siendo válida
            if (searchId === currentSearchId) {
                showForecast(forecastData, searchId);  // Muestra el pronóstico
            }
        });
}

// --- Función showForecast (OpenWeatherMap - sin cambios importantes) ---
function showForecast(data, searchId) {
    // Verifica la búsqueda actual.
    if (searchId !== currentSearchId) {
        return;
    }
    const results = document.getElementById("results");

    const forecastContainer = document.createElement("div");
    forecastContainer.id = "forecastContainer";

    // Filtra para 4 días (cada 8 elementos)
    const fourDaysForecast = data.list.filter((forecast, index) => index % 8 === 0).slice(0, 4);

    fourDaysForecast.forEach((forecast) => {
        //Formateo de datos
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
            return countryCode; // Devuelve el código si hay error
        });
}

// Capitalizar la primera letra de una cadena (SIN CAMBIOS)
function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


// --- Función para manejar errores de geocodificación (Geoapify y OpenWeatherMap) ---
function handleGeocodingError(error) {
    if (spinner) {
        spinner.stop();
        spinner = null;
        document.getElementById("spinner-container").style.display = "none";
    }
    document.getElementById("card").style.display = "block"; // Muestra el formulario
    document.getElementById("backButton").style.display = "none"; // Oculta el botón

    let errorMessage = "Ciudad no encontrada. Por favor, inténtalo nuevamente.";

    if (error) { // Si hay un objeto de error
        console.error("Error al obtener datos:", error);
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            errorMessage = "Error de red: No se pudo conectar con el servidor.";
        } else if (error.message) { //Si tiene mensaje
            errorMessage = `Error al obtener datos: ${error.message}`;
        }
    }

    Toastify({ //Muestra mensaje
        text: errorMessage,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "blue",
        className: "multi-line-toast", //  Para saltos de línea
        escapeMarkup: false, // Permite HTML (para <br>)
    }).showToast();
}