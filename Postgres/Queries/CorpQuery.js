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
  // console.log(data)
  return data
}

exports.post_corp_info = (req, res, next) => {
  const info = req.body
  const corporation_id = uuid.v4()
  console.log(info)
  const corp_values = [info.corporation_name, info.email, info.staff_id]

  let insert_corp = `INSERT INTO corporation (corporation_id, corporation_name, email)
                                      VALUES ('${corporation_id}', '${info.email}', '${info.email}')`
  let update_staff = `UPDATE staff SET corporation_id = '${corporation_id}' WHERE staff_id = '${info.staff_id}'`

  query(insert_corp)
    .then((data) => {
      return query(update_staff)
    }).then((data) => {
      res.json({
        message: "Successfully inserted into corporations and staff",
        corporation_id: corporation_id
      })
    })
    .catch((error) => {
        res.status(500).send('Failed to save company info')
    })
}

// like a regular corp creation, except not a direct route itself, just a function (aka there is no `res`, `rej`, `next`)
exports.post_corp_info_on_behalf_of_landlord = (info) => {
  const p = new Promise((res, rej) => {
    const corporation_id = uuid.v4()
    console.log(info)
    const corp_values = [info.corporation_name, info.email, info.staff_id]

    let insert_corp = `INSERT INTO corporation (corporation_id, corporation_name, email)
                                        VALUES ('${corporation_id}', '${info.email}', '${info.email}')`
    let update_staff = `UPDATE staff SET corporation_id = '${corporation_id}' WHERE staff_id = '${info.staff_id}'`

    query(insert_corp)
      .then((data) => {
        return query(update_staff)
      }).then((data) => {
        res({
          message: "Successfully inserted into corporations and staff",
          corporation_id: corporation_id
        })
      })
      .catch((error) => {
          rej('Failed to save company info')
      })
  })
  return p
}

exports.get_corp_info = (req, res, next) => {
  const info = req.body
  const values = [info.corporation_id]

  let query_string = `SELECT * FROM corporation WHERE corporation_id = $1`
  const return_rows = (rows) => {
    res.json(rows)
  }

  query(query_string, values)
    .then((data) => {
      return stringify_rows(data)
    })
    .then((data) => {
      return log_through(data)
    })
    .then((data) => {
      // console.log("========================")
      // console.log(data)
      // console.log(JSON.parse(data))
      return return_rows(JSON.parse(data))
    })
    .catch((error) => {
        res.status(500).send('Failed to get company info')
    })
}

exports.update_corp_thumbnail = (req, res, next) => {
  const info = req.body
  const values = [info.thumbnail, info.corporation_id]

  let query_string = `UPDATE corporation SET thumbnail = $1 WHERE corporation_id=$2`

  // console.log("===========UPDATE CORP THUMBNAIL=============")
  query(query_string, values)
    .then((data) => {
      // console.log(data)
      res.json({
        message: 'success'
      })
    })
    .catch((error) => {
      console.log(error)
        res.status(500).send('Failed to get company info')
    })
}
