const jsendStatus = require('./jsendStatus');

const sendsuccess = (res, data, statusCode = 200) => {
    res.status(statusCode).json({
        status: jsendStatus.success,
        data: data
    });
}
const sendfail = (res, data, statusCode = 400) => {
    res.status(statusCode).json({
        status: jsendStatus.fail,
        data: data
    });
}
const senderror = (res, message, statusCode = 500) => {
    res.status(statusCode).json({
        status: jsendStatus.error,
        message: message
    });
}
module.exports = {
    sendsuccess,
    sendfail,
    senderror
};