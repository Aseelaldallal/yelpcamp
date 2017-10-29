
/* global $ */




$(document).ready(function() {
    setup($('#username'), "username cannot be blank");
    setup($('#email'), "Email cannot be blank");
    setup($('#password'), "Password cannot be blank");
  
   $("form").submit(function(e){
       checkIfEmpty($('#username'), "Username cannot be blank", e);
       checkIfEmpty($('#email'), "Email cannot be blank", e);
       checkIfEmpty($('#password'), "Password cannot be blank", e);
    });
});


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
