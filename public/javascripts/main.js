'use strict';
//4242424242424242
/*global Stripe:true*/
/*global $form:true*/

//set Public key for Stripe payments
Stripe.setPublishableKey( 'pk_test_qeVakIW9TGZmmUeU3voJMgHI' );
var isSubmit = false;
$( document ).ready( function() {
    var page = $('#page').val();
    console.log(page)
    $("#signup").hide();
    $("#clicklogin").click(function(){
        $("#login").show();
        $("#signup").hide();
    
    });
    $("#clicksign").click(function(){
        $("#signup").show();
        $("#login").hide();    
    });

    if(page == 'login'){
        $("#login").show();
        $("#signup").hide();
    }
    if(page == 'signup'){
        $("#signup").show();
        $("#login").hide(); 
    }
    $('.payment-errors').removeClass('alert alert-success')
    
    if($( '.customerId' ).val()){
        $('#card').css("display", "none");
        $('.cardmessage').css("display", "block");
        $( '.card-number' ).attr('disabled','disabled');
        $( '.card-cvc' ).attr('disabled','disabled');
        $( '.card-expiry-month' ).attr('disabled','disabled');
        $( '.card-expiry-year' ).attr('disabled','disabled');
    }
    /*$( '#login' ).click( function() {
        var name = $('#loginname').val();
        var pwd = $('#loginpwd').val();
        if(name && pwd){
            $.ajax( {
                url: '/authenticate',
                type: 'POST',
                data: {
                    name: $( '#loginname' ).val(),
                    password: $( '#loginpwd' ).val(),
                }
            }).done( function( response ) {
                if ( response) {
                    $('.container').html(response);
                }
            } );
        }else{
            $('.errors').text('Please insert all fields');
            $('.errors').addClass('alert alert-danger')
        }
    });*/
    
    $( '#submittransaction' ).click( function() {
        console.log( 'ok' );
        if ( !isSubmit ) {
            if($( '.customerId' ).val()){
                if($( '#amount' ).val() && $( '#currency' ).val()){
                    console.log($( '.customerId' ).val())
                    $.ajax( {
                        url: '/createtransaction',
                        type: 'POST',
                        headers: {
                            'x-access-token': $('#token').html()
                        },
                        data: {
                            customerId: $( '.customerId' ).val(),
                            amount: $( '#amount' ).val(),
                            currency: $( '#currency' ).val()
                        }
                    }).done( function( response ) {
                        if ( response.status == true) {
                            $( '.payment-errors' ).text( response.message );
                            $('.payment-errors').removeClass('alert alert-danger')
                            $('.payment-errors').addClass('alert alert-success')
                        }else{
                            $( '.payment-errors' ).text( response.message );
                            $('.payment-errors').removeClass('alert alert-success')
                            $('.payment-errors').addClass('alert alert-danger')
                        }
                    } );
                }else{
                    $( '.payment-errors' ).text('please insert all fiels');
                    $('.payment-errors').addClass('alert alert-danger')
                }
                
            }else{
                //var check = Stripe.card.validateCardNumber('12345678')
                if($( '#amount' ).val() && $( '#currency' ).val() && $( '.card-number' ).val() && $( '.card-cvc' ).val() && $( '.card-expiry-month' ).val() && $( '.card-expiry-year' ).val()) {
                    Stripe.card.createToken( {
                        number: $( '.card-number' ).val(),
                        cvc: $( '.card-cvc' ).val(),
                        exp_month: $( '.card-expiry-month' ).val(),
                        exp_year: $( '.card-expiry-year' ).val()
                    }, function( status, response ) {
                        if ( response.error ) {
                            // Show the errors on the form
                            $( '.payment-errors' ).text( response.error.message );
                            $('.payment-errors').addClass('alert alert-danger')
                        }
                        else {

                            //var $form = $('#payment-form');
                            // response contains id and card, which contains additional card details
                            var token = response.id;
                            // Insert the token into the form so it gets submitted to the server
                            //$form.append( $( '<input type="hidden" name="stripeToken" />' ).val( token ) );
                            // and submit
                            $.ajax( {
                                url: '/createtransaction',
                                type: 'POST',
                                headers: {
                                    'x-access-token': $('#token').html()
                                },
                                data: {
                                    amount: $( '#amount' ).val(),
                                    currency: $( '#currency' ).val(),
                                    token: token
                                }
                            }).done( function( response ) {
                                if ( response.status == true) {
                                    $( '.payment-errors' ).text( response.message );
                                    $('.payment-errors').removeClass('alert alert-danger')
                                    $('.payment-errors').addClass('alert alert-success')
                                }else{
                                    $( '.payment-errors' ).text( response.message );
                                    $('.payment-errors').removeClass('alert alert-success')
                                    $('.payment-errors').addClass('alert alert-danger')
                                }
                            } );
                        }

                    });
                }else{
                    $( '.payment-errors' ).text('please insert all fiels');
                    $('.payment-errors').addClass('alert alert-danger')
                }
            }
        }

    } );
} );
