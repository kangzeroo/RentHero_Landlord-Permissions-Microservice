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

exports.send_admin_invite = (req, res, next) => {
  const info = req.body
  const query_string = `SELECT * FROM table`
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

exports.send_admin_invite = (req, res, next) => {
  const info = req.body
  const query_string = `SELECT * FROM table`
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
