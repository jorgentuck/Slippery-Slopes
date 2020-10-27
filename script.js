$(document).ready(function () {

    // Variables
    // resort array
    var skiResorts = ['snowbird'
        , 'alta'
        , 'brianhead'
        , 'brighton'
        , 'deer-valley'
        , 'parkcity'
        , 'solitude'
        , 'snowbasin'];
    // array to store API responses
    var resortObj = [];
    // lat and lon for the users location
    var userLat = 0;
    var userLon = 0;
    // bool to track initial loading for sorting
    var initLoad = true;
    // element variable for populating the DOM
    var cardEl = $('#cards');

    // Functions
    // calls the Liftie API and stores results
    function liftieAPI(arr) {
        for (var i = 0; i < arr.length; i++) {
            $.ajax({
                url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i],
                // url: "https://liftie.info/api/resort/" + arr[i],
                method: "GET",
            }).then(function (response) {
                // populate object and push to the array
                resortObj.push({
                    name: response.name,
                    lat: response.ll[1],
                    lon: response.ll[0],
                    weather: {
                        conditions: response.weather.conditions,
                        updateDate: response.weather.date,
                        text: response.weather.text
                    },
                    lifts: {
                        open: response.lifts.open,
                        closed: response.lifts.closed,
                        liftStatus: response.lifts.status
                    }
                })
            });
        }
    };

    // function to reorder the objects an array based on name
    function compareName(a, b) {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        let comparison = 0;
        if (nameA > nameB) {
            comparison = 1;
        } else if (nameA < nameB) {
            comparison = -1;
        }
        return comparison;
    };

    // function to reorder the objects an array based on distance
    function compareDistance(a, b) {
        const distanceA = a.distanceValue;
        const distanceB = b.distanceValue;

        let comparison = 0;
        if (distanceA > distanceB) {
            comparison = 1;
        } else if (distanceA < distanceB) {
            comparison = -1;
        }
        return comparison;
    };

    // Google directions API call
    function directionsAPI(arr) {
        initLoad = false;
        var apiKey = config.googleAPI;
        for (var i = 0; i < arr.length; i++) {
            var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + resortObj[i].lat + ',' + resortObj[i].lon + '&departure_time=now&key=' + apiKey
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].lat.toString().slice(0, 5) === response.routes[0].legs[0].end_location.lat.toString().slice(0, 5) && arr[j].lon.toString().slice(0, 5) === response.routes[0].legs[0].end_location.lng.toString().slice(0, 5)) {
                        resortObj[j].destinationlat = response.routes[0].legs[0].end_location.lat;
                        resortObj[j].destinationlon = response.routes[0].legs[0].end_location.lng;
                        resortObj[j].distanceText = response.routes[0].legs[0].distance.text;
                        resortObj[j].distanceValue = response.routes[0].legs[0].distance.value;
                        resortObj[j].durationText = response.routes[0].legs[0].duration.text;
                        resortObj[j].durationValue = response.routes[0].legs[0].duration.value;
                        resortObj[j].trafficText = response.routes[0].legs[0].duration_in_traffic.text;
                        resortObj[j].trafficValue = response.routes[0].legs[0].duration_in_traffic.value;
                    } else {
                        // console.log(response.routes[0].legs[0].end_location.lat);
                    }
                }
                console.log(response);
            });
        }
    };

    // function to get users location
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
    };

    // set users location to global variables and trigger the Google directions API call function
    function setPosition(position) {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        directionsAPI(resortObj);
    };

    // function to display resort stats
    function resortStats() {
        for(var i = 0; i < resortObj.length; i++){
            var id = $('[data-name="' + resortObj[i].name + '"]').attr('id');
            id = id.substring(3, id.length);
            $('#drop' + id).text(resortObj[i].lifts.liftStatus);
            console.log('object: ' + JSON.stringify(resortObj[i].lifts.liftStatus));
        }
    };

    // color duration based on traffic
    function traffic() {
        for(var i = 0; i < resortObj.length; i++){
            if(parseInt(resortObj[i].trafficValue) < (parseInt(resortObj[i].durationValue) + 50)){
                $('[data-name="' + resortObj[i].name + '"]').addClass('text-success')
            }
        }
    };

    // what to do when all running ajax calls finish
    $(document).ajaxStop(function () {
        if (initLoad) {
            resortObj.sort(compareName)
            for (var i = 0; i < resortObj.length; i++) {
                $('#btn' + (i + 1)).text((resortObj[i].name.toString())).attr('data-name',resortObj[i].name);
            }
        } else {
            resortObj.sort(compareDistance)
            for (var i = 0; i < resortObj.length; i++) {
                $('#btn' + (i + 1)).text((resortObj[i].name.toString() + ' - ' + resortObj[i].trafficText.toString())).attr('data-name',resortObj[i].name);
                traffic();
            }
        }
        resortStats();
    });

    // click events
    // search by location button click
    $('.loc-link').on('click', function (event) {
        // cardEl.removeClass('d-none');
        getLocation();
    });


    // runs after the page loads
    liftieAPI(skiResorts);

});