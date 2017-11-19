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

const json_rows = res => res.map(row => JSON.parse(row))

//log_through: log each row
const log_through = data => {
  // console.log(data)
  return data
}

exports.post_corp_info = (req, res, next) => {
  const info = req.body
  const corporation_id = uuid.v4()
  const corp_values = [corporation_id, info.corporation_name, info.email, info.phone, info.website, info.thumbnail]

  let insert_corp = `INSERT INTO corporation (corporation_id, corporation_name, email, phone, website, thumbnail)
                                      VALUES ($1, $2, $3, $4, $5, $6)`
  // let update_staff = `UPDATE staff SET corporation_id = '${corporation_id}' WHERE staff_id = '${info.staff_id}'`

  query(insert_corp, corp_values)
    .then((data) => {
      const rel_values = [info.building_id, corporation_id]
      const insert_building_relationship = `INSERT INTO corporation_building (building_id, corporation_id)
                                                 VALUES ($1, $2)`

      return query(insert_building_relationship, rel_values)
    })
    .then((data) => {
      const staff_access_values = [info.staff_id, corporation_id, info.building_id]
      const insert_staff_access = `INSERT INTO general_access (staff_id, corporation_id, building_id)
                                        VALUES ($1, $2, $3)`

      return query(insert_staff_access, staff_access_values)
    })
    .then((data) => {
      const corp_access_values = [corporation_id, info.building_id]
      const insert_corp_access = `INSERT INTO general_access (corporation_id, building_id)
                                        VALUES ($1, $2)`

      return query(insert_corp_access, corp_access_values)
    })
    .then((data) => {
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

exports.get_associated_corporations = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]

  const all_corps = `SELECT a.corporation_id, b.corporation_name, b.email, b.phone, b.website, b.thumbnail
                      FROM corporation_building a
                      INNER JOIN corporation b
                      ON a.corporation_id = b.corporation_id
                      WHERE a.building_id = $1
                    `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(all_corps, values)
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
        res.status(500).send('Failed to get corporations')
    })
}

exports.associate_corporation_list = (req, res, next) => {
  const info = req.body
  const values = [info.building_id]

  const all_corps = `SELECT a.corporation_id, a.corporation_name, a.email, a.phone, a.website, a.thumbnail,
                            b.building_id
                      FROM corporation a
                      LEFT OUTER JOIN (SELECT * FROM corporation_building WHERE building_id = $1) b
                      ON a.corporation_id = b.corporation_id
                      ORDER BY a.corporation_name
                    `

  const return_rows = (rows) => {
    res.json(rows)
  }
  query(all_corps, values)
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
        res.status(500).send('Failed to get corporations')
    })
}

exports.insert_building_corp_association = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.corporation_id]

  const insert_association = `INSERT INTO corporation_building (building_id, corporation_id)
                                   SELECT $1, $2
                                   WHERE NOT EXISTS (
                                     SELECT building_id, corporation_id
                                      FROM corporation_building
                                     WHERE building_id = $1
                                       AND corporation_id = $2
                                   )
                              `

  query(insert_association, values)
  .then((data) => {
    res.json({
      message: 'Successfully associated building and corporation'
    })
  })
  .catch((err) => {
    res.status(500).send('Failed to associate building and corporation')
  })
}

exports.delete_corporation_building = (req, res, next) => {
  const info = req.body
  const values = [info.building_id, info.corporation_id]

  const delete_association = `DELETE FROM corporation_building
                                    WHERE building_id = $1 AND corporation_id = $2
                              `

  query(delete_association, values)
  .then((data) => {
    res.json({
      message: 'Successfully deleted building corporation association'
    })
  })
  .catch((err) => {
    res.status(500).send('Failed to delete building and corporation association')
  })
}