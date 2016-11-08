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
            res.jsonp(docs);
        });
    }
};
//获得最近的媒体文件描述
var getLatestedMediaSUmmary = function () {
    return function (req,res){
        var coll = db.get().collection('media_summary');
        coll.find({
        }).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
            res.jsonp(docs);
        });
    }
};

//获得一段时间内某个爬虫爬取数据的情况
var getCrawlerStatusByNameAndTime;
getCrawlerStatusByNameAndTime = function (crawlerName) {
    return function (req, res) {
        var start = new Date(req.params.start);
        var end = new Date(req.params.end);
        if (isNaN(start.getDate()) || isNaN(end.getDate())) {
            res.status(400).send("Illegal Data String");
            return
        }
        var coll = db.get().collection('crawl_history');
        coll.find(
            {
                crawler: crawlerName,
                finish_time: {
                    $gte: start,
                    $lte: end
                }
            }
        ).toArray(
            function (err, docs) {
                res.jsonp(docs);
            }
        )
    }
};

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
        res.jsonp(docs);
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
            res.jsonp(val)
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
            res.jsonp(val);
        }
    })
});
/* 下面代码获得考拉对应的节目期数
 {
 "status": "ok",
 "data": {
 "title": "考拉FM",
 "legend": ["节目期数"],
 "xAxis": ["有声书", "音乐", "娱乐", "相声评书", "儿童", "3D体验馆", "资讯", "脱口秀", "情感生活", "历史人文", "外语", "教育培训",
 "百家讲坛", "广播剧", "戏曲", "电台", "商业财经", "IT科技", "健康养生", "校园", "旅游", "汽车", "动漫游戏", "电影", "名校公开课",
 "时尚生活", "其他"],
 "series": [{
 "name": "节目期数",
 "data": ["34", "75", "12", "75", "12", "75", "12", "75", "12", "120", "56", "64", "18", "12", "75", "12", "75", "12", "120",
 "56", "89", "58", "34", "75", "12", "75", "12"]
 }],
 "yUnit": "期"
 },
 "msg": "success"
 }
 */
router.get('/kaolaCategoryAlbumCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].kl.albumCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "考拉FM",
                    "legend": ["节目期数"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "节目期数",
                        "data": data,
                    }],
                    "yUnit": "期"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});

/* 下面代码获得蜻蜓对应的节目期数
 {
 "status": "ok",
 "data": {
 "title": "蜻蜓FM",
 "legend": ["节目期数"],
 "xAxis": ["有声书", "音乐", "娱乐", "相声评书", "儿童", "3D体验馆", "资讯", "脱口秀", "情感生活", "历史人文", "外语", "教育培训",
 "百家讲坛", "广播剧", "戏曲", "电台", "商业财经", "IT科技", "健康养生", "校园", "旅游", "汽车", "动漫游戏", "电影", "名校公开课",
 "时尚生活", "其他"],
 "series": [{
 "name": "节目期数",
 "data": ["34", "75", "12", "75", "12", "75", "12", "75", "12", "103", "56", "64", "18", "12", "75", "12", "75", "12", "110",
 "56", "89", "58", "75", "12", "120", "56", "64"]
 }],
 "yUnit": "期"
 },
 "msg": "success"
 }
 */
router.get('/qingtingCategoryAlbumCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].qt.albumCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "蜻蜓FM",
                    "legend": ["节目期数"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "节目期数",
                        "data": data,
                    }],
                    "yUnit": "期"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});
/* 下面代码获得喜马拉雅对应的节目期数
 {
 "status": "ok",
 "data": {
 "title": "喜马拉雅FM",
 "legend": ["节目期数"],
 "xAxis": ["有声书", "音乐", "娱乐", "相声评书", "儿童", "3D体验馆", "资讯", "脱口秀", "情感生活", "历史人文", "外语", "教育培训",
 "百家讲坛", "广播剧", "戏曲", "电台", "商业财经", "IT科技", "健康养生", "校园", "旅游", "汽车", "动漫游戏", "电影", "名校公开课",
 "时尚生活", "其他"],
 "series": [{
 "name": "节目期数",
 "data": ["120", "56", "89", "58", "34", "75", "12", "75", "12", "120", "56", "89", "58", "34", "75", "12", "75", "12", "120",
 "56", "89", "58", "34", "75", "12", "75", "12"]
 }],
 "yUnit": "期"
 },
 "msg": "success"
 }
 */
router.get('/xmlyCategoryAlbumCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].xmly.albumCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "喜马拉雅FM",
                    "legend": ["节目期数"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "节目期数",
                        "data": data,
                    }],
                    "yUnit": "期"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});

/*下面代码获得考拉的音频数量
 {
 "status": "ok",
 "data": {
 "title": "考拉FM",
 "legend": ["音频数量"],
 "xAxis": ["有声书", "音乐", "娱乐", "相声评书", "儿童", "3D体验馆", "资讯", "脱口秀", "情感生活", "历史人文", "外语", "教育培训",
 "百家讲坛", "广播剧", "戏曲", "电台", "商业财经", "IT科技", "健康养生", "校园", "旅游", "汽车", "动漫游戏", "电影", "名校公开课",
 "时尚生活", "其他"],
 "series": [{
 "name": "音频数量",
 "data": ["34", "75", "12", "75", "12", "75", "12", "75", "12", "120", "56", "64", "18", "12", "75", "12", "75", "12", "120",
 "56", "89", "58", "34", "75", "12", "75", "12"]
 }],
 "yUnit": "个"
 },
 "msg": "success"
 }
 */
router.get('/kaolaCategoryAudioCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].kl.audioCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "考拉FM",
                    "legend": ["音频数量"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "音频数量",
                        "data": data,
                    }],
                    "yUnit": "个"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});
//13752002090
/*获得xmly 中的音频数量
 */
router.get('/xmlyCategoryAudioCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].xmly.audioCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "喜马拉雅FM",
                    "legend": ["音频数量"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "音频数量",
                        "data": data,
                    }],
                    "yUnit": "个"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});
//获得蜻蜓FM 中的音频数量
router.get('/qtCategoryAudioCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].qt.audioCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "蜻蜓FM",
                    "legend": ["音频数量"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "音频数量",
                        "data": data,
                    }],
                    "yUnit": "个"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});
//10.109.245.13/trunk

//获得考拉FM 中音频的数量
router.get('/kaolaCategoryAudioCount', function (req,res) {
    var coll = db.get().collection('media_summary');
    coll.find({}).limit(1).sort({$natural:-1}).toArray(function (err,docs) {
        if(err){
            res.status(404).send('dataNotFound');
        }else{
            var xAxis = [],
                data = [];
            var tmp = docs[0].kl.audioCountPerCategory;
            for (var name in tmp){
                xAxis.push(name);
                data.push(tmp[name]);
            }
            var val = {
                "status": "ok",
                "data": {
                    "title": "考拉FM",
                    "legend": ["音频数量"],
                    "xAxis": xAxis,
                    "series": [{
                        "name": "音频数量",
                        "data": data,
                    }],
                    "yUnit": "个"
                },
                "msg": "success"
            };
            res.jsonp(val);
        }
    })
});

if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                if (i in list) {
                    value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
            }
            return undefined;
        }
    });
}


//获得dailySpider 每日爬取的期数
router.get('/dailyCrawlAlbumCount', function (req,res) {
    "use strict";
    var coll = db.getSpiderDb().collection('daily');
    //找最近七天的爬取数据并以接口的形式返回
    var start = new Date();
    start.setDate(start.getDate()-7);
    var end = new Date();
    coll.aggregate(
        [
            {
                $match:{
                    day:{
                        $gte:start,
                        $lte:end
                    }
                }
            },
            {
                $group:{
                    _id:"$key",
                    data:{
                        $push:{day:"$day",count:"$crawledCount"}
                    }
                }
            }
        ]

    ).toArray(
        function (err,docs) {
            if(err){
                res.status(404).send('dataNotFound');
            }else {
                var tmpDocs = {};
                docs.forEach(
                    function (doc) {
                        tmpDocs[doc['_id']] = new Array;
                        doc['data'].forEach(
                            function (item) {
                                var key = item['day'].toISOString().split('T')[0];
                                var value = item['count'];
                                tmpDocs[doc['_id']].push({
                                    day:key,
                                    count:value
                                })
                            }
                        );
                    }
                );
                var xAxis = [],
                    xmlyData = [],
                    klData = [],
                    qtData = [];
                var i_find = function(dataString){
                    return function (dayInfo) {
                        return dayInfo.day === dataString
                    }
                };
                for(var tmp = start;tmp<=end;tmp.setDate(tmp.getDate()+1)){
                    var dataString = tmp.toISOString().split('T')[0];
                    var m_find = i_find(dataString);
                    xAxis.push(dataString);
                    var xmlyValue;
                    if(tmpDocs['xmly_album']!=null) {
                        xmlyValue = tmpDocs['xmly_album'].find(m_find);
                    }
                    xmlyValue = xmlyValue ? xmlyValue.count : 0;
                    xmlyData.push(xmlyValue);
                    var klValue;
                    if(tmpDocs['kl_album']) {
                        klValue = tmpDocs['kl_album'].find(m_find);
                    }
                    klValue = klValue ? klValue.count:0;
                    klData.push(klValue);
                    var qtValue;
                    if(tmpDocs['qt_album']) {
                        qtValue = tmpDocs['qt_album'].find(m_find);
                    }
                    qtValue = qtValue ? qtValue.count:0;
                    qtData.push(qtValue);
                }
                var val = {
                    "status": "ok",
                    "data": {
                        "title": "点播日爬取量",
                        "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
                        "xAxis":xAxis,
                        "series": [{
                            "name": "喜马拉雅FM",
                            "data": xmlyData
                        }, {
                            "name": "考拉FM",
                            "data": klData,
                        }, {
                            "name": "蜻蜓FM",
                            "data": qtData
                        }],
                        "yUnit": "期"
                    },
                    "msg": "success"
                };
                res.jsonp(val);
            }
        }
    )
});

router.get('/dailyCrawlAudioCount', function (req,res) {
    var coll = db.getSpiderDb().collection('daily');
    //找最近七天的爬取数据并以接口的形式返回
    var start = new Date();
    start.setDate(start.getDate()-7);
    var end = new Date();
    coll.aggregate(
        [
            {
                $match:{
                    day:{
                        $gte:start,
                        $lte:end
                    }
                }
            },
            {
                $group:{
                    _id:"$key",
                    data:{
                        $push:{day:"$day",count:"$crawledCount"}
                    }
                }
            }
        ]
    ).toArray(
        function (err,docs) {
            if(err){
                res.status(404).send('dataNotFound');
            }else {
                var tmpDocs = {};
                docs.forEach(
                    function (doc) {
                        tmpDocs[doc['_id']] = new Array;
                        doc['data'].forEach(
                            function (item) {
                                var key = item['day'].toISOString().split('T')[0];
                                var value = item['count'];
                                tmpDocs[doc['_id']].push({
                                    day:key,
                                    count:value
                                })
                            }
                        );
                    }
                );
                var xAxis = [],
                    xmlyData = [],
                    klData = [],
                    qtData = [];
                var i_find = function(dataString){
                    return function (dayInfo) {
                        return dayInfo.day === dataString
                    }
                };
                for(var tmp = start;tmp<=end;tmp.setDate(tmp.getDate()+1)){
                    var dataString = tmp.toISOString().split('T')[0];
                    var m_find = i_find(dataString);
                    xAxis.push(dataString);
                    var xmlyValue;
                    if(tmpDocs['xmly_audio']!=null) {
                        xmlyValue = tmpDocs['xmly_audio'].find(m_find);
                    }
                    xmlyValue = xmlyValue ? xmlyValue.count : 0;
                    xmlyData.push(xmlyValue);
                    var klValue;
                    if(tmpDocs['kl_audio'] != null) {
                        klValue = tmpDocs['kl_audio'].find(m_find);
                    }
                    klValue = klValue ? klValue.count:0;
                    klData.push(klValue);
                    var qtValue;
                    if(tmpDocs['qt_audio'] != null) {
                        qtValue = tmpDocs['qt_audio'].find(m_find);
                    }
                    qtValue = qtValue ? qtValue.count:0;
                    qtData.push(qtValue);
                }
                var val = {
                    "status": "ok",
                    "data": {
                        "title": "点播日爬取音频文件元数据数量",
                        "legend": ["喜马拉雅FM", "考拉FM", "蜻蜓FM"],
                        "xAxis":xAxis,
                        "series": [{
                            "name": "喜马拉雅FM",
                            "data": xmlyData
                        }, {
                            "name": "考拉FM",
                            "data": klData,
                        }, {
                            "name": "蜻蜓FM",
                            "data": qtData
                        }],
                        "yUnit": "首"
                    },
                    "msg": "success"
                };
                res.jsonp(val);
            }
        }
    )
});

router.get('/dailyCrawlLiveCount', function (req,res) {
    var coll = db.getSpiderDb().collection('daily');
    var start = new Date();
    start.setDate(start.getDate()-7);
    var end = new Date();
    coll.aggregate(
        [
            {
                $match:{
                    day:{
                        $gte:start,
                        $lte:end
                    }
                }
            },
            {
                $group:{
                    _id:"$key",
                    data:{
                        $push:{day:"$day",count:"$crawledCount"}
                    }
                }
            }
        ]
    ).toArray(
        function (err,docs) {
            if(err){
                res.status(404).send('dataNotFound');
            }else {
                var tmpDocs = {};
                docs.forEach(
                    function (doc) {
                        tmpDocs[doc['_id']] = new Array;
                        doc['data'].forEach(
                            function (item) {
                                var key = item['day'].toISOString().split('T')[0];
                                var value = item['count'];
                                tmpDocs[doc['_id']].push({
                                    day:key,
                                    count:value
                                })
                            }
                        );
                    }
                );
                var xAxis = [],
                    EPGData = [],
                    live_sourceDate = [];
                var i_find = function(dataString){
                    return function (dayInfo) {
                        return dayInfo.day === dataString
                    }
                };
                for(var tmp = start;tmp<=end;tmp.setDate(tmp.getDate()+1)){
                    var dataString = tmp.toISOString().split('T')[0];
                    var m_find = i_find(dataString);
                    xAxis.push(dataString);
                    if(tmpDocs['EPG'] != null) {
                        var EPGValue = tmpDocs['EPG'].find(m_find);
                        EPGValue = EPGValue ? EPGValue.count : 0;
                        EPGData.push(EPGValue);
                    }else {
                        EPGData.push(0);
                    }
                    if(tmpDocs['live_source'] != null) {
                        var lvData = tmpDocs['live_source'].find(m_find);
                        lvData = lvData ? lvData.count : 0;
                        live_sourceDate.push(lvData);
                    }else {
                        live_sourceDate.push(0);
                    }
                }
                var val = {
                    "status": "ok",
                    "data": {
                        "title": "直播日爬取量",
                        "legend": ["EPG", "live_source"],
                        "xAxis":xAxis,
                        "series": [{
                            "name": "EPG",
                            "data":EPGData
                        }, {
                            "name": "live_source",
                            "data": live_sourceDate,
                        }],
                        "yUnit": "首"
                    },
                    "msg": "success"
                };
                res.jsonp(val);
            }
        }
    )
})
module.exports = router;