const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const uuid = require('uuid')

// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

//log_through: log each row
const log_through = data => {
  return data
}

exports.grantAllPermissions = (info) => {

  const query_string = `INSERT INTO general_access (staff_id, corporation_id, building_id)
                            SELECT '${info.staff_id}', a.corporation_id, a.building_id
                            FROM (SELECT DISTINCT corporation_id, building_id FROM general_access) a
                            WHERE corporation_id = '${info.corporation_id}'`

  query(query_string)
 .then((data) => {
    // console.log('Building info inserted in postgres')
    res.json({
      message: 'Successfully did something',

    })
  })
  .catch((error) => {
    console.log(error)
    res.status(500).send('Failed to do something')
  })
}

// insert read building access for all staff of corporation
exports.insert_building_read_for_all = (req, res, next) => {
  const info = req.body
  const values = [info.corporation_id]

  let get_staff_of_corp = `SELECT staff_id FROM staff WHERE corporation_id = $1`

  query(get_staff_of_corp, values)
  .then((data) => {
    const values2 = [info.corporation_id, info.building_id]
    const arrayOfPromises = data.rows.map((row) => {
      let insert_access = `INSERT INTO general_access (staff_id, corporation_id, building_id)
                                  VALUES ('${row.staff_id}', $1, $2)`
      return query(insert_access, values2)
    })

    return Promise.all(arrayOfPromises)
  })
  .then((data) => {
    // console.log('General Access For Building inserted')
    res.json({
      message: 'Successfully saved access'
    })
  })
  .catch((error) => {
      res.status(500).send('Failed to save access')
  })
}
