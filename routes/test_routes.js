const moment = require('moment')

// GET /test
exports.test = function(req, res, next){
  res.json({
    message: "Test says alive and well"
  })
}

exports.current_time = function(req, res, next) {
  console.log(moment().format('LLL'))
  res.json({
    message: `Current time is: ${moment().format('LLL')}`
  })
}
