$(document).ready(function () {

    // Variables
    // resort array to hold resort names specifically formatted for the liftie api call and favorite information
    // if there is nothing in local storage we will load the defaults.
    // future delevopment includes validating what we get from local storage - further down the line I would like to make this more dynamic
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
    // array to hold API responses for favorite resorts
    var favArr = [];
    // lat and lon for the users location
    var userLat = 0;
    var userLon = 0;
    // bool to track initial loading for sorting
    var initLoad = true;

    // Functions
    // Initial function to seperate resort data into 2 arrays based on the favorite bool
    function init() {
        // loop through all resorts
        for (var i = 0; i < skiResorts.length; i++) {
            // if they are marked as a favorite
            if (skiResorts[i].favorite) {
                // loop through the resortObj array
                for (var j = 0; j < resortObj.length; j++) {
                    // if the resorts match
                    if (resortObj[j].name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                        // update bool to true
                        resortObj[j].favorite = true;
                        // add to the favArr
                        favArr.push(resortObj[j]);
                        // remove from the resrtObj array
                        resortObj.splice(j, 1);
                    }
                }
            }
        }
    };
    // calls the Liftie API and stores results
    function liftieAPI(arr) {
        // loop through the array provided to make the API calls
        for (var i = 0; i < arr.length; i++) {
            $.ajax({
                // url for local testing to avoid cors errors
                url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i].name,
                // url for live
                // url: "https://liftie.info/api/resort/" + arr[i].name,
                method: "GET",
            }).then(function (response) {
                // populate object and push to the array
                resortObj.push({
                    // resort name
                    name: response.name,
                    // resort latitude
                    lat: response.ll[1],
                    // resort longitude
                    lon: response.ll[0],
                    weather: {
                        // weather conditions - for future development
                        conditions: response.weather.conditions,
                        // date weather was updated
                        updateDate: response.weather.date,
                        // weather conditions in text format
                        text: response.weather.text
                    },
                    lifts: {
                        // open ski lifts - for future development
                        open: response.lifts.open,
                        // closed ski lifts - for future development
                        closed: response.lifts.closed,
                        // all ski lifts with statuses
                        liftStatus: response.lifts.status
                    },
                    // set favortie bool to false
                    favorite: false
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
        const distanceA = a.trafficValue;
        const distanceB = b.trafficValue;

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
        // update bool to false for rendering purposes
        initLoad = false;
        // key in a git ignore file - needs to be added when this goes live
        var apiKey = config.googleAPI;
        // loop through the array provided to make the API calls
        for (var i = 0; i < arr.length; i++) {
            // url for local testing to avoid cors errors
            var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + arr[i].lat + ',' + arr[i].lon + '&departure_time=now&key=' + apiKey
            // url for live
            // var queryURL = 'https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + resortObj[i].lat + ',' + resortObj[i].lon + '&departure_time=now&key=' + apiKey

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                for (var j = 0; j < arr.length; j++) {
                    // loop through called array to get location match
                    if (arr[j].lat.toString().slice(0, 5) === response.routes[0].legs[0].end_location.lat.toString().slice(0, 5) && arr[j].lon.toString().slice(0, 5) === response.routes[0].legs[0].end_location.lng.toString().slice(0, 5)) {
                        // resort latitude
                        arr[j].destinationlat = response.routes[0].legs[0].end_location.lat;
                        // resort longitude
                        arr[j].destinationlon = response.routes[0].legs[0].end_location.lng;
                        // distance to resort in text format - for future development
                        arr[j].distanceText = response.routes[0].legs[0].distance.text;
                        // distance to resort as a value - for future development
                        arr[j].distanceValue = response.routes[0].legs[0].distance.value;
                        // time to resort in text format - for future development
                        arr[j].durationText = response.routes[0].legs[0].duration.text;
                        // time to resort as a value - for future development
                        arr[j].durationValue = response.routes[0].legs[0].duration.value;
                        // time with traffic to resort in text format - used for displaying times
                        arr[j].trafficText = response.routes[0].legs[0].duration_in_traffic.text;
                        // time with traffic to resort as a value - used for sorting
                        arr[j].trafficValue = response.routes[0].legs[0].duration_in_traffic.value;
                    }
                }
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
        directionsAPI(favArr);
        directionsAPI(resortObj);
    };

    // function to display resort stats
    function resortStats(arr) {
        // loop through provided array
        for (var i = 0; i < arr.length; i++) {
            // get id number by name
            var id = $('[data-name="' + arr[i].name + '"]').attr('id');
            // strip the "Btn" text from the id so we only have a number
            id = id.substring(3, id.length);
            // target the table element that matches the ID
            var table = $('#table' + id);
            // target the weather conditions element that matches the ID
            var weatherConditions = $('#conditions' + id);
            // target the weather update date element that matches the ID
            var weatherUpdate = $('#update' + id);
            // for each of the lift statuses populate to the table previously targeted
            $.each(arr[i].lifts.liftStatus, function (key, value) {
                table.after('<tr><td>' + key + '</td><td>' + value + '</td></tr>')
            });
            // populate weather conditions to the DOM
            weatherConditions.text('Conditions: ' + arr[i].weather.conditions);
            // populate weather update date to the DOM
            weatherUpdate.text('Last Updated: ' + arr[i].weather.updateDate);
        }
    };

    // color duration based on traffic
    function traffic(arr) {
        // loop through the provided array to compare time with traffic to the normal duration
        for (var i = 0; i < arr.length; i++) {
            // time with traffic vs normal duration + 10% set text color to green
            if (parseInt(arr[i].trafficValue) < (parseInt(arr[i].durationValue) * 1.1)) {
                $('[data-name="' + arr[i].name + '"]').addClass('text-success')
                // time with traffic vs normal duration + 25% set text color to yellow
            } else if (parseInt(arr[i].trafficValue) < (parseInt(arr[i].durationValue) * 1.25)) {
                $('[data-name="' + arr[i].name + '"]').addClass('text-warning')
                // time with traffic > normal duration + 25% set text color to red
            } else {
                $('[data-name="' + arr[i].name + '"]').addClass('text-danger')
            }
        }
    };

    // update favorites in the array and save to local storage
    function fav(name, fav) {
        // if favorite is true
        if (fav) {
            // loop through the skiResorts array
            for (var i = 0; i < skiResorts.length; i++) {
                // if the last 4 chars of the name match
                if (name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                    // set favorite to true
                    skiResorts[i].favorite = true;
                    // loop through the resortObj array
                    for (var j = 0; j < resortObj.length; j++) {
                        // if the last 4 chars of the name match
                        if (resortObj[j].name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                            // set favorite to true
                            resortObj[j].favorite = true;
                            // add object to favArr
                            favArr.push(resortObj[j]);
                            // remove object from the resortObj array
                            resortObj.splice(j, 1);
                        }
                    }
                }
            }
            // remove from local storage so we don't have more than one entry
            localStorage.removeItem("resorts");
            // re save updated array to local storage
            localStorage.setItem("resorts", JSON.stringify(skiResorts));
        } else {
            // loop through the skiResorts array
            for (var i = 0; i < skiResorts.length; i++) {
                // if the last 4 chars of the name match
                if (name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                    // set favorite to false
                    skiResorts[i].favorite = false;
                    // loop through the favArr array
                    for (var j = 0; j < favArr.length; j++) {
                        // if the last 4 chars of the name match
                        if (favArr[j].name.slice(-4).toLowerCase() === skiResorts[i].name.slice(-4).toLowerCase()) {
                            // set favorite to false
                            favArr[j].favorite = false;
                            // add object to resortObj
                            resortObj.push(favArr[j]);
                            // remove object from the favArr array
                            favArr.splice(j, 1);
                        }
                    }
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
        // timeout is for testing because of the way the CORs anywhere proxy triggers the ajaxStop before it is actually complete - remove for live site
        setTimeout(function () {
            // call init function
            init();
            // if this is the first loading of the page
            if (initLoad) {
                // sort the favArr by name alphabetically
                favArr.sort(compareName);
                // sort the resortObj by name alphabetically
                resortObj.sort(compareName);
                // after sorting combine the arrays with favorites first
                var arry = favArr.concat(resortObj);
                // loop through the combined array
                for (var i = 0; i < arry.length; i++) {
                    // populate the favorite button for each resort and style as a favorite
                    $('#btn' + (i + 1)).attr('data-name', arry[i].name).html('<button class="btn-outline-secondary favorite text-dark mr-3" data-state="false" data-fav="' + arry[i].name + '" id="favorite' + (i + 1) + '">&hearts;</button>' + arry[i].name.toString() + '<img id="' + arry[i].name + 'Icon" class="float-right" src="assets\\' + arry[i].name.toLowerCase() + '.png"height="25">');
                }
            } else {
                // sort the favArr by time in traffic
                favArr.sort(compareDistance);
                // sort the resortObj by time in traffic
                resortObj.sort(compareDistance);
                // after sorting combine the arrays with favorites first
                var arry = favArr.concat(resortObj);
                // loop through the combined array
                for (var i = 0; i < arry.length; i++) {
                    // populate the favorite button for each resort and style as not a favorite
                    $('#btn' + (i + 1)).attr('data-name', arry[i].name).html('<button class="btn-outline-secondary favorite text-dark mr-3" data-state="false" data-fav="' + arry[i].name + '" id="favorite' + (i + 1) + '">&hearts;</button>' + arry[i].name.toString() + ' - ' + arry[i].trafficText.toString() + '<img id="' + arry[i].name + 'Icon" class="float-right" src="assets\\' + arry[i].name.toLowerCase() + '.png"height="25">');
                    traffic(favArr);
                    traffic(resortObj);
                }
            }
            // loop through the skiResorts array
            for (var j = 0; j < skiResorts.length; j++) {
                // if they are a favorite
                if (skiResorts[j].favorite) {
                    // find matching resort on the resortObj array and update the favorite button to match the favorite styling
                    for (var k = 0; k < resortObj.length; k++) {
                        if (skiResorts[j].name.slice(-4).toLowerCase() === resortObj[k].name.slice(-4).toLowerCase()) {
                            $('[data-fav="' + resortObj[k].name + '"]').removeClass('text-dark').addClass('text-danger active');
                        }
                    }
                    // find matching resort on the favArr array and update the favorite button to match the favorite styling
                    for (var k = 0; k < favArr.length; k++) {
                        if (skiResorts[j].name.slice(-4).toLowerCase() === favArr[k].name.slice(-4).toLowerCase()) {
                            $('[data-fav="' + favArr[k].name + '"]').removeClass('text-dark').addClass('text-danger active');
                        }
                    }
                }
            }
            // function to populate the lift statuses - called with both resort arrays
            resortStats(favArr);
            resortStats(resortObj);
        }, 3000);
    });

    // click events
    // search by location button click
    $('#search').on('click', function (event) {
        // function to get the users location
        getLocation();
    });
    //dropdown click
    $(".dropdown-menu").click(function() {
        $(".container" ).toggleClass( "open");
     });

    // favorite button click
    $('.dropdown').on('click', '.favorite', function (event) {
        // stop the propagation so the drop down doesn't open
        event.stopPropagation();
        // if it was false
        if ($(this).attr('data-state') === 'false') {
            // update button to add favorite styling
            $(this).removeClass('text-dark').addClass('text-danger active').attr('data-state', 'true').attr('aria-pressed', 'true');
            // set the name of the resort
            var name = $(this).attr('data-fav');
            // call the fav function
            fav(name, true);
        } else {
            // update button to remove favorite styling
            $(this).addClass('text-dark').removeClass('text-danger active').attr('data-state', 'false').attr('aria-pressed', 'false');
            // set the name of the resort
            var name = $(this).attr('data-fav');
            // call the fav function
            fav(name, false);
        }
    })

    // runs after the page loads
    liftieAPI(skiResorts);
});