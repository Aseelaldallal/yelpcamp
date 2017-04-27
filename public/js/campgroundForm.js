/* global $ */
/* global google $ */

const MAX_INPUT_LENGTH = 120;
const MAX_DESC_LENGTH = 800;
const MIN_DESC_LENGTH = 200; 

// This array keeps track of user input errors. It stores the element id associated with the error
// as a string
var errors = []; 

$(document).ready(function() {
    
    attachIDS(); 
    setup($('#campName'), null, MAX_INPUT_LENGTH, true);
    setup($('#location'), null, MAX_INPUT_LENGTH, false);
    setup($('#desc'), MIN_DESC_LENGTH, MAX_DESC_LENGTH, true);
    setup($('#imgURL'), null, MAX_INPUT_LENGTH, false);
    
    var autocomplete = new google.maps.places.Autocomplete($('#location')[0]);
    addLocationChangeListener(autocomplete);
    
   $("form").submit(function(e){
        doValidations(e);
    });
    
});

function addLocationChangeListener(autocomplete) {
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        if(place && place.geometry) {
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            var coord = lat + "," + lng; 
            $('#mapCoord').val(coord);
        } else {
            $('#mapCoord').val(null);
        }
    });
}

// This function is called when user attempts to submit form
function doValidations(e) {
    checkRequiredFieldsFilled();
    if(errors.length > 0) {
        errors.sort();
        $(window).scrollTop($('#'+errors[0]).offset().top);
        e.preventDefault(); 
    }
    console.log("DONE VAL");
}

// Loops through all required fields. If empty, adds error to errors array and displays error.
function checkRequiredFieldsFilled() {
    $('.required').each(function() {
       if($(this).next().val() === '') {
           displayError($(this).next(), "This field is required");
       } 
    });  
}



// Attach a numbered id to each form-group id dynamically, for error checking purposes
// Allows scroll to error div
function attachIDS() {
    var i=1;
    $('.form-group').each(function() {
        $(this).attr('id', i);
        i++;
    })
}


// inputField is jQuery object. MinLength is the minimum number of characters allowed
// in inputField. maxLength is the maximum number of characters allowed in inputField.
// showRemChars is true or false. If true, tipDiv corresponding to inputField appears,
// with the number of remaining characters. 
function setup(inputField, minLength, maxLength, showRemChars) {
    if(maxLength) { inputField.attr("maxLength", maxLength); }
    onBlurSetup(inputField, minLength); 
    onFocusSetup(inputField, maxLength, showRemChars);
    if(showRemChars) {
        onKeyupSetup(inputField, maxLength); // Let user know how many characters remaining dynamically
    }
    
}

// inputField is a JQuery object
// When user exits inputField, the tipDiv is hidden. If no error, errorDiv is hidden.
// Otherwise, an error is displayed
function onBlurSetup(inputField, minLength) {
    inputField.on('blur', function() {
        var tipDiv = $("#" + inputField.attr("id") + "Tip");
        if(tipDiv) { tipDiv.addClass('hidden'); }
        if(inputField.val() === '') {
            displayError(inputField, "This field is required");
        } else if(minLength) {
            if(inputField.val().length < minLength) {
                displayError(inputField, "The Minimum number of characters is " + minLength);
            }
        } 
    });    
}

// inputField is a JQuery object
// showRemChars is true or false
// maxLength is number specifying the maximum number of characters allowed in inputfield
// When user clicks on inputfield, all errors are removed. If showRemChars is true, tooltip
// appears showing how many characters the user has remaining.
function onFocusSetup(inputField, maxLength, showRemChars) {
    inputField.on('focus', function() {
        removeError(inputField);
        if(showRemChars) {
            var spanElemID = "#" + inputField.attr("id") + "CharsLeft";
            showRemainingChars($(spanElemID), inputField, maxLength);
        }
    });
}

// inputField is a JQuery object
// Allows for dynamic showing of how many chars left
function onKeyupSetup(inputField, maxLength) {
    inputField.on('keyup', function() {
        var spanElemID = "#" + inputField.attr("id") + "CharsLeft";
        showRemainingChars($(spanElemID), inputField, maxLength); 
    }); 
}


// Display Error 
function displayError(field, errorMsg) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).removeClass('hidden');
    field.addClass('errorBackground');
    $(errorDivID).text(errorMsg);
    if(errors.indexOf(field.parent().attr("id")) === -1) {
        errors.push(field.parent().attr("id"));
    }
}

// Remove Error
function removeError(field) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).addClass('hidden');
    field.removeClass('errorBackground');
    var index = errors.indexOf(field.parent().attr("id"));
    if(index !== -1) {
        errors.splice(index,1);
    }
}

//This function will update the event name tooltip with the number of
//characters remaining. Make sure the error message is hidden when user starts typing
// spanId and inputField are JQuery objects
function showRemainingChars(spanElem, inputField, maxLength) {
    spanElem.parent().removeClass('hidden');
    var numChars = inputField.val().length;
    var remaining = maxLength - numChars;
    spanElem.text(remaining);
}

    
