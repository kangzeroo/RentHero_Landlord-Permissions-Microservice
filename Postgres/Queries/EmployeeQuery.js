const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const sendEmployeeMappedEmail = require('../../aws/ses/send_employee_mapping').sendEmployeeMappedEmail

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))

//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

exports.insert_employee_mapping = (req, res, next) => {
  const info = req.body
  let employee_id = uuid.v4()

  const v = [info.corporateEmployee.email, info.corporateEmployee.phone]
  const get_employee = `SELECT * FROM employee WHERE email = $1 AND phone = $2`

  query(get_employee, v)
  .then((data) => {
    console.log(data)
    if (data && data.rows && data.rows.length > 0) {
      employee_id = data.rows[0].employee_id
    }
    const values = [employee_id, info.corporation_id, info.corporateEmployee.name, info.corporateEmployee.email, info.corporateEmployee.phone, info.corporateEmployee.alias_email]

    const insert_employee = `INSERT INTO employee (employee_id, corporation_id, name, email, phone, alias_email)
                                  VALUES ($1, $2, $3, $4, $5, $6)
                                ON CONFLICT (email, phone) DO NOTHING
                            `
    return query(insert_employee, values)
  })
  .then((data) => {
    const values2 = [uuid.v4(), employee_id, info.inquiry_id, info.building_id]
    const query_string = `INSERT INTO employee_mapping (mapping_id, employee_id, inquiry_id, building_id)
                            VALUES ($1, $2, $3, $4)
                          ON CONFLICT (employee_id, inquiry_id) DO NOTHING
                      `
    return query(query_string, values2)
  })
  .then(() => {
    const values3 = [info.corporation_id]
    const get_corp_email = `SELECT email FROM corporation WHERE corporation_id = $1`

    return query(get_corp_email, values3)
  })
  .then((data) => {
    const corp_email = data.rows[0].email

    return sendEmployeeMappedEmail({
      email: corp_email,
      employee: info.corporateEmployee,
      tenant: info.tenant,
      building: info.building,
      inquiry: info.inquiry
    })
  })
  .then(() => {
    res.json({
      message: 'Successfully Inserted Employee Mappings'
    })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send('Failed to insert employee mapping')
  })
}

exports.get_employees_for_inquiry = (req, res, next) => {
  const info = req.body
  const values = [info.inquiry_id]

  const get_employees = `SELECT * FROM employees WHERE inquiry_id = $1`
}
