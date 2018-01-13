const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../db_connect')
// to run a query we just pass it to the pool
// after we're done nothing has to be taken care of
// we don't have to return any client to the pool or close a connection

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

const json_rows = res => res.map(row => JSON.parse(row))

exports.insert_staff_permissions = (req, res, next) => {
  const info = req.body
  const links = info.links

  const arrayOfPromises = links.map((link) => {
    const values = [info.staff_id, link]
    const insert_permission = `INSERT INTO staff_access (staff_id, link) VALUES ($1, $2)`
    return query(insert_permission, values)
  })

  Promise.all(arrayOfPromises)
  .then((data) => {
    res.json({
      message: 'inserted permissions'
    })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send('Failed to insert staff permissions')
  })
}

exports.get_permissions_for_staff = (req, res, next) => {
  const info = req.body
  const values = [info.staff_id]

  const get_permissions = `SELECT * FROM staff_access WHERE staff_id = $1`

  const return_rows = (rows) => {
    res.json(rows)
  }

  query(get_permissions, values)
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
      res.status(500).send('Failed to get staff permissions')
    })
}

exports.delete_all_permissions_for_staff = (req, res, next) => {
  const info = req.body
  const values = [info.staff_id]

  const del_perm = `DELETE FROM staff_access WHERE staff_id = $1`

  query(del_perm, values)
  .then((data) => {
    res.json({
      message: 'deleted staff access'
    })
  })
  .catch((error) => {
    console.log(error)
    res.status(500).send('Failed to delete staff permissions')
  })
}
