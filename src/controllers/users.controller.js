var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('../services/user.service');
var passport = require('passport'), FacebookTokenStrategy = require('passport-facebook-token');

passport.use('facebookToken', new FacebookTokenStrategy({
clientID: "291488081633021",
clientSecret: "7ece8f92b4b8b6758b132706c1774b8b",
provider: "facebookToken",
module: "passport-facebook-token",
    strategy: "FacebookTokenStrategy",
    callbackURL: " /auth/facebook-token/callback",

//callbackURL: "http://www.example.com/auth/facebook/callback"
fbGraphVersion: 'v3.1'
 }, function(accessToken, refreshToken, profile, done) {
   //User.findOrCreate({facebookId: profile.id}, function (error, user) {
     //return done(error, user);
     console.log(accessToken);
   }));


// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:id', update);
router.delete('/:id', _delete);
router.post('/oauth/facebook',

(req, res) => {
        passport.authenticate('facebookToken', function (err, user, info) {
              if(err){
                  if(err.oauthError){
                      var oauthError = JSON.parse(err.oauthError.data);
                      res.send(oauthError.error.message);
                  } else {
                      res.send(err);
                  }
              } else {
                  res.send(user);
              }
        })(req, res);
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
