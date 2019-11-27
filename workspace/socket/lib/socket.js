const config = require("../config/config.json");
const User = require("../models/user");
const dbo = require('./mongo');
const Mongo = require('mongodb');

const ObjectID = Mongo.ObjectID;
const DB_name = config.data.DB_name;

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
        socket.on('add', async (collection_name, doc, query) => {
            if (!doc) {
                socket.emit('connect_error', 'No doc!');
                return;
            }

            await dbo.insert(DB_name, collection_name, doc);
            const result = await dbo.aggregate(DB_name, collection_name, query);

            io.sockets.emit(`snapshot/${collection_name}`, result);
            socket.emit('add', result);
        });

        // collectionGet
        socket.on('get', async (collection_name, query) => {
            console.log(socket.request.session)

            const result = await dbo.aggregate(DB_name, collection_name, query);

            socket.emit('get', result);
        });

        // collectionDrop
        socket.on('drop', async (collection_name) => {

            const result = await dbo.drop(DB_name, collection_name);

            io.sockets.emit(`snapshot/${collection_name}`, result);
            socket.emit('drop', result);
        });

        // signin
        socket.on('signIn', async (auth_field, password) => {

            console.log(socket.request.session.user);

            // Auth_fields check
            if (!auth_field) {
                socket.emit('connect_error', 'No auth_field. auth_filed must exist!');
                return;

            } else if (!password) {
                socket.emit('connect_error', 'password does not exist. password must exist!');
                return;
            }

            const result = await User.authorize(auth_field, password);

            /** register userInfo to session **/
            if (result.length === 1) socket.request.session.user = result[0];

            socket.emit('signIn', result[0]);
        });

        // createUser
        socket.on('create/user', async (user) => {

            /* request user and password must be matched config.auth */
            if (!user[config.auth.AuthField] || !user['password']) {
                socket.emit('connect_error', 'User must have AuthField and password. please reference config!');
                return;
            }

            const result = await User.create(user);

            socket.emit('create/user', result);
        });
    }
}