const config = require("../config/config.json");
const dbo = require('../lib/mongo');
const Mongo = require('mongodb');
const bcrypt = require('bcrypt');

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

        return await dbo.aggregate(DB_name, collection_name, pipline);
    };

    async create(user) {
        user.password = bcrypt.hashSync(user.password, 10);

        return await dbo.insert(DB_name, collection_name, user);
    };

    update(user_id, user) {

    };

    delete(user_id) {

    };

    async authorize(auth_field, password) {
        const pipline = [];

        pipline.push({
            $match: {
                [config.auth.AuthField]: auth_field
            }
        });

        const result = await dbo.aggregate(DB_name, collection_name, pipline);

        return (result.length === 1 && bcrypt.compareSync(password, result[0].password)) ? result : Array()
    }
}

module.exports = new User();