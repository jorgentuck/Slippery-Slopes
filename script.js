$(document).ready(function () {

    // Variables
    // resort array
    var skiResorts = JSON.parse(localStorage.getItem("resorts")) || [{
        name: 'snowbird',
        favorite: false
    }
        , {
        name: 'alta',
        favorite: false
    }
        , {
        name: 'brianhead',
        favorite: false
    }
        , {
        name: 'brighton',
        favorite: false
    }
        , {
        name: 'deer-valley',
        favorite: false
    }
        , {
        name: 'parkcity',
        favorite: false
    }
        , {
        name: 'solitude',
        favorite: false
    }
        , {
        name: 'snowbasin',
        favorite: false
    }];
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
                url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i].name,
                // url: "https://liftie.info/api/resort/" + arr[i].name,
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
        for (var i = 0; i < resortObj.length; i++) {
            var id = $('[data-name="' + resortObj[i].name + '"]').attr('id');
            id = id.substring(3, id.length);
            var resortId = [{
                name:resortObj[i].name,
                id: id
            }];
            var table = $('#table' + id);
            // $('#drop' + id).text(resortObj[i].lifts.liftStatus[0]);
            $.each(resortObj[i].lifts.liftStatus, function (key, value) {
                // console.log(key + ' is ' + value);
                table.after('<tr><td>' + key + '</td><td>' + value + '</td></tr>')
            });
            console.log(table);
            // $('#status' + id).html(status + end);
        }
    };

    // color duration based on traffic
    function traffic() {
        for (var i = 0; i < resortObj.length; i++) {
            if (parseInt(resortObj[i].trafficValue) < (parseInt(resortObj[i].durationValue) * 1.1)) {
                $('[data-name="' + resortObj[i].name + '"]').addClass('text-success')
            } else if (parseInt(resortObj[i].trafficValue) < (parseInt(resortObj[i].durationValue) * 1.25)) {
                $('[data-name="' + resortObj[i].name + '"]').addClass('text-warning')
            } else {
                $('[data-name="' + resortObj[i].name + '"]').addClass('text-danger')
            }
        }
    };

    // update favorites in the array and save to local storage
    function fav(name, fav) {
        if (fav) {
            for (var i = 0; i < skiResorts.length; i++) {
                if (name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                    skiResorts[i].favorite = true;
                }
            }
            // remove from local storage so we don't have more than one entry
            localStorage.removeItem("resorts");
            // re save updated array to local storage
            localStorage.setItem("resorts", JSON.stringify(skiResorts));
        } else {
            for (var i = 0; i < skiResorts.length; i++) {
                if (name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                    skiResorts[i].favorite = false;
                }
            }
            // remove from local storage so we don't have more than one entry
            localStorage.removeItem("resorts");
            // re save updated array to local storage
            localStorage.setItem("resorts", JSON.stringify(skiResorts));
        }
    };

    // what to do when all running ajax calls finish
    $(document).ajaxStop(function () {
        if (initLoad) {
            resortObj.sort(compareName)
            for (var i = 0; i < resortObj.length; i++) {
                $('#btn' + (i + 1)).attr('data-name', resortObj[i].name).html('<button class="btn-outline-secondary favorite text-dark mr-3" data-state="false" data-fav="' + resortObj[i].name + '" id="favorite' + (i + 1) + '">&hearts;</button>' + resortObj[i].name.toString() + '<img id="' + resortObj[i].name + 'Icon" class="float-right" src="assets\\' + resortObj[i].name + '.png"height="25">');
            }
        } else {
            resortObj.sort(compareDistance)
            for (var i = 0; i < resortObj.length; i++) {
                $('#btn' + (i + 1)).attr('data-name', resortObj[i].name).html('<button class="btn-outline-secondary favorite text-dark mr-3" data-state="false" data-fav="' + resortObj[i].name + '" id="favorite' + (i + 1) + '">&hearts;</button>' + resortObj[i].name.toString() + ' - ' + resortObj[i].trafficText.toString() + '<img id="' + resortObj[i].name + 'Icon" class="float-right" src="assets\\' + resortObj[i].name + '.png"height="25">');
                traffic();
            }
        }
        for (var j = 0; j < skiResorts.length; j++) {
            if (skiResorts[j].favorite) {
                for (var k = 0; k < resortObj.length; k++) {
                    if (skiResorts[j].name.slice(-4).toLowerCase() === resortObj[k].name.slice(-4).toLowerCase()) {
                        $('[data-fav="' + resortObj[k].name + '"]').removeClass('text-dark').addClass('text-danger active');
                    }
                }
            }
        }
        resortStats();
    });

    // click events
    // search by location button click
    $('#search').on('click', function (event) {
        // cardEl.removeClass('d-none');
        getLocation();
    });

    $('.dropdown').on('click', '.favorite', function (event) {
        event.stopPropagation();
        if ($(this).attr('data-state') === 'false') {
            $(this).removeClass('text-dark').addClass('text-danger active').attr('data-state', 'true');
            var name = $(this).attr('data-fav');
            fav(name, true);
        } else {
            $(this).addClass('text-dark').removeClass('text-danger active').attr('data-state', 'false');
            var name = $(this).attr('data-fav');
            fav(name, false);
        }
    })

    // runs after the page loads
    liftieAPI(skiResorts);

});