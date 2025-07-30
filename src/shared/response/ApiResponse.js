var ApiResponse = {
  send: function (res, options) {
    var status = options.status;
    var success = options.success;
    var message = options.message;
    var data = options.data || null;

    return res.status(status).json({
      status: status,
      success: success,
      message: message,
      data: data
    });
  },

  success: function (res, message, data) {
    return this.send(res, {
      status: 200,
      success: true,
      message: message,
      data: data || null
    });
  },

  error: function (res, message, status) {
    var statusCode = 400;

    if (status instanceof Error) {
      statusCode = status.status || 500;
    } else if (typeof status === 'number') {
      statusCode = status;
    }

    return this.send(res, {
      status: statusCode,
      success: false,
      message: message
    });
  }
};

module.exports = ApiResponse;
