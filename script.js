$(document).ready(function () {

    var skiResorts = ['snowbird'
        , 'alta'
        , 'brianhead'
        , 'brighton'
        , 'deer-valley'
        , 'parkcity'
        , 'solitude'
        , 'snowbasin'];

    var userLat = 0;
    var userLon = 0;
    var lat = 0;
    var lon = 0;
    var index = 0;
    var mapIndex = 0;
    var resortObj = [];

    var cardEl = $('#cards');


    function liftieTest(arr) {


        for (var i = 0; i < arr.length; i++) {
            console.log(i);
            $.ajax({
                url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i],
                method: "GET"
            }).then(function (response) {

                console.log(response.name);
                lat = response.ll[1];
                lon = response.ll[0];
                // push object into array
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
                console.log(resortObj[index].name);
               
                index++;
                
            });
        }
    };


    $(document).ajaxStop(function () {
        console.log('finished')
        console.log(resortObj);
        resortObj.sort(compareName)
        for (var i = 0; i < resortObj.length; i++) {
            $('#btn' + (i + 1)).text((resortObj[i].name.toString()));
        }
        console.log(resortObj);
    });

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
    }



    function mapsTest(arr) {
        // var apiKey = secrets.GOOGLE_API_KEY;
        var apiKey = 'AIzaSyCRq16GUXPHn6KxkuSR0X811OTyPaJQ4c0';
        var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + lat + ',' + lon + '&key=' + apiKey

        for (var i = 0; i < arr.length; i++) {
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {

                resortObj[mapIndex].destinationlat = response.routes[0].legs[0].end_location.lat;
                resortObj[mapIndex].destinationlon = response.routes[0].legs[0].end_location.lng;
                resortObj[mapIndex].distanceText = response.routes[0].legs[0].distance.text;
                resortObj[mapIndex].distanceValue = response.routes[0].legs[0].distance.value;
                resortObj[mapIndex].durationText = response.routes[0].legs[0].duration.text;
                resortObj[mapIndex].durationValue = response.routes[0].legs[0].duration.value;

                mapIndex++
                if (i === skiResorts.length - 1) {

                }
            });
        }
    };





    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
    }

    function setPosition(position) {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        mapsTest(resortObj);
    }

    $('.loc-link').on('click', function (event) {
        cardEl.removeClass('d-none');
        getLocation();
    })
    liftieTest(skiResorts);

});