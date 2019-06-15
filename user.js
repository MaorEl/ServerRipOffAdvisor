const DButilsAzure = require('./DButils');
const jwt = require("jsonwebtoken");


secret = "secret";


function register(req, res) {

    const user = {
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        categories: req.body.categories
    };

    if (user.username.length < 3 || user.username.length > 8) {
        res.status(400).send('Problem with username length!');
    }
    if (user.password.length < 5 || user.password.length > 10) {
        res.statusCode = 400;
        res.send("Problem with password length!");
    }
    if (!(/^[a-zA-Z]+$/.test(user.username))) {
        res.statusCode = 400;
        res.send("Problem with username, only letters allowed!");
    }
    if (!(user.password.match("^[A-z0-9]+$"))) {
        res.statusCode = 400;
        res.send("Problem with password, only letters and digits are allowed!");
    }
    var categoriesArray = user.categories.split(',');
    if (categoriesArray.length < 2) {
        res.statusCode = 400;
        res.send("Not enough categories specified !");
    }
    var categoriesIntList = [];
    categoriesArray.forEach(function (value) {
        if (!isNaN(parseInt(value)))
            categoriesIntList.push(parseInt(value));
        else {
            res.statusCode = 400;
            res.send("Category must be ID !");
        }
    });

    console.log("got this user: " + req.body.first_name);
    DButilsAzure.executeQuery("INSERT INTO Users (username,password,first_name,last_name,city,country,email) \n" +
        "VALUES ('" + user.username + "','" + user.password + "','" + user.first_name + "','" + user.last_name + "','" + user.city + "','" + user.country + "','" + user.email + "')")
        .then(function (result) {
            categoriesIntList.forEach(function (category) {
                DButilsAzure.executeQuery("INSERT INTO [CategoriesOfUsers] (username, category_id) \n" +
                    "VALUES ('" + user.username + "','" + category + "')")
                    .catch(function (err) {
                        console.log(err);
                        res.send(err)
                    })
            });

            res.status(`201`).send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })

}

function login(req, res) {
    const user = {
        username: req.body.username,
        password: req.body.password
    };
    DButilsAzure.executeQuery("SELECT * FROM Users \n" +
        "WHERE [username] LIKE '" + user.username + "' AND [password] LIKE '" + user.password + "'")
        .then(function (result) {
            payload = {
                username: result[0].username, first_name: result[0].first_name, last_name: result[0].last_name,
                city: result[0].city, country: result[0].country, email: result[0].email
            };
            options = {expiresIn: "1d"};
            const token = jwt.sign(payload, secret, options);
            res.status(201).send(token)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function InsertAnswer(req, res) {
    const user = {
        username: req.body.username,
        question_id: req.body.question_id,
        answer: req.body.answer,
    };
    console.log("got this user: " + req.body.username);
    DButilsAzure.executeQuery("INSERT INTO UsersAnswers (username,question_id,answer) VALUES ('" + user.username + "','" + user.question_id + "','" + user.answer + "')")
        .then(function (result) {
            console.log("got new answer of " + user.username);
            res.status(201).send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function getAllCountries(req, res) {
    DButilsAzure.executeQuery('SELECT DISTINCT name FROM Country')
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function RestorePassword(req, res) {
    const user = {
        username: req.body.username,
        question: req.body.question,
        answer: req.body.answer
    };
    var query = "SELECT * FROM UsersAnswers \n" +
        "WHERE [username] LIKE '" + user.username + "' AND [question_id] LIKE '" + user.question + "' AND [answer] LIKE '" + user.answer + "'";
    console.log("got this user: " + req.body.username);
    DButilsAzure.executeQuery(query)
        .then(function (result) {
            if (result.length === 1) {
                DButilsAzure.executeQuery("SELECT [password] FROM Users WHERE [username] LIKE '" + user.username + "'")
                    .then(function (result) {
                        res.send(result)
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.send(err)
                    })
            } else {
                res.send(result)
            }

        }, function myError(response) {
            console.log("problem");
        });
    //res.status(201).send(username);
}

function getAllQuestions(req, res) {
    DButilsAzure.executeQuery('SELECT * FROM Questions')
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

function privateCheck(req, res, next) {
    const token = req.header("x-auth-token");
    // no token
    if (!token) res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        const decoded = jwt.verify(token, secret);
        var userId = decoded.username;
        req.username = userId;
        req.decoded = decoded;
        next(); //move on to the actual function
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
}

function getUserQuestion(req, res) {
    var user = req.params["username"];
    DButilsAzure.executeQuery("SELECT DISTINCT Q.[id],Q.[question] FROM Questions Q INNER JOIN UsersAnswers A ON Q.[id] = A.[question_id] WHERE A.[username] = '" + user + "'")
        .then(function (result) {
            res.send(result)
        })
        .catch(function (err) {
            console.log(err);
            res.send(err)
        })
}

exports.privateCheck = privateCheck;
exports.getAllQuestions = getAllQuestions;
exports.getAllCountries = getAllCountries;
exports.register = register;
exports.login = login;
exports.InsertAnswer = InsertAnswer;
exports.RestorePassword = RestorePassword;
exports.getUserQuestion = getUserQuestion;