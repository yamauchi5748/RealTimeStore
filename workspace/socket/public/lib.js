var socket = io('http://localhost');

socket.emitAsync = event => {
    return new Promise((resolve, reject) => {
        socket.once(event, (result) => {
            console.log(event, '受信！');
            resolve(result);
        });
        socket.once('connect_error', (error) => {
            reject(new Error(error));
        });
        socket.once('connect_timeout', () => {
            reject(new Error('connect_timeout'));
        });
    });
}

socket.emitAsync('connect')
    .then(() => {
        console.log(socket.id);
    });

class Collection {
    collection_name;

    /** 
     * this is the hidden propaty
     * _query is mongoDB's pipline that before you need gotten  
     **/
    _query;

    /**
     * this constructor is collection_name and query recieved
     * @param collection_name   expected String
     * @param query             expected Array
    **/
    constructor(collection_name, query) {
        this.collection_name = collection_name;
        this._query = query || [];
    };

    add(doc) {
        socket.emit('add', this.collection_name, doc, this._query);
        return socket.emitAsync('add')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
        // ToDo snapshot用のemitも発行
    };

    get() {
        socket.emit('get', this.collection_name, this._query);
        return socket.emitAsync('get')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });

    };

    drop() {
        socket.emit('drop', this.collection_name);
        return socket.emitAsync('drop')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    where(literal1, operator, literal2) {
        const collection = new Collection(this.collection_name, this._query);

        /* operator separate */
        let query =
            operator === "=" ? literal2 :
                operator === "!=" ? { $ne: literal2 } :
                    operator === ">" ? { $gt: literal2 } :
                        operator === ">=" ? { $gte: literal2 } :
                            operator === "<" ? { $lt: literal2 } :
                                operator === "<=" ? { $lte: literal2 } :
                                    operator === "in" ? { $in: literal2 } :
                                        'error';
        if (!literal1 || !operator || !literal2) console.log('it is too few argumrnts. reference error!');
        if (query === 'error') console.log('operator does not exist. reference error!');

        collection._query.push({
            $match: {
                [literal1]: query
            }
        });

        return collection;
    };

    order(literal, order) {
        const collection = new Collection(this.collection_name, this._query);

        let query = order >= 0 ? 1 : -1;

        if (!literal || !order) console.log('it is too few argumrnts. reference error!');

        collection._query.push({
            $sort: {
                [literal]: query
            }
        });

        return collection;
    };

    limit(limit) {
        const collection = new Collection(this.collection_name, this._query);

        if (!limit) console.log('it is too few argumrnts. reference error!');

        collection._query.push({
            $limit: limit
        });

        return collection;
    };

    onSnapshot(collback) {
        console.log(`snapshot/${this.collection_name}`);
        socket.on(`snapshot/${this.collection_name}`, collback || console.log);
    };

    doc(doc_id) {
        return new Doc(this.collection_name, doc_id);
    };

}

class Doc {
    collection_name
    doc_id

    /**
     * this constructor is collection_name and document_id recieved
     * @param collection_name      expected string
     * @param doc_id            expected string
    **/
    constructor(collection_name, doc_id) {
        this.collection_name = collection_name;
        this.doc_id = doc_id
    };

    get() {
        socket.emit('doc/get', this.collection_name, this.doc_id);
        return socket.emitAsync('doc/get')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    set(doc) {
        // ToDo MongoDBでのsetを実装する

        socket.emit('doc/set', this.collection_name, this.doc_id, doc);
        return socket.emitAsync('doc/set')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    update(doc) {
        socket.emit('doc/update', this.collection_name, this.doc_id, doc);
        return socket.emitAsync('doc/update')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    delete() {
        socket.emit('doc/delete', this.collection_name, this.doc_id);
        return socket.emitAsync('doc/delete')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    onSnapshot(collback) {
        socket.on('snapshot/' + this.doc_id, collback || console.log)
    };

    collection(collection_name) {
        return new Collection(`${this.doc_id || ''}/${collection_name}`, []);
    };

}

class DB {
    collection(collection_name) {
        return new Collection(`/${collection_name}`, []);
    };
}

class Auth {
    signIn(id, pass) {
        socket.emit('signIn', id, pass);
        return socket.emitAsync('signIn')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    createUser(id, pass) {
        // ToDo ユーザー作成
        socket.emit('create/user', id, pass);
        return socket.emitAsync('create/user')
            .then(result => {
                console.log('result', result);
                return result;
            })
            .catch(error => {
                console.log(error);
            });
    };

    onAuthStateChanged(callback) {
        // ToDo ユーザー情報が更新されたら呼ばれる
    };
}

var db = new DB();
var auth = new Auth();