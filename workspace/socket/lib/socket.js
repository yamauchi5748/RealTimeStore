const authSetting = require("../config/auth.json");
const user = require("./user");
// mogodbを管理するdboを生成
const dbo = require('./mongo');
const Mongo = require('mongodb');
const ObjectID = Mongo.ObjectID;
const DB_name = "database";
const auth_DB_name = authSetting.DBName;
const auth_collection = "users";

// socketでの処理を記述
exports.onConnection = function (io) {
    return function (socket) {
        // documentGet
        socket.on('doc/get', async (collection_name, _id) => {

            const object_id = ObjectID(_id);
            const pipline = []
            pipline.push({
                $match: {
                    _id: object_id
                }
            });

            const result = await dbo.aggregate(DB_name, collection_name, pipline);

            socket.emit('doc/get', result[0]);
        });

        // documentSet
        socket.on('doc/set', async (collection_name, _id, doc) => {

            const object_id = ObjectID(_id);
            const key = {
                $set: doc
            }
            const pipline = []
            pipline.push({
                $match: {
                    _id: object_id
                }
            });

            await dbo.update(DB_name, collection_name, object_id, key);
            const result = await dbo.aggregate(DB_name, collection_name, pipline);

            io.sockets.emit(`snapshot/${collection_name}`, result[0]);
            io.sockets.emit(`snapshot/${_id}`, result[0]);
            socket.emit('doc/set', result[0]);
        });

        // documentUpdate
        socket.on('doc/update', async (collection_name, _id, doc) => {

            const object_id = ObjectID(_id);
            const key = {
                $set: doc
            }
            const pipline = []
            pipline.push({
                $match: {
                    _id: object_id
                }
            });

            await dbo.update(DB_name, collection_name, object_id, key);
            const result = await dbo.aggregate(DB_name, collection_name, pipline);

            io.sockets.emit(`snapshot/${collection_name}`, result[0]);
            io.sockets.emit(`snapshot/${_id}`, result[0]);
            socket.emit('doc/update', result[0]);
        });

        // documentDelete
        socket.on('doc/delete', async (collection_name, _id) => {

            const object_id = ObjectID(_id);

            const result = await dbo.delete(DB_name, collection_name, object_id);

            io.sockets.emit(`snapshot/${collection_name}`, result.deletedCount > 0);
            io.sockets.emit(`snapshot/${_id}`, result.deletedCount > 0);
            socket.emit('doc/delete', result.deletedCount > 0);
        });

        // collectionAdd
        socket.on('add', async (collection_name, doc) => {
            if (!doc) {
                socket.emit('connect_error', 'No doc!');
                return;
            }

            await dbo.insert(DB_name, collection_name, doc);
            const result = await dbo.aggregate(DB_name, collection_name, []);

            io.sockets.emit(`snapshot/${collection_name}`, result);
            socket.emit('add', result);
        });

        // collectionGet
        socket.on('get', async (collection_name, query) => {

            const result = await dbo.aggregate(DB_name, collection_name, query);

            socket.emit('get', result);
        });

        // collectionDrop
        socket.on('drop', async (collection_name) => {

            const result = await dbo.drop(DB_name, collection_name);

            io.sockets.emit(`snapshot/${collection_name}`, result);
            socket.emit('drop', result);
        });

        // sighin
        socket.on('signIn', async (id, pass) => {
            if (!id || !pass) {
                socket.emit('connect_error', 'No id or pass!');
                return;
            }

            const pipline = []
            pipline.push({
                $match: {
                    _id: id,
                    password: pass
                }
            });

            const result = await dbo.aggregate(auth_DB_name, auth_collection, pipline);

            socket.emit('signIn', !!result[0]);
        });

        // createUser
        socket.on('create/user', async (id, pass) => {
            if (!id || !pass) {
                socket.emit('connect_error', 'No id or pass!');
                return;
            }

            const result = await user.create(id, pass);

            socket.emit('create/user', result.ops[0]);
        });
    }
}