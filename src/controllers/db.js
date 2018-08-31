
const mongoose = require('mongoose');
module.exports = mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', function(err) {
  if (err) {
    //console.log(err);
  } else {
    console.log('connected to the mongodb!');
  }
})
