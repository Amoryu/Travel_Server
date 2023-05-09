const db = require('../db/index');
const path = require('path')
const fs = require('fs')
const uuid = require('node-uuid')
const { ResultCodeEnum, TABLE } = require('../common/constant.js')
const config = require('../config')

// 小程序接口
exports.get_strategy = (req, res) => {
  const sql = `select * from ${TABLE.Strategy}`

  db.query(sql, (err, results) => {
    res.send({
      status: 0,
      msg: "获取攻略列表成功",
      data: results
    })
  })
}

exports.get_my_strategy = (req, res) => {
  // console.log(req.body)
  const sql = `select * from ${TABLE.Strategy} where userName = "${req.body.userName}"`

  db.query(sql, (err, results) => {
    // console.log(err, results)
    res.send({
      status: 0,
      msg: "获取我的攻略列表成功",
      data: results
    })
  })
}

exports.publish_strategy = (req, res) => {
  let date = new Date()
  const articleInfo = {
    id: uuid.v4(),
    ...req.body,
    coverImg: config.baseURL + ":" + config.PORT + '/uploads/' + req.file.filename,
    publishtime: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  }
  const sql = `insert ${TABLE.Strategy} set ?`

  db.query(sql, articleInfo, (err, results) => {
    // console.log(err, results)
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: 400,
      msg: "发布文章失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      articleInfo,
      msg: "发布文章成功！"
    });
  })
}

exports.postImage = (req, res) => {
  // console.log(req.file)
  let lastPicture = null
  db.query(`select coverImg from ${TABLE.Strategy} where id="${req.body.id}"`, (err, results) => {
    // console.log(results)
    lastPicture = results[0].coverImg
    // console.log('上一张图片的文件名', lastPicture)
    if (req.file.filename) {
      fs.unlink(`./uploads/${lastPicture.split('uploads/')[1]}`, (err) => {
        if (err) throw err;
        // console.log(lastPicture.split('uploads/')[1] + '文件已删除');
      });
    }
  })
  res.send({
    code: ResultCodeEnum.SUCCESS,
    coverImg: config.baseURL + ":" + config.PORT + '/uploads/' + req.file.filename,
  })

}

exports.editContent = (req, res) => {
  // console.log("接收到了", req.body)

  const newArticleInfo = {
    ...req.body,
  }
  const sql = `update ${TABLE.Strategy} set title = ?, content = ?, coverImg = ?,type = ?,duration = ?,perCost = ? where id ="${req.body.id}"`

  db.query(sql, [
    newArticleInfo.title,
    newArticleInfo.content,
    newArticleInfo.coverImg,
    newArticleInfo.type,
    newArticleInfo.duration,
    newArticleInfo.perCost
  ], (err, results) => {
    // console.log(err, results)
    if (results.affectedRows !== 1) return res.send({
      code: 400,
      msg: "修改文章失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      newArticleInfo,
      msg: "修改文章成功！"
    });
  })
}

exports.get_strategy_type = (req, res) => {
  const sql = `select * from ${TABLE.StrategyCategory}`

  db.query(sql, (err, results) => {
    res.send({
      status: 0,
      msg: "获取攻略分类成功",
      data: results
    })
  })
}

exports.delete_strategy = (req, res) => {
  // console.log(req.body)
  const sql = `delete from t_strategy where id="${req.body.id}"`

  db.query(sql, (err, results) => {
    // console.log(err, results)
    res.send({
      status: 0,
      msg: "删除攻略成功",
      data: results
    })
  })
}

exports.get_collectStrategy = (req, res) => {
  console.log(req.body, TABLE.Collection)
  const sql = `select * from ${TABLE.Strategy} where id in (select strategy_id from ${TABLE.Collection} where username = "${req.body.username}")`
  db.query(sql, (err, results) => {
    console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "获取收藏夹成功",
      data: results
    })
  })
}

exports.getCollectState = (req, res) => {
  // console.log(req.body)
  const sql = `select * from ${TABLE.Collection} where username = "${req.body.username}" and strategy_id = "${req.body.strategy_id}"`
  db.query(sql, (err, results) => {
    // console.log(err, results)
    const state = results.length !== 0
    res.send({
      code: state ? ResultCodeEnum.SUCCESS : ResultCodeEnum.Error,
      msg: state ? "该文章被收藏" : "该文章未被收藏",
      data: state,
    })
  })
}

exports.collectStrategy = (req, res) => {
  console.log(req.body)
  const { strategy_id, username, isCollect } = req.body
  let sql = `insert ${TABLE.Collection} set ?`

  if (isCollect) {
    const insertObj = {
      strategy_id,
      username
    }
    db.query(sql, insertObj, (err, results) => {
      console.log(err, results)
      res.send({
        code: ResultCodeEnum.SUCCESS,
        msg: "收藏攻略成功",
        data: results
      })
    })
  } else {
    sql = `delete from ${TABLE.Collection} where strategy_id = "${req.body.strategy_id}"`
    db.query(sql, (err, results) => {
      console.log(err, results)
      res.send({
        code: ResultCodeEnum.SUCCESS,
        msg: "取消收藏攻略成功",
        data: results
      })
    })
  }
  // const sql = `select * from ${TABLE.Strategy} where id in (select strategy_id from ${TABLE.Collection} where username = "${req.body.username}")`
  // db.query(sql, (err, results) => {
  //   console.log(err, results)
  //   res.send({
  //     code: ResultCodeEnum.SUCCESS,
  //     msg: "获取收藏夹成功",
  //     data: results
  //   })
  // })
}


// 后台管理系统接口
// 攻略分类
exports.back_getStrategyCate = (req, res) => {
  const sql = `select * from ${TABLE.StrategyCategory}`

  db.query(sql, (err, results) => {
    results = results.map(item => ({ ...item, isShow: item.isShow ? true : false }))
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "获取攻略分类成功",
      data: results
    })
  })
}

exports.back_addStrategyCate = (req, res) => {
  // console.log(req.body)
  const insertObj = {
    id: uuid.v4(),
    ...req.body,
    isShow: 1
  }
  const sql = `insert ${TABLE.StrategyCategory} set ?`

  db.query(sql, insertObj, (err, results) => {
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: ResultCodeEnum.ERROR,
      msg: "添加攻略分类失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      insertObj,
      msg: "添加攻略分类成功！"
    });
  })
}

exports.back_setStrategyCateShow = (req, res) => {
  // console.log(req.body)
  let isShow = req.body.isShow ? 1 : 0
  let sql = `update ${TABLE.StrategyCategory} set isShow = ? where name = "${req.body.name}" `

  db.query(sql, isShow, (err, results) => {
    // console.log(err, results)

    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: isShow ? "类型已展示" : "类型已关闭",
      data: results
    })
  })
}

exports.back_editStrategyCate = (req, res) => {
  const id = req.body.id
  const updateObj = {
    ...req.body,
  }
  delete updateObj.id

  const field = 'name=?, ' +
    'description=?, ' +
    'isShow=? '

  // console.log(updateObj)
  const sql = `update ${TABLE.StrategyCategory} set ${field} where id = "${id}"`
  db.query(sql, Object.values(updateObj), (err, results) => {
    // console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "更新攻略分类成功",
      data: results
    })
  })
}

// 攻略管理
exports.back_getStrategy = (req, res) => {
  // console.log(req.body)
  const sql = `select * from ${TABLE.Strategy} where type = "${req.body.type}" `

  db.query(sql, (err, results) => {
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "后台管理系统_获取攻略成功",
      data: results
    })
  })
}

exports.back_addStrategy = (req, res) => {
  // console.log(req.body)
  let date = new Date()
  const insertObj = {
    ...req.body,
    id: uuid.v4(),
    userId: 20230904,
    publishtime: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
  }
  // console.log(insertObj)

  const sql = `insert ${TABLE.Strategy} set ?`

  db.query(sql, insertObj, (err, results) => {
    if (err) return res.send(err);
    if (results.affectedRows !== 1) return res.send({
      code: ResultCodeEnum.Error,
      msg: "后台管理系统-添加攻略失败！"
    });
    return res.send({
      code: ResultCodeEnum.SUCCESS,
      data: insertObj,
      msg: "后台管理系统-添加攻略成功"
    });
  })
}

exports.back_editStrategy = (req, res) => {
  const id = req.body.id
  const updateObj = {
    ...req.body,
  }
  delete updateObj.id
  delete updateObj.publishtime
  delete updateObj.userId

  const field = 'title=?, ' +
    'content=?, ' +
    'coverImg=?, ' +
    'type=?, ' +
    'province:=?, ' +
    'city=?, ' +
    'area=?, ' +
    'provinceName=?, ' +
    'cityName=?, ' +
    'areaName=?, ' +
    'duration=?, ' +
    'address=?, ' +
    'perCost=?, ' +
    'mentionScenery=?'

  // console.log(updateObj)
  const sql = `update ${TABLE.Strategy} set ${field} where id = "${id}"`
  db.query(sql, Object.values(updateObj), (err, results) => {
    // console.log(err, results)
    res.send({
      code: ResultCodeEnum.SUCCESS,
      msg: "更新攻略信息成功",
      data: results
    })
  })
}