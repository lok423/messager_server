var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('../services/user.service');
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;

passport.use('facebook-token', new FacebookStrategy({
clientID: "291488081633021",
clientSecret: "7ece8f92b4b8b6758b132706c1774b8b",
callbackURL: "http://www.example.com/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
console.log("accessToken",accessToken);
console.log("profile",profile);
}
));
// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/facebook_auth', passport.authenticate('facebook-token'),
  function (req, res) {
    console.log(req,res);
    // do something with req.user
    res.send(req.user? 200 : 401);
  }
);

module.exports = router;

function fb_authenticate(req, res) {
    //console.log(req);

}

function authenticate(req, res) {

    userService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                res.send(user);
            } else {
                // authentication failed
                res.status(400).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
          console.log(err);
            res.status(400).send(err);
        });
}

function register(req, res) {
    userService.create(req.body)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    userService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    userService.update(req.params._id, req.body)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
  console.log("deleting");
  console.log(req.params.id);
    userService.delete(req.params.id)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
