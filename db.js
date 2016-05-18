/**
 * Created by xiyuanbupt on 5/8/16.
 */

var MongoClient = require('mongodb').MongoClient;
var state = {
    db:null,
    spider_db : null
};

exports.connect = function(url,done){
    if(state.db) return done();
    MongoClient.connect(url,function(err,db){
        if(err) return done(err);
        state.db = db;
        done();
    });
};

exports.get = function() {
    return state.db;
};

exports.close = function (done) {
    if(state.db){
        state.db.close(function (err,result) {
            state.db = null;
            state.mode = null;
            done(err);
        });
    }
};

exports.connectSpiderDb = function (url,done) {
    if(state.spider_db)return done();
    MongoClient.connect(url, function (err,db) {
        if(err) return done(err);
        state.spider_db = db;
        done();
    })
};

exports.getSpiderDb = function () {
    return state.spider_db;
}
