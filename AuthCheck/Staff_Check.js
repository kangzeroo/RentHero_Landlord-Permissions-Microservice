
exports.Staff_Check = function(req, res, next){
	const jwtToken = req.headers.jwt
	ValidateToken(pems, jwtToken)
			.then((data)=>{
				console.log(data)
				next()
			})
			.catch((err)=>{
				console.log(err)
				res.send(err)
			})
}
