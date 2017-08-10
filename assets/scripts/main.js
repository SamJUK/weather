var cities = [];
var isDark = false;

// When the page loads
$(function(){

    // Load previous preferences
    loadPreferences();

    // If the browser does not support GEO Location hide the option
    if (!doesBrowserSupportGEOLocation())
        $('#myLocation').hide();

    // Hide the selector
    $('#selector').hide();

    // Populate places dropdown
    getPlaces();

    // Hide errors until we need it
    $('#errors').hide();

});

function locationSelector()
{
    // Reset value any old values
    $('#placeSelector').val("");

    // Hide the buttons
    $('#buttons').hide();
    $('#selector').show();

}

function getPlaces()
{
    ajaxGet('./assets/datasets/cities.json', data => {
        cities = JSON.parse(data);
        populateDataList();
    });
}

function populateDataList()
{
    var html = '';
    var inc = 0;
    cities.forEach( city => {
        html += `
        <option value='${city.city}, ${city.country}'
            data-id='${inc}'
            data-lng='${city.lng}'
            data-lat='${city.lat}'
            data-city='${city.city}'
            data-country='${city.country}'>
        `;
        inc++;
    });
    $('#placesDataList').html(html);
}

function locationSelected()
{
    var option = $("#placesDataList option[value='" + $('#placeSelector').val() + "']");
    var coords = {
        "lng": option.attr('data-lng'),
        "lat": option.attr('data-lat')
    };
    loadWeather(coords.lat + ', ' + coords.lng);
}



function ajaxGet(page, callback)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            callback(this.responseText);
        }
    };
    xhttp.open("GET", page, true);
    xhttp.send();
}

function doesBrowserSupportGEOLocation()
{
    if ('geolocation' in navigator)
        return true;
    return false;
}

function getUsersLocation()
{
    navigator.geolocation.getCurrentPosition( pos => {
        loadWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
    });
}

function loadWeather(location, woeid)
{
    // Save to variable so we can use at a later time
    saveLocation(location);

    $.simpleWeather({
        location: location,
        woeid: woeid,
        unit: 'c',
        success: function(weather) {
            console.log(weather);

            // Set Location Name
            var locName = weather.city + ', ' + weather.country;
            $('#locationName').text(locName);

            // Set Icon
            var classname = getWeatherIcon(weather.currently);
            $('#conditionIcon').attr('class', classname)
            console.log('Weather: ' + weather.currently);

            // Set Condition
            $('#condition').text(weather.text);
            
            // Set Temperature
            var temp = weather.temp + '°c';
            $('#temp').text(temp);

            var daclass = 'fa fa-long-arrow-up dir-'+weather.wind.direction.toLowerCase();
            $('#directionArrow').attr('class', daclass);

            // Wind direction text
            $('#directionText').text(weather.wind.direction);
            
            // Wind Speed
            var spd = Math.round(weather.wind.speed);
            $('#windSpeed').text(spd);

            // Wind Speed Unit
            var spdU = "km/h";
            $('#windUnit').text(spdU);

            // Fade out location selector
            setTimeout(()=>{
                $('#locationSelector').fadeOut(500);
            },100);
        },
        error: function(error) {
            displayError(error);
            document.cookie = "loc=";
        }
    });
};

function backToLocSel()
{
    $('#locationSelector').show();
    $('#selector').hide();
    $('#buttons').show();
}

function toggleLocationSelector(state)
{
    if ($('#locationSelector').is(':visible'))
        $('#locationSelector').fadeOut(500);
    else
        $('#locationSelector').fadeIn(500);
}

function loadPreferences()
{
    // Theme
    var themeValue = document.cookie.replace(/(?:(?:^|.*;\s*)theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (themeValue == "dark")
    {
        $('body').addClass("dark");
        isDark = true;
    };

    // Location
    var locationValue = document.cookie.replace(/(?:(?:^|.*;\s*)loc\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (locationValue != "")
    {
        loadWeather(locationValue);
    };
}

function saveLocation(coords)
{
    document.cookie = "loc="+coords;
}

function toggleLight()
{
    if (!isDark)
    {
        $('body').addClass("dark");
        document.cookie = "theme=dark";
        isDark = true;
    }else{
        $('body').removeClass("dark");
        document.cookie = "theme=light";
        isDark = false;
    }
}


function getWeatherIcon(currently)
{
    switch (currently.toLowerCase()) {
        case "cloudy":
            return "wi wi-day-cloudy";

        case "mostly cloudy":
            return "wi wi-day-cloudy";

        case "partly cloudy":
            return "wi wi-day-cloudy";
    
        case "mostly sunny":
            return "wi wi-day-sunny";

        case "mostly clear":
            return "wi wi-day-sunny";

        case "sunny":
            return "wi wi-day-sunny";

        default:
            return "fa fa-question";
    }
}

function displayError(errorText)
{
    var inc = $('#errors').children().length;
    var e = `<span id="error${inc}">${errorText}</span>`;
    $('#errors').append(e).fadeIn(1000);

    if (!$('#errors').is(':visible'))
        $('#errors').fadeIn(500);

    setTimeout( i => {
        $(`#error${i}`).remove();
        if($('#errors').children().length == 0)
            $('#errors').hide();
    }, 3000, inc);
}

function reselectLocation()
{
    // Unhide the buttons needed
    $('#buttons').show();
    $('#selector').hide();

    $('#locationSelector').fadeIn(1000);
}