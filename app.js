var express = require('express');
var app = express();
const DButilsAzure = require('./DButils');
const ip = require('./interestPoints');
const user = require('./user');
app.use(express.json()); //hels me read the JSON
const jwt = require("jsonwebtoken");

secret = "secret";
app.use("/private", user.privateCheck);

app.get('/getAllCategories', ip.getAllCategories);


//get all question
app.get('/private/getAllQuestions',user.getAllQuestions);

//get all countries
app.get('/private/getAllCountries', user.getAllCountries);

//get all favorites of username
app.get('/private/getAllFavorites',ip.getAllFavorites);


//get 3 random over a specific rank
app.get('/private/getThreeRandom/:rank',ip.getThreeRandom);

//get last two reviews of interest point
app.get('/getLastTwoReviews/:InterestPointID', ip.getLastTwoReviews);

app.put('/viewInterestPoint/:InterestPointID', function (req, res) {
    var ip_id = req.params["InterestPointID"];
    var query = "UPDATE [dbo].[InterestPoints] \n" +
                "SET [views] = ((SELECT [views] FROM [dbo].[InterestPoints] WHERE [id] = " +ip_id +")) + 1 \n" +
                "WHERE [id] = " +ip_id ;
    DButilsAzure.executeQuery(query)
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        })
});

//get 2 popular interest points of user
app.get('/private/getTwoPopularInterestPoints', ip.getTwoPopularInterestPoints);

//get last 2 interest points
app.get('/private/getLastTwoSavedInterestPoints', ip.getLastTwoSavedInterestPoints);


app.post("/register", user.register );

app.post("/login",user.login);

//get all question
app.get('/getAllInterestPoints', ip.getAllInterestPoints);

//get top 5 photos
app.get('/getTopFivePhotos', ip.getTopFivePhotos);

//get interst points by name (search)
app.get('/searchForInterestPoint/:name', ip.searchForInterestPoint );

//get all interst points by category (search)
app.get('/getAllInterestPointsByCategory/:categoryID',ip.getAllInterestPointsByCategory);

//get one interst point by id (search)
app.get('/getIntertestPointDetails/:interestPointID', ip.getIntertestPointDetails);


app.post("/InsertAnswer", user.InsertAnswer);

//set interst point index to sort it
//will get JSON of JSONS({"interestPointID", "i"})

app.put('/private/updateSortOption', ip.updateSortOption);


//add interest point to favorites. get param of ip_id
app.post('/private/addToFavorites', ip.addToFavorites);

//rank interest point by user
app.post('/private/rankInterestPoint', ip.rankInterestPoint);

//add interst point to favorites. get param of ip_id
app.delete('/private/deleteFromFavorites', ip.deleteFromFavorites);



app.post("/RestorePassword", user.RestorePassword);


var server = app.listen(5000, function () {
    console.log('Server is running..');
});



