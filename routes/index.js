var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});

//The function adds tickets to the cart by identifying using the product/ticket ID according to the GET request

router.get('/add-to-cart/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

//The function reduce a certain type of ticket one by one from the cart by identifying using the product/ticket ID according to the GET request
router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});


//The function removes that certain ticket type all at once from the cart by identifying using the product/ticket ID according to the GET request
router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

//The function generates the ticket wallet or more specifically the shopping cart by listing down the chosen tickets
router.get('/shopping-cart', function(req, res, next) {
   if (!req.session.cart) {
       return res.render('shop/shopping-cart', {products: null});
   } 
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

//The function generates the ticket wallet which gives a discount of 10% for government employees  by listing down the chosen tickets
router.get('/discountShoppingCart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/discountShoppingCart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/discountShoppingCart', {products: cart.generateArray(),discount:cart.totalPrice * 0.1, discountedPrice: cart.totalPrice * 0.9, totalPrice: cart.totalPrice});
});

//The function that generates the Sampath payment portal without the govt employee discount
router.get('/sampathCheckout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/sampathCheckout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

//The function that generates the Sampath payment portal with the govt employee discount
router.get('/discountCheckout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/discountShoppingCart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/discountCheckout', {grandTotal: cart.totalPrice * 0.9, errMsg: errMsg, noError: !errMsg});
});

//The function that generates the Dialog payment portal without the govt employee discount
router.get('/dialogCheckout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/dialogCheckout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

//The function that generates the Dialog payment portal with the govt employee discount
router.get('/discountDialogCheckout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/discountShoppingCart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/discountDialogCheckout', {grandTotal: cart.totalPrice * 0.9, errMsg: errMsg, noError: !errMsg});
});


/*Stripe is a third party resource which eliminate needless complexity and details
* when conducting safer online payments*/

/*The function that gets the inputs from the submitted form and validates it with the use of STRIPE */
router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    
    var stripe = require("stripe")(
        "sk_test_s1bT1OwyvcLcnwFIXcr8kjRH00pO3xUgeF" //My personal Stripe SECRET API key for testing purposes
    );

    stripe.charges.create({
        amount: cart.totalPrice,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/sampathCheckout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {

           /* Nodemailer is a module for Node.js applications to allow  email sending.
            Here it is used to send confirmation email to customer confirming the payment
            As it uses SMTP service the emails are not actually delivered and are captured halfway

            They can be viewed from my ethereal.email account
            Preview URL: https://ethereal.email/message
            Username: mustafa66@ethereal.email
            Password: nHTk7j1EJDn2Eunn */

            const nodemailer = require("nodemailer");

            async function main(){

                // Generate test SMTP service account from ethereal.email
                let testAccount = await nodemailer.createTestAccount();

                // create reusable transporter object using the default SMTP transport
                const transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    auth: {
                        user: 'mustafa66@ethereal.email',
                        pass: 'nHTk7jJ1EJDJn2Eunn'
                    }
                });

                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: '"Sampath Payment Gateway - Train Ticket" <reservetrainticket@sampath.lk>', // sender address
                    to: "thilini1997@gmail.com, pop3.ethereal.email", // list of receivers
                    subject: "Payment Confirmed", // Subject line
                    text: "Test mail", // plain text body
                    html: "<b>Payment Confirmed!!!</b>The tickets have been reserved successfully, the amount has been credited to your account"
                });

                console.log("Message sent: %s", info.messageId);
                // Message sent:

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message
                // Username: mustafa66@ethereal.email
                //Password: nHTk7j1EJDn2Eunn
            }
            main().catch(console.error);

            req.flash('success','Payment Successful!!!   A confirmation email will be sent to your registered email address shortly... ');
            req.session.cart = null;
            res.redirect('/');
        });
    });
});


//The function that generates the SMS fro dialog payment portal using thrid part resource NEXMO
//NEXMO allows you to Send and receive messages on WhatsApp, Facebook Messenger, Viber, MMS, and SMS -- all with the Messages API.
// Create your own failover messaging flow to ensure delivery with the Dispatch API

router.post('/sms', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }

    const Nexmo = require('nexmo');
    const nexmo = new Nexmo({
        apiKey: '13578082',     // My personal NEXMO account API KEY
        apiSecret: 'bLfy12EopI9lTwUs'  // My personal NEXMO account SECRET API KEY
    }, { debug: true });

    nexmo.message.sendSms(
        'YOUR_VIRTUAL_NUMBER', '94766446337', 'Ticket Reservation Payment Confirmed!',
        (err, responseData) => {
            if (err) {
                console.log(err);
            } else {
                console.dir(responseData);
            }
        }
    );   //This Msg is actually sent in real life as the number is verified for testing purposes

      req.flash('success','Payment Successful!!! A confirmation SMS will be sent to your mobile shortly... ');
        req.session.cart = null;
        res.redirect('/');
});


module.exports = router;

//Checks whether the user is logged in before making any purchases
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}
