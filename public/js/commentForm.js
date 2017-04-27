
/* global $ */




$(document).ready(function() {
    $('#comment').on('blur', function() {
       if($('#comment').val().trim() === '') {
           displayError($('#comment'), 'Please leave a comment or press back');
       }
    });
    $('#comment').on('focus', function() {
        removeError($('#comment'));
    });
   $("form").submit(function(e){
       if($('#comment').val().trim() === '') {
           displayError($('#comment'), 'Please leave a comment or press back');
           e.preventDefault();
       }
    });
});



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
