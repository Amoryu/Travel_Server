const db = require('../db/index');
const uuid = require('node-uuid')
const { ResultCodeEnum, TABLE } = require('../common/constant.js')
const config = require('../config.js')

exports.getScene = (req, res) => {
  console.log(req.body)
  const sql = `select * from ${TABLE.Scenery} where name = "${req.body.sceneryName}"`


  db.query(sql, (err, results) => {
    console.log(err, results)
    results = results.map(item => ({ ...item, isOpen: item.isOpen ? true : false }))
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "获取景点成功",
      data: results
    })
  })
}

exports.getSwiper = (req, res) => {
  const sql = 'select * from t_swiper'

  db.query(sql, (err, results) => {
    res.send({
      status: 0,
      msg: "获取轮播图成功",
      data: results
    })
  })


}

exports.getTickets = (req, res) => {
  // console.log(req.body, req.params, req.query)
  const sql = `select * from t_tickets where scene_id="${req.body.scene_id}"`
  db.query(sql, (err, results) => {
    // console.log(err, results)

    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "获取该景点的门票成功",
      data: results
    })
  })
}

exports.setTicket = (req, res) => {
  console.log(req.body)
  const ticketInfo = {
    id: uuid.v4(),
    type: req.body.type,       // adult, student, child
    ticket_name: req.body.ticket_name,
    price: req.body.price,
    scene_id: req.body.scene_id,
    count: req.body.count,
  }
  const sql = 'insert t_tickets set ?'

  db.query(sql, ticketInfo, (err, results) => {
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: 0,
      msg: "添加门票失败！"
    });
    return res.send({
      code: 1,
      ticketInfo,
      msg: "添加门票成功"
    });
  })
}

exports.search_scene = (req, res) => {
  // console.log(req.body)
  const keyword = "%" + req.body.search + "%"
  const sql = `select * from ${TABLE.Scenery} where name like ?`
  // console.log(keyword)

  db.query(sql, keyword, (err, results) => {
    // console.log(err, results)
    if (err) return res.send(err);
    if (results.length) {
      res.send({
        data: {
          code: ResultCodeEnum.SUCCESS,
          data: results,
          msg: "搜索成功！"
        }
      })
    } else {
      res.send({
        data: {
          code: 400,
          msg: "搜索失败！"
        }
      })
    }
  })

}


exports.get_billboard = (req, res) => {
  // console.log(req.body)

  const sql = `select * from t_scene where scene_area = "${req.body.city}"`

  db.query(sql, (err, results) => {
    // console.log(err, results)
    if (err) return res.send(err);
    if (results.length) {
      res.send({
        code: 1,
        data: results,
        msg: "获取排行榜成功！"
      })
    } else {
      res.send({
        data: {
          code: 0,
          msg: "获取排行榜失败！"
        }
      })
    }
  })
}


exports.ticketPayment = (req, res) => {
  // console.log("门票订单", req.body)
  const sql = `insert ${TABLE.Order} set ?`
  let now = new Date()
  const ticket = req.body.ticket
  console.log(ticket)
  const scenery = req.body.scenery
  const userInfo = req.body.userInfo
  const insertObj = {
    orderNo: uuid.v4(),
    name: ticket.name,
    type: '门票',
    amount: ticket.amount,
    createTime: now.toLocaleDateString() + "：" + now.toLocaleTimeString(),
    state: 2,
    seller: scenery.name,
    peopleNum: req.body.ticketNum,
    usertoken: userInfo.token,
    userwxtoken: userInfo.wxtoken,
    coverImg: scenery.image,
    bookDay: req.body.day,
    bookSession: req.body.session,
  }

  // console.log(insertObj)

  db.query(sql, insertObj, (err, results) => {
    // console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "提交订单成功",
      data: insertObj
    })
  })

}



// 后台管理系统的接口
exports.back_getScenery = (req, res) => {
  let sql = `select * from ${TABLE.Scenery} where province = "${req.body.province}" `
  if (req.body.city && req.body.city !== '') {
    sql = sql + `and city = "${req.body.city}" `
  }
  if (req.body.area && req.body.area !== '') {
    sql = sql + `and area = "${req.body.area}"`
  }

  db.query(sql, (err, results) => {
    // console.log(err, results)
    results = results.map(item => ({ ...item, isOpen: item.isOpen ? true : false }))
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "后台管理系统_获取景点列表成功",
      data: results
    })
  })
}


exports.postImage = (req, res) => {
  // console.log(req.file)

  res.send({
    code: ResultCodeEnum.SUCCESS,
    data: {
      fileUrl: config.baseURL + ":" + config.PORT + '/uploads/' + req.file.filename,
    }
  })

}


exports.addScenery = (req, res) => {
  // console.log(req.body)
  const insertObj = {
    id: uuid.v4(),
    ...req.body,
    isOpen: 1,
  }

  const sql = `insert ${TABLE.Scenery} set ?`

  db.query(sql, insertObj, (err, results) => {
    // console.log(err, results)
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: 500,
      msg: "后台管理系统-添加景点失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      data: insertObj,
      msg: "后台管理系统-添加景点成功"
    });
  })

}

exports.editScenery = (req, res) => {
  const id = req.body.id
  const updateObj = {
    ...req.body,
  }
  delete updateObj.id
  delete updateObj.rank

  const field = 'name=?, ' +
    'description=?, ' +
    'province:=?, ' +
    'city=?, ' +
    'area=?, ' +
    'provinceName=?, ' +
    'cityName=?, ' +
    'areaName=?, ' +
    'image=?, ' +
    'isOpen=?, ' +
    'address=?'

  // console.log(updateObj)
  const sql = `update ${TABLE.Scenery} set ${field} where id = "${id}"`
  db.query(sql, Object.values(updateObj), (err, results) => {
    // console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "更新景点信息成功",
      data: results
    })
  })

}


exports.back_SceneryOpen = (req, res) => {
  // console.log(req.body)
  let isOpen = req.body.isOpen ? 1 : 0
  let sql = `update ${TABLE.Scenery} set isOpen = ? where name = "${req.body.name}"`

  db.query(sql, isOpen, (err, results) => {
    // console.log(err, results)

    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: isOpen ? "景点开放成功" : '景区暂停开放',
      data: results
    })
  })
}


exports.back_sceneList = (req, res) => {
  let sql = `select * from ${TABLE.Scenery}`

  db.query(sql, (err, results) => {
    results = results.map(item => ({ ...item, isOpen: item.isOpen ? true : false }))
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "后台管理系统_获取景点列表成功",
      data: results
    })
  })
}


exports.back_getTickets = (req, res) => {
  // console.log(req.body)
  let sql = `select * from ${TABLE.Ticket} where sceneName = "${req.body.sceneName}" `

  db.query(sql, (err, results) => {
    // console.log(err, results)

    results = results.map(item => ({ ...item, onSale: item.onSale ? true : false }))
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "获取该景点的门票成功",
      data: results
    })
  })
}

exports.back_addTicket = (req, res) => {
  // console.log(req.body)

  const regionData = req.body.region

  const insertObj = {
    id: uuid.v4(),
    ...req.body,
    region: req.body.province + req.body.city + req.body.area,
    onSale: 1,
    sold: 0,
  }

  const sql = `insert ${TABLE.Ticket} set ?`

  db.query(sql, insertObj, (err, results) => {
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: 500,
      msg: "后台管理系统-添加门票失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      data: insertObj,
      msg: "后台管理系统-添加门票成功"
    });
  })
}

exports.back_editTicket = (req, res) => {
  const id = req.body.id
  const updateObj = {
    ...req.body,
  }
  delete updateObj.id

  const field = 'name=?, ' +
    'type=?, ' +
    'price=?, ' +
    'onSale=?, ' +
    'description=?, ' +
    'sceneName=?, ' +
    'sold=?'

  // console.log(updateObj)
  const sql = `update ${TABLE.Ticket} set ${field} where id = "${id}"`
  db.query(sql, Object.values(updateObj), (err, results) => {
    // console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "更新门票信息成功",
      data: results
    })
  })
}

exports.back_TicketOnSale = (req, res) => {
  // console.log(req.body)
  let onSale = req.body.onSale ? 1 : 0
  let sql = `update ${TABLE.Ticket} set onSale = ? where area = "${req.body.area}" and name = "${req.body.name}" `

  db.query(sql, onSale, (err, results) => {
    // console.log(err, results)

    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "上架门票成功",
      data: results
    })
  })
}

