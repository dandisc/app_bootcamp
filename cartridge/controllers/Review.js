'use strict';

/**
 * @namespace Review
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Account-Show : The Account-Show endpoint will render the shopper's account page. Once a shopper logs in they will see is a dashboard that displays profile, address, payment and order information.
 * @name Base/Review-Show
 * @function
 * @memberof Review
 * @param {middleware} - server.middleware.https
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - registration - A flag determining whether or not this is a newly registered account
 * @param {category} - senstive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'Show',
    server.middleware.https,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        const Resource = require('dw/web/Resource');
        const URLUtils = require('dw/web/URLUtils');

        let reviewForm = server.forms.getForm('reviewForm');

        res.render('account/review/addReview', {
            reviewForm: reviewForm,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('label.review', 'forms', null),
                    url: '#'
                }
            ]
        });
        next();
    }
);

server.post('SaveReview', function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var reviewForm = server.forms.getForm('reviewForm');
    var UUIDUtils = require('dw/util/UUIDUtils');
    var Transaction = require('dw/system/Transaction');
    var URLUtils = require('dw/web/URLUtils');
    var CustomerMgr = require('dw/customer/CustomerMgr');

    if (reviewForm.stars.value > 5){
        reviewForm.stars.valid = false;
        reviewForm.stars.error = Resource.msg('label.review.error', 'account', null);
    }

    if (reviewForm.valid) {
        let newRev;
        let customer;

        try{
            Transaction.wrap(function () {
                newRev = CustomObjectMgr.createCustomObject('Reviews', 'rev'+UUIDUtils.createUUID());
                newRev.custom.reviewText = reviewForm.review.value;
                newRev.custom.vote = reviewForm.stars.value;
                customer = CustomerMgr.getCustomerByCustomerNumber(req.currentCustomer.profile.customerNo);
                customer.getProfile().custom.reviewFlag = true;
                customer.getProfile().custom.reviewDate = new Date();
            });
        } catch (e) {
            res.setStatusCode(500);
            res.json({
                success: false,
                errorResponse: e
            });

            return;
        }
        res.setStatusCode(200);
        res.redirect(URLUtils.url('Account-Show'));        
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(paymentForm)
        });
    }
    return next();
});


module.exports = server.exports();
