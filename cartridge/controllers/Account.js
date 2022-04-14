'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', server.middleware.https, function (req, res, next) {
    if (!req.currentCustomer.profile) {
        return null;
    }
    let viewData = res.getViewData();
    viewData.reviewFlag = !!req.currentCustomer.raw.profile.custom.reviewFlag;

    res.setViewData(viewData);
    return next();
});

module.exports = server.exports();
