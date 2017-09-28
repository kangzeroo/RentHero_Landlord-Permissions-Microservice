const Promise = require('bluebird')
const { promisify } = Promise
const pool = require('../Postgres/db_connect')
const uuid = require('uuid')

const query = promisify(pool.query)

// stringify_rows: Convert each row into a string
const stringify_rows = res => res.rows.map(row => JSON.stringify(row))

//log_through: log each row
const log_through = data => {
  return data
}

const retrieveBuildingID = function(url) {
  let building_id
  const building_id_loc = url.indexOf('buildings/')
  if (url.indexOf('/suite/') !== -1) {
    const building_id_loc_end = url.indexOf('/suite/')
    building_id = url.slice(building_id_loc+10, building_id_loc_end)
  } else if (url.indexOf('?tab=') !== -1) {
    const building_id_loc_end = url.indexOf('?tab=')
    building_id = url.slice(building_id_loc+10, building_id_loc_end)
  } else {
    building_id = url.slice(building_id_loc + 10)
    if (building_id[building_id.length - 1] === '/') {
      building_id = building_id.slice(0, -1)
    }
  }
  return building_id
}

exports.permCheck = function(req, res, next){
	const staff_id = req.headers.staff_id
  const corp_id = req.headers.corporation_id
  const referer = req.headers.referer

  const building_id = retrieveBuildingID(referer)
  let permCheck = `SELECT * FROM general_access WHERE staff_id = '${staff_id}'
                                                  AND corporation_id = '${corp_id}'
                                                  AND building_id = '${building_id}'`

  const return_rows = (rows) => {
    res.json(rows)
  }

  // console.log('MYASS')
  // console.log({
  //   staff_id,
  //   corp_id,
  //   building_id,
  // })

  query(permCheck)
    .then((data) => {
      // console.log(data.rowCount)
      if (data.rowCount > 0) {
        // console.log("Permission Granted")
        next()
      } else {
        // console.log("Permission Denied")
        res.send('Permission Denied')
      }
    })
}
