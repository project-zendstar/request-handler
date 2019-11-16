const _ = require('lodash');

class RequestHandler {
  constructor(logger) {
    this.logger = logger;
  }

  throwIf(fn, status, errorType, errorMessage) {
    return (result) => (fn(result) ? this.throwError(status, errorType, errorMessage)() : result);
  }

  validateJoi(err, status, errorType, errorMessage) {
    if (err) {
      this.logger.log(`error in validating request : ${errorMessage}`, 'warn');
    }
    return !_.isNull(err) ? this.throwError(status, errorType, errorMessage)() : '';
  }

  throwError(status, errorType, errorMessage) {
    return (e) => {
      if (!e) e = new Error(errorMessage || 'Default Error');
      e.status = status;
      e.errorType = errorType;
      throw e;
    };
  }

  catchError(res, error) {
    if (!error) error = new Error('Default error');
    res.status(error.status || 500).json({
      type: 'error',
      message: error.message || 'Unhandled error',
      error,
    });
  }

  sendPending(res, message, status) {
    this.logger.log(`A BankId request has been made and proccessed successfully at: ${new Date()}`, 'info');
    return (data, globalData) => {
      if (_.isUndefined(status)) {
        status = 200;
      }
      res.status(status).json({
        type: 'pending',
        message: message || 'Pending',
      });
    };
  }

  sendSuccess(req, res, message, status) {
    this.logger.log(`A request for [${req.baseUrl}] has been proccessed successfully.`, 'info', res);
    return (globalData) => {
      if (_.isUndefined(status)) {
        status = 200;
      }
      res.status(status).json({
        type: 'success',
        message: message || 'Success result',
        ...globalData,
      });
    };
  }

  sendError(req, res, error) {
    this.logger.log(
      `Error during processing request: [${`${req.protocol}://${req.get('host')}${
        req.originalUrl
      }`}] details message: [${error.message}]`,
      'error',
    );
    return res.status(error.status || 500).json({
      type: 'error',
      message: error.message || error.message || 'Unhandled Error',
      error,
    });
  }
}
module.exports = RequestHandler;
