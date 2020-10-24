$(document).ready(function () {

    var skiResorts = ['snowbird'
        , 'alta'
        , 'brianhead'
        , 'brighton'
        , 'deer-valley'
        , 'parkcity'
        , 'solitude'];

    var userLat = 0;
    var userLon = 0;
    var lat = 0;
    var lon = 0;
    var index = 0;
    var resortObj = [];
    // var resortObj2 = [{

    // }];

    function liftieTest(arr) {


        for (var i = 0; i < arr.length; i++) {
            console.log(i);
            $.ajax({
                url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i],
                method: "GET"
            }).then(function (response) {
                

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
                // console.log(resortObj[index].name);
                // console.log(index + " - 7 7 times");
                mapsTest(index);
                index++;
            });
            // console.log(resortObj);
        }
    };






    function mapsTest(i) {
        var apiKey = secrets.GOOGLE_API_KEY;
        
        var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + lat + ',' + lon + '&key=' + apiKey

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            resortObj[i].destinationlat = response.routes[0].legs[0].end_location.lat;
            resortObj[i].destinationlon = response.routes[0].legs[0].end_location.lng;
            resortObj[i].distanceText = response.routes[0].legs[0].distance.text;
            resortObj[i].distanceValue = response.routes[0].legs[0].distance.value;
            resortObj[i].durationText = response.routes[0].legs[0].duration.text;
            resortObj[i].durationValue = response.routes[0].legs[0].duration.value;
            if(i === skiResorts.length - 1) {

            }
        });
        console.log(resortObj);
    };

    // mapsTest();




    // function liftieTest(){

    // $.ajax({
    //     url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/brighton",
    //     method: "GET"
    // }).then(function(response) {
    //       console.log(response);
    // });
    // };

    // liftieTest();




    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition);
        }
    }

    function setPosition(position) {
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
        liftieTest(skiResorts);
    }
    getLocation();

});