/**
 * Created by xiyuanbupt on 5/8/16.
 */

var express = require('express');
var router = express.Router();

var db = require('../db');
var getRealTimeFor = function(collectionName){
    return function (req,res){
        var coll = db.get().collection(collectionName);
        coll.find(
            {},
            {
                totalCrawledPages:1,
                pagePerMin:1,
                totalCrawledItems:1,
                crawledItemsPerMin:1,
                "crawledTime":1,
                _id:0
            }
        ).limit(100).toArray(function (err,docs) {
            res.json(docs);
        });
    }
};
//获得最近的媒体文件描述
var getLatestedMediaSUmmary = function () {
    return function (req,res){
        var coll = db.get().collection('media_summary');
        coll.find({
        }).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
            res.json(docs);
        });
    }
}
//获得一段时间内某个爬虫爬取数据的情况
var getCrawlerStatusByNameAndTime = function(
    crawlerName
){
    return function (req,res){
        var start = new Date(req.params.start);
        var end = new Date(req.params.end);
        if(isNaN(start.getDate()) || isNaN(end.getDate())){
            res.status(400).send("Illegal Data String");
            return
        }
        var coll = db.get().collection('crawl_history');
        console.log(start ,end );
        coll.find(
            {
                crawler:crawlerName,
                finish_time:{
                    $gte:start,
                    $lte:end
                }
            }
        ).toArray(
            function (err,docs) {
                res.json(docs);
            }
        )
    }
}

router.get('/', function (req,res,next) {
    res.send('get');
});

router.get('/realTime/kaolaEPG', function (req,res) {
    var coll = db.get(
    ).collection('kaolaEPG');
    coll.find(
        {},
        {
            totalCrawledPages:1,
            pagePerMin:1,
            totalCrawledItems:1,
            crawledItemsPerMin:1,
            _id:0
        }
    ).toArray(function (err,docs) {
        res.json(docs);
    });
});
router.get('/realTime/xmly',getRealTimeFor('xmly'));
router.get('/realTime/qt',getRealTimeFor('qt'));
router.get('/realTime/qingtinglive',getRealTimeFor('qingtinglive'));
router.get('/realTime/kl',getRealTimeFor('kl'));
/*获得相应网站的专辑期数*/
//获得网站的媒体文件的总大小与媒体文件的总个数
router.get('/categoryCount/all',getLatestedMediaSUmmary());
router.get('/fileCount/all',getLatestedMediaSUmmary());
router.get('/fileSize/all',getLatestedMediaSUmmary());

//获得爬虫进程在一段时间内运行的整体状况
router.get('/crawlHistory/kaolaEPG/:start/:end',getCrawlerStatusByNameAndTime(
    'kaolaEPG'
));


/*
获得点播总爬取量
 {
 "status": "ok",
 "data": {
 "title": "点播总爬取量",
 "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
 "seriesName": "总爬取量",
 "seriesData": [{
 "name": "喜马拉雅FM",
 "value": "1235"
 }, {
 "name": "考拉FM",
 "value": "5126"
 }, {
 "name": "蜻蜓FM",
 "value": "982"
 }],
 "unit": "期"
 },
 "msg": "success"
 }
 */
router.get('/totalCrawledAlbumCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var val = {
                status:"ok",
                data:{
                    title:"点播总爬取量",
                    legend:["喜马拉雅FM","考拉FM","蜻蜓FM"],
                    seriesName:"总爬取量",
                    seriesData:[
                        {
                            name:"喜马拉雅FM",
                            value : docs[0].xmly.totalAlbumCount
                        },
                        {
                            name:"考拉FM",
                            value:docs[0].kl.totalAlbumCount
                        },
                        {
                            name:"蜻蜓FM",
                            value:docs[0].qt.totalAlbumCount
                        }
                    ],
                    unit:"期"
                },
                msg:"success"
            };
            res.json(val)
        }
    })
});
/*下面代码获得总的媒体文件数量,格式示例为
 {
 "status": "ok",
 "data": {
 "title": "总媒体文件数量",
 "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
 "seriesName": "文件数量",
 "seriesData": [{
 "name": "喜马拉雅FM",
 "value": "2548"
 }, {
 "name": "考拉FM",
 "value": "9852"
 }, {
 "name": "蜻蜓FM",
 "value": "1123"
 }],
 "unit": "个"
 },
 "msg": "success"
 }

 */
router.get('/totalCrawledAudioCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var val = {
                "status": "ok",
                "data": {
                    "title": "总媒体文件数量",
                    "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
                    "seriesName": "文件数量",
                    "seriesData": [{
                        "name": "喜马拉雅FM",
                        "value": docs[0].xmly.totalAudioCount
                    }, {
                        "name": "考拉FM",
                        "value": docs[0].kl.totalAudioCount
                    }, {
                        "name": "蜻蜓FM",
                        "value": docs[0].qt.totalAudioCount
                    }],
                    "unit": "个"
                },
                "msg": "success"
            }
            res.send(val);
        }
    });
});

/* 下面代码获得总的媒体文件大小,单位为G
 {
 "status": "ok",
 "data": {
 "title": "总媒体文件存储大小",
 "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
 "seriesName": "文件存储大小",
 "seriesData": [{
 "name": "喜马拉雅FM",
 "value": "2.54"
 }, {
 "name": "考拉FM",
 "value": "9.52"
 }, {
 "name": "蜻蜓FM",
 "value": "1.12"
 }],
 "unit": "T"
 },
 "msg": "success"
 }
 */
router.get('/totalCrawledFileSize',function(req,res){
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function(err,docs){
        if(err){
            res.status(404).send('dataNotFount');
        }else{
            var val = {
                status:"ok",
                data:{
                    title:"总媒体文件大小",
                    legend:["喜马拉雅FM","考拉FM","蜻蜓FM"],
                    seriesName : "文件存储大小",
                    seriesData:[
                        {
                            name : "喜马拉雅FM",
                            value:docs[0].xmly["totalAudioSize(bytes)"]/1024/1024/1024
                        },
                        {
                            name:"考拉FM",
                            value:docs[0].kl["totalAudioSize(bytes)"]/1024/1024/1024
                        },
                        {
                            name:"蜻蜓FM",
                            value:docs[0].qt["totalAudioSize(bytes)"]/1024/1024/1024
                        }
                    ],
                    unit : "G",
                },
                msg:"success"
            };
            res.json(val);
        }
    })
});


module.exports = router;