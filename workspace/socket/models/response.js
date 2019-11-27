class Response {
    status_code;
    data;
    message;

    constructor(status_code, data, message) {
        this.status_code = status_code;
        this.data = data;
        this.message = message;
    }
}