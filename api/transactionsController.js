'use strict';

var Transactions = require( '../models/transactions.model.js' );
var User = require( '../models/user.model.js' );
var config = require( '../config' );
var Stripe = require( 'stripe' )(config.stripeApiKey);

exports.index = function( req, res, next ) {
    if ( req.body ) {
        var transaction = new Transactions( {
            name: req.body.name
        } );
        transaction.save( function( err, trans ) {
            if ( err ) {
                return console.log( err );
            }
            res.status( 200 ).end();
        } );
    }
};

exports.createTransaction = function( req, res, next ) {
    /*console.log(req.body.amount)
    console.log(req.body.currency)
    Stripe.charges.create( {
        amount: req.body.amount * 100,
        currency: req.body.currency,
        source: req.body.token,
        description: 'Charge for test@example.com'
    }, function( err, charge ) {
        if ( err ) {
            return console.log( err );
        }
        var transaction = new Transactions( {
            transactionId: charge.id,
            amount: charge.amount,
            created: charge.created,
            currency: charge.currency,
            description: charge.description,
            paid: charge.paid,
            sourceId: charge.source.id
        } );
        transaction.save( function( err ) {
                if ( err ) {
                    console.log(err)
                    return res.status( 500 );
                }
                else {
                    console.log('done')
                    res.status( 200 ).json( {
                        message: 'Payment is created.'
                    } );
                }
            } );
    } );*/

    if(req.body.customerId){
        console.log(req.body.customerId)
        Stripe.charges.create( {
            amount: req.body.amount, // amount in cents, again
            currency: req.body.currency,
            customer: req.body.customerId
        }, function( err, charge ) {
            if ( err ) {
                //return console.log( err );
                if(err.type == 'StripeCardError'){
                    res.status( 200 ).json( {
                        status:false,
                        message: err.message
                    } );
                }

                if(err.type == 'StripeInvalidRequestError'){
                    res.status( 200 ).json( {
                        status:false,
                        message: err.message
                    } );
                }

                if(err.type == 'StripeAPIError'){
                    res.status( 200 ).json( {
                        status:false,
                        message: err.message
                    } );
                }

                if(err.type == 'StripeConnectionError'){
                    res.status( 200 ).json( {
                        status:false,
                        message: err.message
                    } );
                }

                if(err.type == 'StripeAuthenticationError'){
                    res.status( 200 ).json( {
                        status:false,
                        message: err.message
                    } );
                }
            }else{
                if(charge.id){
                    var transaction = new Transactions( {
                        transactionId: charge.id,
                        amount: charge.amount,
                        created: charge.created,
                        currency: charge.currency,
                        description: charge.description,
                        paid: charge.paid,
                        sourceId: charge.source.id
                    } );
                    transaction.save( function( err ) {
                        if ( err ) {
                            console.log('save')
                        }
                        else {
                            console.log('done')
                            res.status( 200 ).json( {
                                status:true,
                                message: 'Payment is created.'
                            } );
                        }
                    });
                }
            }
        });                  
    }else{
        Stripe.customers.create({
          source: req.body.token,
          description: 'user@gmail.com'
        }, function(err, customer) { 
            if(err) {
                console.log(err)
            }else{
                if(customer){
                    var userId = req.session.userId;  
                    console.log(userId);  
                    User.update({'_id':userId},
                        {$set: {
                            'customerId':customer.id
                        }},{upsert: true, new: false}, function(err,data){
                        if(!err){
                            console.log('update');
                            console.log(data)
                        }else{
                            console.log(err)
                        }
                    });
                    Stripe.charges.create( {
                        amount: req.body.amount, // amount in cents, again
                        currency: req.body.currency,
                        customer: customer.id
                    }, function( err, charge ) {
                    if ( err ) {
                        //return console.log( err );                        
                        if(err.type == 'StripeCardError'){
                            res.status( 200 ).json( {
                                status:false,
                                message: err.message
                            } );
                        }

                        if(err.type == 'StripeInvalidRequestError'){
                            res.status( 200 ).json( {
                                status:false,
                                message: err.message
                            } );
                        }

                        if(err.type == 'StripeAPIError'){
                            res.status( 200 ).json( {
                                status:false,
                                message: err.message
                            } );
                        }

                        if(err.type == 'StripeConnectionError'){
                            res.status( 200 ).json( {
                                status:false,
                                message: err.message
                            } );
                        }

                        if(err.type == 'StripeAuthenticationError'){
                            res.status( 200 ).json( {
                                status:false,
                                message: err.message
                            } );
                        }

                        
                    }else{
                        if(charge.id){
                            var transaction = new Transactions( {
                                transactionId: charge.id,
                                amount: charge.amount,
                                created: charge.created,
                                currency: charge.currency,
                                description: charge.description,
                                paid: charge.paid,
                                sourceId: charge.source.id
                            } );
                            transaction.save( function( err ) {
                                if ( err ) {
                                    console.log('save')
                                }
                                else {
                                    console.log('done')
                                    res.status( 200 ).json( {
                                        status:true,
                                        message: 'Payment is created.'
                                    } );
                                }
                            });
                        }
                    }
                        
                    });  
                }
            }
        })
    }
    /**/
};
