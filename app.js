const express = require('express')
const app = express()

const testName = "啦啦啦啦"

// 配置代理跨域
const cors = require('cors')
app.use(cors())

const config = require('./config')

// 解析接收的params参数
const bodyParser = require('body-parser');    //首先引入插件
app.use(bodyParser.urlencoded({  //配置
  extended: true
}));
app.use(bodyParser.json());

// const { expressjwt: expressJWT } = require('express-jwt')
// app.use(expressJWT({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api\//] }))

// 导入路由
const userRouter = require('./router/user')
const strategyRouter = require('./router/strategy')
const sceneRouter = require('./router/scene')
const orderRouter = require('./router/order')
const commonRouter = require('./router/common')
const hotelRouter = require('./router/hotel')
const tourRouteHandler = require('./router/tour_route')

app.use('/api', userRouter)
app.use('/api', strategyRouter)
app.use('/api', sceneRouter)
app.use('/api', orderRouter)
app.use('/api', commonRouter)
app.use('/api', hotelRouter)
app.use('/api', tourRouteHandler)
app.use('/uploads', express.static('uploads'))


app.listen(config.PORT, () => {
  console.log('旅游攻略管理系统服务器已启动在' + config.baseURL + ":" + config.PORT);
})