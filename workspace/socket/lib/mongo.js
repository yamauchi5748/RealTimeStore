const Mongo = require('mongodb')
const MongoClient = Mongo.MongoClient;
const url = 'mongodb://mongodb:27017';

//DBからObjectを取得
exports.aggregate = function (DB_name, collection, key) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (error, database) {
            if (error) reject(error);
            const dbo = database.db(DB_name);
            dbo.collection(collection).aggregate(key).toArray(function (err, result) {
                if (err) reject(err);
                database.close();
                resolve(result)
            });
        });
    })
        .catch(function (err) {
            console.log(err);
        })
};

//ObjectをDBに挿入する
exports.insert = function (DB_name, collection, object) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (error, database) {
            if (error) reject(error);
            const dbo = database.db(DB_name);
            dbo.collection(collection).insertOne(object, function (err, result) {
                if (err) reject(err);
                database.close();
                resolve(result);
            });
        });
    })
        .catch(function (err) {
            console.log(err);
        })
}

//Objectの変更をDBに反映
exports.update = function (DB_name, collection, ObjectID, key) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (error, database) {
            if (error) reject(error);
            const dbo = database.db(DB_name)
            const match = {
                _id: ObjectID
            };
            console.log(ObjectID, key)
            dbo.collection(collection).updateOne(match, key, function (err, result) {
                if (err) reject(err);
                database.close();
                resolve(result);
            });
        });
    })
        .catch(function (err) {
            console.log(err);
        })
}

//ObjectをDBから削除
exports.delete = function (DB_name, collection, ObjectID) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (error, database) {
            if (error) reject(error);
            const dbo = database.db(DB_name);
            const match = {
                _id: ObjectID
            }
            console.log(ObjectID);
            dbo.collection(collection).deleteOne(match, function (err, result) {
                if (err) reject(err);
                database.close();
                resolve(result);
            });
        });
    })
        .catch(function (err) {
            console.log(err);
        })
}

// CollectionをDBから削除
exports.drop = function (DB_name, collection) {
    return new Promise(function (resolve, reject) {
        MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function (error, database) {
            if (error) reject(error);
            const dbo = database.db(DB_name);
            dbo.collection(collection).drop(function (err, result) {
                if (err) reject(err);
                database.close();
                resolve(result);
            });
        });
    })
        .catch(function (err) {
            console.log(err);
        })
}