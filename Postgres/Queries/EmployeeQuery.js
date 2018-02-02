const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')
const sendEmployeeMappedEmail = require('../../aws/ses/send_employee_mapping').sendEmployeeMappedEmail

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))

exports.insert_employee = (req, res, next) => {
  const info = req.body
  let employee_id = uuid.v4()

  const v = [info.email, info.phone]
  const get_employee = `SELECT * FROM employee WHERE email = $1 AND phone = $2`



  query(get_employee, v)
  .then((data) => {
    if (data && data.rows && data.rows.length > 0 && data.rows[0].employee_id.length > 0) {
      res.status(500).send('Employee Already Exists')
    } else {
      const values = [employee_id, info.first_name, info.last_name, info.email, info.phone, info.alias_email, info.cavalry]
      const insert_employee = `INSERT INTO employee (employee_id, first_name, last_name, email, phone, alias_email, cavalry)
                                              VALUES ($1, $2, $3, $4, $5, $6, $7)
                                      ON CONFLICT DO NOTHING

                              `
      return query(insert_employee, values)
      .then((data) => {
        const corpValues = [employee_id, info.corporation_id]
        const insert_employee_corp = `INSERT INTO employee_corporation (employee_id, corporation_id)
                                            VALUES ($1, $2)
                                      `
        return query(insert_employee_corp, corpValues)
      })
      .then((data) => {
        res.json({
          message: 'Successfully created Employee',
          employee_id: employee_id,
        })
      })
    }
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send(err)
  })
}

exports.assign_employee_to_buildings = (req, res, next) => {
  const info = req.body

  const arrayOfPromises = info.buildings.map((building) => {
    const values = [info.employee_id, building.building_id]
    const insert_mapping = `INSERT INTO employee_assignments (employee_id, building_id, suite_id)
                                  VALUES ($1, $2, null)
                                ON CONFLICT DO NOTHING
                           `
    return query(insert_mapping, values)
  })

  Promise.all(arrayOfPromises)
  .then((data) => {
    res.json({
      message: 'Successfully Assigned Employees'
    })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send(err)
  })
}

exports.assign_employee_to_suites = (req, res, next) => {
  const info = req.body
  console.log(info)
  const arrayOfPromises = info.suites.map((suite) => {
    const values = [info.employee_id, suite.building_id, suite.suite_id]

    const insert_mapping = `INSERT INTO employee_assignments (employee_id, building_id, suite_id)
                                  VALUES ($1, $2, $3)
                              ON CONFLICT DO NOTHING
                            `
    return query(insert_mapping, values)
  })

  Promise.all(arrayOfPromises)
  .then((data) => {
    res.json({
      message: 'Successfully assigned employee to suites'
    })
  })
  .catch((err) => {
    console.log('assign_employee_to_suites: ', err)
    res.status(500).send('Failed to assign employees to suites')
  })
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
    const values = [employee_id, info.corporateEmployee.first_name, info.corporateEmployee.last_name, info.corporateEmployee.email, info.corporateEmployee.phone, info.corporateEmployee.alias_email]

    const insert_employee = `INSERT INTO employee (employee_id, first_name, last_name, email, phone, alias_email, cavalry)
                                  VALUES ($1, $2, $3, $4, $5, $6, false)
                                ON CONFLICT (email, phone) DO NOTHING
                            `
    return query(insert_employee, values)
  })
  .then((data) => {
    const corpValues = [employee_id, info.corporation_id]
    const insert_emp_corp = `INSERT INTO employee_corporation (employee_id, corporation_id)
                                    VALUES ($1, $2)
                                ON CONFLICT (employee_id, corporation_id) DO NOTHING
                            `
    return query(insert_emp_corp, corpValues)
  })
  // .then((data) => {
  //   const buildingValues = [employee_id, info.building.building_id]
  //   const insert_emp_assign = `INSERT INTO employee_assignments (employee_id, building_id)
  //                                     VALUES ($1, $2)
  //                                 ON CONFLICT (employee_id, building_id) DO NOTHING
  //                               `
  //
  //   return query(insert_emp_assign, buildingValues)
  // })
  .then((data) => {
    const values2 = [uuid.v4(), employee_id, info.inquiry.inquiry_id, info.building.building_id]
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
  // .then((data) => {
  //   const corp_email = data.rows[0].email
  //
  //   return sendEmployeeMappedEmail({
  //     email: corp_email,
  //     employee: info.corporateEmployee,
  //     tenant: info.tenant,
  //     building: info.building,
  //     inquiry: info.inquiry
  //   })
  // })
  .then(() => {
    res.json({
      message: 'Successfully Inserted Employee Mappings',
      employee_id: employee_id,
    })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send('Failed to insert employee mapping')
  })
}

exports.get_all_employees = (req, res, next) => {
  const get_all_employees = `SELECT * FROM employee`

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_all_employees)
  .then((data) => {
    return stringify_rows(data)
  })
  .then((data) => {
    return json_rows(data)
  })
  .then((data) => {
    return return_rows(data)
  })
  .catch((error) => {
    console.log(error)
      res.status(500).send('Failed to get employees')
  })
}

exports.get_employee_assignments = (req, res, next) => {
  const info = req.body
  const values = [info.employee_id]
  const get_all_employees = `SELECT employee_id, building_id, suite_id, created_at
                               FROM employee_assignments
                               WHERE employee_id = $1
                               `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_all_employees, values)
  .then((data) => {
    return stringify_rows(data)
  })
  .then((data) => {
    return json_rows(data)
  })
  .then((data) => {
    return return_rows(data)
  })
  .catch((error) => {
    console.log(error)
    res.status(500).send('Failed to get employee assignments')
  })
}

exports.get_all_mappings_for_employee = (req, res, next) => {
  const info = req.body
  const values = [info.employee_id]

  const get_maps = `SELECT * FROM employee_mapping WHERE employee_id = $1`

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_maps, values)
  .then((data) => {
    return stringify_rows(data)
  })
  .then((data) => {
    return json_rows(data)
  })
  .then((data) => {
    return return_rows(data)
  })
  .catch((error) => {
    console.log(error)
      res.status(500).send('Failed to get employee mappings')
  })
}

exports.get_employees_for_corporation = (req, res, next) => {
  const info = req.body
  const values = [info.corporation_id]

  const get_maps = `SELECT a.employee_id, a.first_name, a.last_name, a.email, a.phone,
                           a.alias_email, a.cavalry, a.created_at,
                           b.corporation_id
                      FROM employee a
                      INNER JOIN employee_corporation b
                      ON a.employee_id = b.employee_id
                      WHERE b.corporation_id = $1
                   `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(get_maps, values)
  .then((data) => {
    return stringify_rows(data)
  })
  .then((data) => {
    return json_rows(data)
  })
  .then((data) => {
    return return_rows(data)
  })
  .catch((error) => {
    console.log(error)
      res.status(500).send('Failed to get employee')
  })
}

exports.remove_assignment_from_employee = (req, res, next) => {
  const info = req.body
  const values = [info.employee_id, info.building_id]

  const remove_assignment = `DELETE FROM employee_assignments
                                  WHERE employee_id = $1
                                    AND building_id = $2
                            `

  query(remove_assignment, values)
  .then(() => {
    res.json({
      message: 'Removed Employee Assignment'
    })
  })
  .catch((err) => {
    res.status(500).send('Failed to Remove Employee Assignment')
  })
}

exports.delete_employee = (req, res, next) => {
  const info = req.body
  const values = [info.employee_id]

  const remove_employee = `DELETE FROM employee WHERE employee_id = $1`

  query(remove_employee, values)
  .then(() => {
    res.json({
      message: 'Removed Employee'
    })
  })
  .catch((err) => {
    res.status(500).send('Failed to Remove Employee')
  })
}
