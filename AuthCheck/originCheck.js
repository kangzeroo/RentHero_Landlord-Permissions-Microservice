

exports.originCheck = function(req, res, next){
 const origin = req.get('origin')
 if (process.env.NODE_ENV === 'production') {
   if (origin.indexOf('rentburrow.com') > -1 || origin.indexOf('renthero.ca') > -1) {
     next()
   } else {
     res.status(500).send({
       message: 'bad boi bad boi'
     })
     // next()
   }
 } else {
   // if (origin.indexOf('https://localhost:8080') > -1) {
   //   next()
   // } else {
   //   res.status(500).send({
   //     message: 'Incorrect request origin. Not https://localhost:8080'
   //   })
   // }
   next()
 }
}
