$( document ).ready(function() {

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

function liftieTest(arr) {
    

    for(var i = 0; i < arr.length; i++){

    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i],
        method: "GET"
    }).then(function (response) {
        console.log(response);
        lat = response.ll[1];
        lon = response.ll[0];
        console.log(lat);
        console.log(lon);
        mapsTest();
    });
}
};






function mapsTest() {
    var apiKey = 'AIzaSyCp8r9ykeHiZkwSGPBhA6nn5ZDjvlOUScc';
    var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/directions/json?origin=' + userLat + ',' + userLon + '&destination=' + lat + ',' + lon + '&key=' + apiKey

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
    });
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