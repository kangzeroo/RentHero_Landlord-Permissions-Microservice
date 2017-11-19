const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const InviteRoutes = require('./routes/Invite_Routes')
const StaffQuery = require('./Postgres/Queries/StaffQuery')
const CorpQuery = require('./Postgres/Queries/CorpQuery')
const PermissionQuery = require('./Postgres/Queries/PermissionQuery')

const JWT_Check = require('./AuthCheck/JWT_Check').JWT_Check

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)
	app.post('/send_staff_invite', json_encoding, InviteRoutes.send_staff_invite)

	// Staff Queries
	app.post('/post_staff_info', [json_encoding], StaffQuery.post_staff_info)
	app.post('/get_staff_info', [json_encoding], StaffQuery.get_staff_info)
	app.post('/update_staff_thumbnail_photo', [json_encoding, JWT_Check], StaffQuery.update_staff_thumbnail_photo)

	// Corp Queries
	app.post('/post_corp_info', [json_encoding, JWT_Check], CorpQuery.post_corp_info)
	app.post('/update_corp_thumbnail', [json_encoding, JWT_Check], CorpQuery.update_corp_thumbnail)
	app.post('/get_corp_info', [json_encoding], CorpQuery.get_corp_info)
	app.post('/get_associated_corporations', [json_encoding], CorpQuery.get_associated_corporations)
	app.post('/associate_corporation_list', [json_encoding], CorpQuery.associate_corporation_list)
	app.post('/insert_building_corp_association', [json_encoding], CorpQuery.insert_building_corp_association)
	app.post('/delete_corporation_building', [json_encoding], CorpQuery.delete_corporation_building)

	// Permission Queries
	app.post('/insert_building_read_for_all', [json_encoding, JWT_Check], PermissionQuery.insert_building_read_for_all)
}
