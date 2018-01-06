const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const InviteRoutes = require('./routes/Invite_Routes')
const StaffQuery = require('./Postgres/Queries/StaffQuery')
const CorpQuery = require('./Postgres/Queries/CorpQuery')
const PermissionQuery = require('./Postgres/Queries/PermissionQuery')

const JWT_Check = require('./AuthCheck/JWT_Check').JWT_Check
const originCheck = require('./AuthCheck/originCheck').originCheck

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})
// bodyParser attempts to parse any request into GraphQL format
// const graphql_encoding = bodyParser.text({ type: 'application/graphql' })

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)
	app.post('/send_staff_invite', [json_encoding, originCheck], InviteRoutes.send_staff_invite)

	// Staff Queries
	app.post('/post_staff_info', [json_encoding, originCheck], StaffQuery.post_staff_info)
	app.post('/get_staff_info', [json_encoding, originCheck], StaffQuery.get_staff_info)
	app.post('/update_staff_thumbnail_photo', [json_encoding, JWT_Check, originCheck], StaffQuery.update_staff_thumbnail_photo)

	// Corp Queries
	app.post('/insert_corporation_profile', [json_encoding, JWT_Check, originCheck], CorpQuery.insert_corporation_profile)
	app.post('/insert_corporation_alias_email', [json_encoding, JWT_Check, originCheck], CorpQuery.insert_corporation_alias_email)
	app.post('/insert_corporation_building_relationship', [json_encoding, JWT_Check, originCheck], CorpQuery.insert_corporation_building_relationship)
	app.post('/get_buildings_associated_with_corporation', [json_encoding, JWT_Check, originCheck], CorpQuery.get_buildings_associated_with_corporation)
	app.post('/post_corp_info', [json_encoding, JWT_Check, originCheck], CorpQuery.post_corp_info)
	app.post('/update_corp_thumbnail', [json_encoding, JWT_Check, originCheck], CorpQuery.update_corp_thumbnail)
	app.post('/get_corp_info', [json_encoding, originCheck], CorpQuery.get_corp_info)
	app.post('/get_associated_corporations', [json_encoding, originCheck], CorpQuery.get_associated_corporations)
	app.post('/associate_corporation_list', [json_encoding, originCheck], CorpQuery.associate_corporation_list)
	app.post('/insert_building_corp_association', [json_encoding, originCheck], CorpQuery.insert_building_corp_association)
	app.post('/delete_corporation_building', [json_encoding, originCheck], CorpQuery.delete_corporation_building)
	app.post('/get_all_corporations', [json_encoding, originCheck], CorpQuery.get_all_corporations)
	app.post('/get_corporation_alias_emails', [json_encoding, originCheck], CorpQuery.get_corporation_alias_emails)
	app.post('/delete_corporation', [json_encoding, originCheck], CorpQuery.delete_corporation)
	app.post('/update_corporation', [json_encoding, originCheck], CorpQuery.update_corporation)
	app.post('/remove_alias_email', [json_encoding, originCheck], CorpQuery.remove_alias_email)


	// Permission Queries
	app.post('/insert_building_read_for_all', [json_encoding, JWT_Check, originCheck], PermissionQuery.insert_building_read_for_all)
}
