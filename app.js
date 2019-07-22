var express = require('express');
var app = express();
const DButilsAzure = require('./DButils');
const ip = require('./interestPoints');
const user = require('./user');
app.use(express.json()); //hels me read the JSON
var cors = require('cors');
app.use(cors());
const port = 5000;
var server_name = 'https://ripoffadvisorserver.azurewebsites.net';
//var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';



//anael edit
app.use("/", function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-auth-token, Access-Control-Allow-Headers, X-Requested-With');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE, OPTIONS');

    next();
});

app.use("/private", function (req, res, next) {
    user.privateCheck(req, res, next)
});

app.get('/getAllCategories', function (req, res) {
    ip.getAllCategories(req, res);
});


//get all question
app.get('/getAllQuestions', function (req, res) {
    user.getAllQuestions(req, res);
});

//get all countries
app.get('/getAllCountries', function (req, res) {
    user.getAllCountries(req, res);
});

//get all favorites of username
app.get('/private/getAllFavorites', function (req, res) {
    ip.getAllFavorites(req, res);
});


//get 3 random over a specific rank
app.get('/getThreeRandom/:rank', function (req, res) {
    ip.getThreeRandom(req, res);
});

//get last two reviews of interest point
app.get('/getLastTwoReviews/:InterestPointID', function (req, res) {
    ip.getLastTwoReviews(req, res);
});

app.put('/viewInterestPoint/:InterestPointID', function (req, res) {
    ip.viewInterestPoint(req, res);
});

//get 2 popular interest points of user
app.get('/private/getTwoPopularInterestPoints', function (req, res) {

    ip.getTwoPopularInterestPoints(req, res)
});

//get last 2 interest points
app.get('/private/getLastTwoSavedInterestPoints', function (req, res) {
    ip.getLastTwoSavedInterestPoints(req, res);
});


app.post("/register", function (req, res) {

    user.register(req, res);
});

app.post("/login", function (req, res) {
    user.login(req, res);
});

//get all question
app.get('/getAllInterestPoints', function (req, res) {

    ip.getAllInterestPoints(req, res);
});

//get top 5 photos
app.get('/getTopFivePhotos', function (req, res) {
    ip.getTopFivePhotos(req, res);
});

//get interst points by name (search)
app.get('/searchForInterestPoint/:name', function (req, res) {
    ip.searchForInterestPoint(req, res);
});

//get all interst points by category (search)
app.get('/getAllInterestPointsByCategory/:categoryID', function (req, res) {
    ip.getAllInterestPointsByCategory(req, res);
});
//get all interst points by category (search) and sorted by raml
app.get('/getAllInterestPointsByCategorySortedByRank/:categoryID', function (req, res) {
    ip.getAllInterestPointsByCategorySortedByRank(req, res);
});

//get one interst point by id (search)
app.get('/getIntertestPointDetails/:interestPointID', function (req, res) {
    ip.getIntertestPointDetails(req, res);
});


app.post("/InsertAnswer", function (req, res) {
    user.InsertAnswer(req, res);
});

//set interst point index to sort it
//will get JSON of JSONS({"interestPointID", "i"})

app.put('/private/updateSortOption', function (req, res) {
    ip.updateSortOption(req, res);
});


//add interest point to favorites. get param of ip_id
app.post('/private/addToFavorites', function (req, res) {
    ip.addToFavorites(req, res);
});

//rank interest point by user
app.post('/private/rankInterestPoint', function (req, res) {
    ip.rankInterestPoint(req, res);
});

//add interst point to favorites. get param of ip_id
app.delete('/private/deleteFromFavorites', function (req, res) {
    ip.deleteFromFavorites(req, res);
});


app.post("/RestorePassword", function (req, res) {
    user.RestorePassword(req, res);
});

app.get("/getUserQuestion/:username", function (req, res) {
    user.getUserQuestion(req, res);
});


var server = app.listen(port ,function () {
    console.log('Server is running.. on ' + ' and port ' + port);
});


