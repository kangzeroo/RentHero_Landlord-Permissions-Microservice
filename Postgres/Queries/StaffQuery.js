const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
const sendStaffConfirmationEmail = require('../../aws/ses/aws_ses').sendStaffConfirmationEmail
// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

// like a regular staff creation, except not a direct route itself, just a function (aka there is no `res`, `rej`, `next`)
exports.createStaffTableEntry = (info) => {
  const p = new Promise((res, rej) => {
    // console.log(info)
    // we can optionally accept a pre-defined corporation for this staff member to be associated with
    let query_string = `INSERT INTO staff (staff_id${info.corporation_id ? ', corporation_id' : ''}, email, name, phone,
                                          staff_title)
                        VALUES ('${info.staff_id}'${info.corporation_id ? `, '${info.corporation_id}'` : ''},
                                '${info.email}', '${info.name}', '${info.phone}', '${info.staff_title}')`
    // console.log(query_string)
    query(query_string)
      .then((data) => {
        return sendStaffConfirmationEmail({
          email: info.email,
          temp_pass: info.temp_pass || '',
        })
      })
      .then((data) => {
        // console.log('register info inserted in postgres')
        res({
          staff_id: info.staff_id,
          corporation_id: info.corporation_id,
        })
      })
      .catch((error) => {
        console.log(error)
        rej('Failed to save account info')
      })
  })
  return p
}

exports.post_staff_info = (req, res, next) => {
  const info = req.body
  // info = { staff_id, email, name, corporation_id, staff_title, temp_pass, accessToken }
  // we can optionally accept a pre-defined corporation for this staff member to be associated with
  let query_string = `INSERT INTO staff (staff_id${info.corporation_id ? ', corporation_id' : ''}, email, name, phone,
                                        staff_title)
                      VALUES ('${info.staff_id}'${info.corporation_id ? `, '${info.corporation_id}'` : ''},
                              '${info.email}', '${info.name}', '${info.phone}', '${info.staff_title}')`
  // console.log(query_string)

  query(query_string)
  .then((data) => {
    let query_string = `INSERT INTO general_access (staff_id, corporation_id, building_id)
                              SELECT '${info.staff_id}', a.corporation_id, a.building_id
                              FROM (SELECT DISTINCT corporation_id, building_id FROM general_access) a
                              WHERE corporation_id = '${info.corporation_id}'`
    return query(query_string)
  })
  .then((data) => {
    // console.log('register info inserted in postgres')
    return sendStaffConfirmationEmail({
      email: info.email,
      temp_pass: info.temp_pass || '',
    })
  })
  .then((data) => {
    console.log('Email confirmation sent!')
    res.json({
      message: 'Successfully created account! Check your email for the confirmation link',
    })
  })
  .catch((error) => {
    console.log(error)
      res.status(500).send('Failed to save account info')
  })
}

exports.get_staff_info = (req, res, next) => {
  const info = req.body
  let query_string = `SELECT * FROM staff WHERE staff_id = '${info.staff_id}'`
  const return_rows = (rows) => {
    res.json(rows)
  }

  query(query_string)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return log_through(data)
    })
    .then((data) => {
      // console.log("========================")
      // console.log(typeof JSON.parse(data))
      // console.log(JSON.parse(data))
      return return_rows(JSON.parse(data))
    })
    .catch((error) => {
        res.status(500).send('Failed to get staff info')
    })
}

exports.update_staff_thumbnail_photo = (req, res, next) => {
  const info = req.body
  // console.log(info)
  // we can optionally accept a pre-defined corporation for this staff member to be associated with
  let query_string = `UPDATE staff SET thumbnail = '${info.thumbnail}' WHERE staff_id = '${info.staff_id}'`

  query(query_string).then((data) => {
    res.json({
      message: 'Successfully updated account!'
    })
  })
  .catch((error) => {
    console.log(error)
      res.status(500).send('Failed to update account info')
  })
}
