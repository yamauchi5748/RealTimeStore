const config = require("../config/config.json");
const dbo = require('../lib/mongo');
const Mongo = require('mongodb');

const ObjectID = Mongo.ObjectID;
const DB_name = config.auth.DBName;
const collection_name = 'users';

class User {

    async get(user_id) {
        const pipline = []
        pipline.push({
            $match: {
                _id: user_id
            }
        });

        const result = await dbo.aggregate(DB_name, collection_name, pipline);

        return result[0];
    };

    async create(user_id, password) {
        if (!user_id || !password) {
            return 'error';
        }

        const user = {
            _id: user_id,
            password: password
        }

        console.log(user);

        const result = await dbo.insert(DB_name, collection_name, user);

        return result;
    };

    update(user_id, user) {

    };

    delete(user_id) {

    };

    async authorize(user_id, password) {
        const pipline = []
        pipline.push({
            $match: {
                _id: user_id,
                password: password
            }
        });

        const result = await dbo.aggregate(DB_name, collection_name, pipline);

        return result[0];
    }
}

module.exports = new User();