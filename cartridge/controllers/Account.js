'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', server.middleware.https, function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var reviews = CustomObjectMgr.getAllCustomObjects('Reviews');
    var reviewArray = [];
    while (reviews.hasNext()) {
        var review = reviews.next();
        reviewArray.push({
            ID: review.custom.reviewID,
            reviewText: review.custom.reviewText,
            vote: review.custom.vote,
            date: review.creationDate
        });

    }
    if (!req.currentCustomer.profile) {
        return null;
    }
    let viewData = res.getViewData();
    viewData.reviewFlag = !!req.currentCustomer.raw.profile.custom.reviewFlag;

    if(viewData.reviewFlag){
        viewData.reviewDate = req.currentCustomer.raw.profile.custom.reviewDate.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ");
    }
    viewData.reviewEntries = reviewArray;
    res.setViewData(viewData);
    return next();
});

module.exports = server.exports();
