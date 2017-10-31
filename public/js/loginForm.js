
/* global $ */




$(document).ready(function() {
    
    $("body").addClass("loginFormBackground");
        
    setup($('#email'), "Email cannot be blank");
    $("#email").on('blur', function() {
        validateEmailAddress(); 
    })
    
    setup($('#password'), "Password cannot be blank");
  
   $("form").submit(function(e){
       checkIfEmpty($('#email'), "Email cannot be blank", e);
       validateEmailAddress(); 
       checkIfEmpty($('#password'), "Password cannot be blank", e);
    });
});



// Ensure that the user enters a valid email address
function validateEmailAddress() {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test($("#email").val())) {
        displayError($("#email"), "Invalid Email Address");
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
