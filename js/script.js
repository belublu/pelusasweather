let urlBase = "https://api.openweathermap.org/data/2.5/weather"
let urlForecast = "https://api.openweathermap.org/data/2.5/forecast"
let api_key = "750d8443a227b5e847d2c1e53af23b9d"
let kelvinDegree = 273.15

document.getElementById("button").addEventListener("click", () => {
    const cityInput = document.getElementById("citySearch")
    const city = cityInput.value
    if (city) {
        fetchCityData(city)
        document.body.classList.add("results-active")
        cityInput.value = ""
        e.preventDefault()
    }
})

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const cityInput = document.getElementById("citySearch")
        const city = cityInput.value
        if (city) {
            fetchCityData(city)
            document.body.classList.add("results-active")
            cityInput.value = ""
            e.preventDefault()
        }
    }

})

async function fetchCityData(city) {
    try {
        const response = await fetch(`${urlBase}?q=${city}&appid=${api_key}&lang=es`)
        const data = await response.json()

        // Verifico si la ciudad existe
        if (data.cod !== 200) {
            document.getElementById("results").style.display = "none" // Oculto los resultados
            alert("Ciudad no encontrada. Por favor intenta con otra.")
            return
        }

        // Si la ciudad existe, muestra los datos
        await showData(data)  // Espera a que showData termine antes de continuar
        await fetchForecast(city) // Ahora se ejecuta en orden
    } catch (error) {
        console.error("Error obteniendo datos de la ciudad:", error)
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
            const forecastTemp = Math.floor(forecast.main.temp - kelvinDegree)
            const forecastDescription = capFirstLetter(forecast.weather[0].description)
            const forecastIcon = forecast.weather[0].icon

            const forecastItem = document.createElement("div")
            forecastItem.id = "forecastItem"
            forecastItem.innerHTML = `
                                <p id="forecastDay"><strong>${dayOfWeek}</strong></p>
                                <p id="forecastTemp"><strong>${forecastTemp}°</strong></p>
                                <p id="forecastDescription">${forecastDescription}</p>
                                <img src="http://openweathermap.org/img/wn/${forecastIcon}@4x.png" id="imgForecast">
                                `
            forecastContainer.appendChild(forecastItem)
        }
    })

    results.appendChild(forecastContainer)

}

