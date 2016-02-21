'use strict';

var User = require( '../models/user.model.js' );
var jwt = require( 'jsonwebtoken' );
var config = require( '../config' );
var Stripe = require( 'stripe' )(config.stripeApiKey);

exports.index = function( req, res ) {

    // find the user
    req.session.page = 'login';
    if(req.body.name && req.body.password){
        User.findOne( {
            name: req.body.name
        }, function( err, user ) {

            if ( err ) {
                throw err;
            }

            if ( !user ) {
                /*res.json( {
                    success: false,
                    message: 'Authentication failed. User not found.'
                } );*/
                req.session.error = 'Authentication failed. User not found.';
                res.redirect('/login');
            }
            else if ( user ) {
                user.comparePassword( req.body.password, function( err, isMatch ) {
                    if ( err ) {
                        throw err;
                    }

                    if(!isMatch) {
                        /*return res.status( 401 ).json( {
                            success: false,
                            message: 'Authentication failed. Wrong password.'
                        } );*/
                        req.session.error = 'Authentication failed. Wrong password.';
                        res.redirect('/login');
                    }

                    req.session.userId = user._id;
                    console.log(req.session.userId +'id')
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign( user, config.secret, {
                        expiresIn: 1440 // expires in 24 hours
                    } );

                    var customerId = '';
                    var cardData = '';
                    if(user.customerId){
                        console.log(user.customerId +'customerId')
                        customerId = user.customerId;

                        Stripe.customers.retrieve(
                          customerId,
                          function(err, customer) {
                            
                            var sources = customer.sources;
                            console.log(sources.data);
                            cardData = sources.data[0]
                            console.log(cardData.last4)
                            res.render( 'transactions', {
                                token: token,
                                title: 'Transactions Page',
                                customerId:customerId,
                                cardData:cardData
                            } );
                          }
                        );    
                    }else{
                        req.session.error = '';
                        res.render( 'transactions', {
                            token: token,
                            title: 'Transactions Page',
                            customerId:customerId,
                            cardData:cardData
                        } );
                    }

                    // return the information including token as JSON
                    

                } );
            }

        } );
    }else{
        req.session.error = 'Please insert username and password';
        res.redirect('/login');


    }
};

exports.register = function( req, res ) {
     req.session.page = 'signup';
    // find the user
    if(req.body.name && req.body.password && req.body.confirmpassword){
        if(req.body.password == req.body.confirmpassword ){
            User.findOne( {
                name: req.body.name
            }, function( err, user ) {

                if ( err ) {
                    throw err;
                }

                if ( user ) {
                    /*res.json( {
                        success: false,
                        message: 'Register failed. Username is not free'
                    } );*/
                    req.session.error = 'Register failed. Username is not free';
                    res.redirect('/login');
                }
                else {
                    user = new User( {
                        name: req.body.name,
                        password: req.body.password
                    } );
                    user.save( function( err ) {
                        if ( err ) {
                            /*return res.status( 500 ).json( {
                                success: false,
                                message: 'Registration failed'
                            } );*/
                            req.session.error = 'Registration failed';
                            res.redirect('/login');
                        }

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign( user, config.secret, {
                            expiresIn: 1440 // expires in 24 hours
                        } );

                        req.session.userId = user._id;
                        console.log(req.session.userId +'id')
                        // return the information including token as JSON
                        res.render( 'transactions', {
                            token: token,
                            title: 'Transactions Page',
                            customerId:'',
                            cardData:''
                        } );
                    } );
                }

            } );
        }else{
            req.session.error = 'password do not match';
            res.redirect('/login');
        }
        
    }else{
        req.session.error = 'Please insert all fields';
        res.redirect('/login');
    }
    
};



