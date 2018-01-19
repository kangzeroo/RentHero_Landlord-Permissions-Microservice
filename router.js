const bodyParser = require('body-parser')
// routes
const Test = require('./routes/test_routes')
const InviteRoutes = require('./routes/Invite_Routes')
const StaffQuery = require('./Postgres/Queries/StaffQuery')
const StaffPermissionsQuery = require('./Postgres/Queries/StaffPermissionsQuery')
const CorpQuery = require('./Postgres/Queries/CorpQuery')
const EmployeeQuery = require('./Postgres/Queries/EmployeeQuery')
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
	app.post('/get_all_staff_in_corp', [json_encoding, originCheck], StaffQuery.get_all_staff_in_corp)
	app.post('/update_staff_thumbnail_photo', [json_encoding, JWT_Check, originCheck], StaffQuery.update_staff_thumbnail_photo)
	app.post('/update_staff_profile', [json_encoding, JWT_Check, originCheck], StaffQuery.update_staff_profile)
	app.post('/delete_staff', [json_encoding, JWT_Check, originCheck], StaffQuery.delete_staff)

	// Staff Permissions Queries
	app.post('/insert_staff_permissions', [json_encoding, JWT_Check, originCheck], StaffPermissionsQuery.insert_staff_permissions)
	app.post('/get_permissions_for_staff', [json_encoding, JWT_Check, originCheck], StaffPermissionsQuery.get_permissions_for_staff)
	app.post('/delete_all_permissions_for_staff', [json_encoding, JWT_Check, originCheck], StaffPermissionsQuery.delete_all_permissions_for_staff)

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


	// Employee queries
	app.post('/insert_employee_mapping', [json_encoding, originCheck], EmployeeQuery.insert_employee_mapping)
}
