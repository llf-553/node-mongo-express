const express = require('express');
let router = express.Router();
const articleModel = require('../db/articleModel');
const moment = require('moment'); //时间格式化
//首页路由
router.get('/', (req, res, next) => {
    // console.log(req.query)
    // 数据类型是number
    let page = parseInt(req.query.page || 1); //如果page没有传,默认是第一页
    let size = parseInt(req.query.size || 3); //如果size没有传,默认一页显示3条文章
    let username = req.session.username;
    //第一步：查询文章总数，并计算总页数
    articleModel.find().count().then(total => {
        //total是文章总条数
        //console.log(total)
        //计算总页数
        var pages = Math.ceil(total / size);
        //第二步：分页查询
        articleModel.find().sort({ 'createTime': -1 }).skip((page - 1) * size).limit(size)
            .then(docs => {
                // docs不是传统意义的js数组,要使用slice()方法把他转化成js数组
                var arr = docs.slice();
                for (let i = 0; i < arr.length; i++) {
                    // 添加一个新的字段,来表示格式化的时间,后面添加ZH表示已经格式化了
                    arr[i].createTimeZH = moment(arr[i].createTime).format('YYYY-MM-DD HH:mm:ss')
                };
                // console.log(arr)
                res.render('index', {
                    data: {
                        list: arr,
                        total: pages,
                        username
                    }
                })

            })
            .catch(err => {
                res.redirect('/')
            })
    })

})

//注册页路由
router.get('/regist', (req, res, next) => {
    res.render('regist', {})
})


//登录页路由
router.get('/login', (req, res, next) => {
    res.render('login', {})
})

//写文章/编辑文章页路由
router.get('/write', (req, res, next) => {
    //获取文章id
    var id = req.query.id;
    if (id) {
        //编辑
        id = new Object(id);
        //用id查询
        articleModel.findById(id).then(doc => {
                console.log(doc)
                res.render('write', { doc, username: req.session.username })
            })
            .catch(err => {
                res.dredirect('/')
            })
    } else {
        //新增
        var doc = {
            _id: "",
            username: req.session.username,
            title: "",
            content: ""
        };
        res.render('write', { doc, username: req.session.username })
    }

})

//详情页路由
router.get('/detail', (req, res, next) => {
    var id = req.query.id;
    // 用id查询
    articleModel.findById(id).then(doc => {
            doc.createTimeZH = moment(doc.createTime).format('YYYY-MM-DD HH:mm:ss');
            res.render('detail', {
                doc,
                username: req.session.username
            })
        })
        .catch(err => {
            res.send(err)
        })

})

module.exports = router;