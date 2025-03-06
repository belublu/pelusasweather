let urlBase = "https://api.openweathermap.org/data/2.5/weather"
let urlForecast = "https://api.openweathermap.org/data/2.5/forecast"
let api_key = "750d8443a227b5e847d2c1e53af23b9d"
let geoNamesUser = "pelusa23"
const citySearch = document.getElementById("citySearch")
const suggestionsContainer = document.getElementById("suggestions")
let kelvinDegree = 273.15
let selectedIndex = -1 // Indice de la ciudad seleccionada
let suggestions = [] // Array de sugerencias de ciudades

// Evento para detectar cuando el usuario escribe en el input
citySearch.addEventListener("input", async () => {
    let query = citySearch.value.trim()
    if (query.length >= 2) {
        suggestionsContainer.style.display = "block"
        await fetchCitySuggestions(query)
    } else {
        suggestionsContainer.innerHTML = "";
        suggestionsContainer.style.display = "none"
    }
    if (suggestions.length > 0) {
        suggestionsContainer.style.display = "block";
    } else {
        suggestionsContainer.style.display = "none";
    }
})

// Función para obtener sugerencias de ciudades desde Geonames
async function fetchCitySuggestions(query) {
    try {
        let response = await fetch(`http://api.geonames.org/searchJSON?q=${query}&maxRows=5&username=${geoNamesUser}&lang=es`)
        let data = await response.json()
        console.log("Datos recibidos de Geonames: ", data)

        if (data.geonames.length > 0) {
            displaySuggestions(data.geonames)
        } else {
            suggestionsContainer.innerHTML = ""
        }
    } catch (error) {
        console.error("Error obteniendo sugerencias de ciudades:", error)
    }
}

// Función para mostrar las sugerencias
function displaySuggestions(cities) {
    suggestionsContainer.innerHTML = ""
    suggestions = cities // Guardo las sugerencias en el array
    selectedIndex = -1 // Reseteo el índice seleccionado

    cities.forEach((city) => {
        let suggestion = document.createElement("div")
        suggestion.classList.add("suggestion-item")
        suggestion.textContent = `${city.name}, ${city.countryName}`

        // Evento para seleccionarla ciudad y hacer la consulta
        suggestion.addEventListener("click", () => {
            fetchCityData(city.name)
            citySearch.value = "" // Limpia el input después de seleccionar una ciudad
            suggestionsContainer.innerHTML = ""
        })

        suggestionsContainer.appendChild(suggestion)
    })
}

// Evento del teclado para manejar las sugerencias con flechas
citySearch.addEventListener("keydown", (e) => {
    let suggestionItems = document.querySelectorAll(".suggestion-item")

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedIndex < suggestions.length - 1) {
            selectedIndex++;
        } else {
            selectedIndex = 0; // Vuelve al primer elemento si está en el último
        }
        updateSelection(suggestionItems);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedIndex > 0) {
            selectedIndex--;
        } else {
            selectedIndex = suggestions.length - 1; // Vuelve al último elemento si está en el primero
        }
        updateSelection(suggestionItems);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex > -1) {
            selectCity(suggestions[selectedIndex].name);
        }
    }

})

// Función para actualizar la selección de la ciudad
function updateSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add("selected")
            citySearch.value = item.textContent
        } else {
            item.classList.remove("selected")
        }
    })
}

// Función para seleccionar la ciudad
function selectCity(city) {
    fetchCityData(city)
    citySearch.value = ""
    suggestionsContainer.innerHTML = ""
    suggestionsContainer.style.display = "none"
}

// Evento para ocultar sugerencias cuando se hace click fuera del input
document.addEventListener("click", (e) => {
    if (!citySearch.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.innerHTML = ""
    }
})


/* document.getElementById("button").addEventListener("click", (e) => {
    const cityInput = document.getElementById("citySearch")
    const city = cityInput.value
    if (city) {
        fetchCityData(city)
        document.body.classList.add("results-active")
        cityInput.value = ""
        e.preventDefault()
    }
})

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const cityInput = document.getElementById("citySearch")
        const city = cityInput.value
        if (city) {
            fetchCityData(city)
            document.body.classList.add("results-active")
            cityInput.value = ""
            e.preventDefault()
        }
    }
}) */


document.getElementById("button").addEventListener("click", (e) => {
    e.preventDefault();
    handleSearch();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
    }
});

function handleSearch() {
    const cityInput = document.getElementById("citySearch");
    const city = cityInput.value.trim();

    if (city) {
        suggestionsContainer.innerHTML = ""; // 🔥 FORZAMOS LA LIMPIEZA 🔥
        suggestionsContainer.style.display = "none"; // 🔥 OCULTAMOS EL CONTENEDOR 🔥

        fetchCityData(city);
        document.body.classList.add("results-active");
        cityInput.value = "";
    }
}

/* async function fetchCityData(city) {
    try {
        const response = await fetch(`${urlBase}?q=${city}&appid=${api_key}&lang=es`)
        const data = await response.json()

        // Verifico si la ciudad existe
        if (data.cod !== 200) {
            document.getElementById("results").style.display = "none" // Oculto los resultados
            Swal.fire({
                title: "Ops!",
                text: "Ciudad no encontrada. Por favor inténtalo nuevamente",
                icon: "error",
                width: "200px",
                height: "200px"
            });
            return
        }

        // Si la ciudad existe, muestra los datos
        await showData(data)  // Espera a que showData termine antes de continuar
        await fetchForecast(city) // Ahora se ejecuta en orden
    } catch (error) {
        console.error("Error obteniendo datos de la ciudad:", error)
    }
} */

async function fetchCityData(city) {
    try {
        /* suggestionsContainer.innerHTML = ""
        suggestionsContainer.style.display = "none" */
        const response = await fetch(`${urlBase}?q=${city}&appid=${api_key}&lang=es`);

        // Verifica si la respuesta es válida
        if (!response.ok) {
            document.getElementById("results").style.display = "none"; // Oculto los resultados
            Toastify({
                text: "Ciudad no encontrada.<br>Por favor intentalo nuevamente",
                duration: 2000,
                gravity: "top",
                position: "right",
                backgroundColor: "rgb(18, 91, 143, 0.7)",

                className: "multi-line-toast",
                escapeMarkup: false // Permite que se interprete el HTML (incluyendo <br>),

            }).showToast();
            return;
        }

        const data = await response.json();

        // Si la ciudad existe, muestra los datos
        await showData(data);  // Espera a que showData termine antes de continuar
        await fetchForecast(city); // Ahora se ejecuta en orden
    } catch (error) {
        console.error("Error obteniendo datos de la ciudad:", error);
        Swal.fire({
            title: "Error",
            text: "Ocurrió un problema al obtener los datos. Por favor, intenta de nuevo.",
            icon: "error",
            width: "500px",
            heightAuto: false,
            padding: "5px"
        })
    }
}


function getCountryFullName(countryCode) {
    return fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`)
        .then(response => response.json())
        .then(data => data[0]?.translations?.spa?.common || data[0]?.name?.common || countryCode) // ?: Evita errores si alguna propiedad no existe. translations: contiene nombres en varios idiomas. spa: es el objeto que tiene los nombres en español. common: es el nombre común del país en español.
        .catch(error => {
            console.error("Error obteniendo el nombre del país:", error)
            return countryCode
        })
}

function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

async function showData(data) {
    console.log(data)
    const results = document.getElementById("results")
    results.innerHTML = ""

    const cityName = data.name
    const countryCode = data.sys.country
    const temp = data.main.temp
    const humidity = data.main.humidity
    const realFeels = data.main.feels_like
    const description = data.weather[0].description
    const icon = data.weather[0].icon
    const pressure = data.main.pressure
    const tempMax = data.main.temp_max
    const tempMin = data.main.temp_min

    /* const weatherContainer = document.createElement("div") */

    const countryName = await getCountryFullName(countryCode)

    const currentWeather = document.createElement("div")
    currentWeather.id = "currentWeather"

    const cityTitle = document.createElement("h2")
    cityTitle.textContent = `${cityName}, ${countryName}`

    const tempData = document.createElement("p")
    tempData.textContent = `${Math.floor(temp - kelvinDegree)}°C`
    tempData.id = "tempData"

    const iconData = document.createElement("img")
    iconData.src = `http://openweathermap.org/img/wn/${icon}@4x.png`
    iconData.id = "iconData"

    const descriptionData = document.createElement("p")
    descriptionData.textContent = capFirstLetter(`${description}`)
    descriptionData.id = "descriptionData"

    const divsContainerWeather = document.createElement("div")
    divsContainerWeather.id = "divsContainerWeather"

    const divOneCurrentWeather = document.createElement("div")
    divOneCurrentWeather.id = "divOneCurrentWeather"

    const tempMaxMinData = document.createElement("p")
    tempMaxMinData.textContent = `Max ${Math.floor(tempMax - kelvinDegree)}°C | Min ${Math.floor(tempMin - kelvinDegree)}°C`
    tempMaxMinData.id = "tempMaxMinData"

    const realFeelsData = document.createElement("p")
    realFeelsData.textContent = `Sensación térmica ${Math.floor(realFeels - kelvinDegree)}°C`

    const divTwoCurrentWeather = document.createElement("div")
    divTwoCurrentWeather.id = "divTwoCurrentWeather"

    const humidityData = document.createElement("p")
    humidityData.textContent = `Humedad ${humidity}%`
    humidityData.id = "humidityData"

    const pressureData = document.createElement("p")
    pressureData.textContent = `Presión ${pressure}hPa`

    currentWeather.appendChild(cityTitle);
    currentWeather.appendChild(tempData)
    currentWeather.appendChild(iconData)
    currentWeather.appendChild(descriptionData)

    divOneCurrentWeather.appendChild(tempMaxMinData)
    divOneCurrentWeather.appendChild(realFeelsData)

    divTwoCurrentWeather.appendChild(humidityData)
    divTwoCurrentWeather.appendChild(pressureData)

    divsContainerWeather.appendChild(divOneCurrentWeather)
    divsContainerWeather.appendChild(divTwoCurrentWeather)

    /* currentWeather.appendChild(tempMaxMinData)
    currentWeather.appendChild(realFeelsData)
    currentWeather.appendChild(humidityData)
    currentWeather.appendChild(pressureData) */

    results.appendChild(currentWeather)
    results.appendChild(divsContainerWeather)


    results.style.display = "flex"
}

function fetchForecast(city) {
    fetch(`${urlForecast}?q=${city}&appid=${api_key}&lang=es`)
        .then(data => data.json())
        .then(forecastData => showForecast(forecastData))
}
function showForecast(data) {
    const results = document.getElementById("results")

    // Elimina los datos anteriores
    let previousForecast = document.getElementById("forecastContainer")
    if (previousForecast) {
        previousForecast.remove()
    }

    const forecastContainer = document.createElement("div")
    forecastContainer.id = "forecastContainer"

    /*     const forecastTitle = document.createElement("h3")
        forecastTitle.textContent = "Pronóstico para los próximos 5 días"
        forecastTitle.id = "forecastTitle"
        forecastContainer.appendChild(forecastTitle) */

    // Acá se muestran los 5 días
    data.list.forEach((forecast, index) => {
        if (index % 8 === 0) {
            const forecastDate = new Date(forecast.dt * 1000)
            const dayOfWeek = capFirstLetter(forecastDate.toLocaleDateString("es-ES", { weekday: "long" }))
            const forecastDescription = capFirstLetter(forecast.weather[0].description)
            const forecastIcon = forecast.weather[0].icon
            const forecastTempMin = Math.floor(forecast.main.temp_min - kelvinDegree);
            const forecastTempMax = Math.floor(forecast.main.temp_max - kelvinDegree);
            const forecastItem = document.createElement("div")
            forecastItem.id = "forecastItem"
            forecastItem.innerHTML = `
                                <p id="forecastDay"><strong>${dayOfWeek}</strong></p>
                                <p id="forecastMinMax"> ${forecastTempMax}° / ${forecastTempMin}°</p>
                                <p id="forecastDescription">${forecastDescription}</p>
                                <img src="http://openweathermap.org/img/wn/${forecastIcon}@4x.png" id="imgForecast">
                                `
            forecastContainer.appendChild(forecastItem)
        }
    })

    results.appendChild(forecastContainer)

}

