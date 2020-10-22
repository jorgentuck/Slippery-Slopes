var skiResorts = ['snowbird'
    , 'alta'
    , 'brianhead'
    , 'brighton'
    , 'deer-valley'
    , 'parkcity'
    , 'solitude'];
function liftieTest(arr) {
    for(var i = 0; i < arr.length; i++){

    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://liftie.info/api/resort/" + arr[i],
        method: "GET"
    }).then(function (response) {
        console.log(response);
    });
}
};

liftieTest(skiResorts);




function mapsTest() {
    var apiKey = 'AIzaSyCp8r9ykeHiZkwSGPBhA6nn5ZDjvlOUScc';
    var queryURL = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=ski%20resort&inputtype=textquery&locationbias=circle:100000@40.3896709,-111.8292264&fields=name,formatted_address&key=' + apiKey

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



