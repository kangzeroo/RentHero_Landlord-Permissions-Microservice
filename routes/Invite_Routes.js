const post_corp_info_on_behalf_of_landlord = require('../Postgres/Queries/CorpQuery').post_corp_info_on_behalf_of_landlord
const createStaffTableEntry = require('../Postgres/Queries/StaffQuery').createStaffTableEntry
const grantAllPermissions = require('../Postgres/Queries/PermissionQuery').grantAllPermissions

// GET /send_staff_invite
// We use this function to manually create a staff member
exports.send_staff_invite = function(req, res, next){
  createStaffTableEntry(req.body)
    .then((data) => {
      console.log(data)
      return grantAllPermissions(data)
    }).then((data) => {
      console.log(data)
      res.json({})
    }).catch((err) => {
      console.log(err)
      res.status(500).send('Failed to send staff invite')
    })
}

exports.create_corporation = function(req, res, next){
  post_corp_info_on_behalf_of_landlord()
    .then((data) => {
      console.log(data)
      res.json({})
    }).catch((err) => {
      console.log(err)
      res.status(500).send('Failed to send staff invite')
    })
}
