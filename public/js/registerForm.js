
/* global $ */




$(document).ready(function() {
    
    $("body").addClass("registerFormBackground");
    
    // USERNAME
    setup($('#username'), "username cannot be blank");

    // EMAIL
    setup($('#email'), "Email cannot be blank");
    $("#email").on('blur', function() {
        validateEmailAddress(); 
    })
    
    // PASSWORD
    setup($('#password'), "Password cannot be blank");
    $("#password").on('blur', function() {
        validatePassword(); 
    });
  
  // SUBMIT
   $("form").submit(function(e){
       checkIfEmpty($('#username'), "Username cannot be blank", e);
       checkIfEmpty($('#email'), "Email cannot be blank", e);
       validateEmailAddress(); 
       checkIfEmpty($('#password'), "Password cannot be blank", e);
       validatePassword(); 
    });
});



// Ensure that the user enters a valid email address
function validateEmailAddress() {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test($("#email").val())) {
        displayError($("#email"), "Invalid Email Address");
    }
}

// Ensure that the password is at least 8 characters long
function validatePassword() {
    if($("#password").val().trim().length < 8) {
        displayError($("#password"), "Your password must be at least 8 characters long");
    }
}

// Make sure field not blank
function checkIfEmpty(field, errorMsg, e) {
    if(field.val().trim() === '') {
        displayError(field, errorMsg);
        if(e) { e.preventDefault() }; 
    }
}

// Add Blur, Focus Listener to field
function setup(field, errorMsg) {
    field.on('blur', function() {
        checkIfEmpty(field, errorMsg);
    });
    field.on('focus', function() {
       removeError(field); 
    });
}

// Display Error 
function displayError(field, errorMsg) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).removeClass('hidden');
    field.addClass('errorBackground');
    $(errorDivID).text(errorMsg);
}

// Remove Error
function removeError(field) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).addClass('hidden');
    field.removeClass('errorBackground');
}
