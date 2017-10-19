/* global $ */
/* global google $ */

const MAX_INPUT_LENGTH = 120;
const MAX_DESC_LENGTH = 800;
const MIN_DESC_LENGTH = 200; 
const MAX_FILE_SIZE = 1000000; //bytes

// This array keeps track of user input errors. It stores the element id associated with the error
// as a string
var errors = []; 

$(document).ready(function() {
    
    attachIDS(); 
    setup($('#campName'), null, MAX_INPUT_LENGTH, true);
    setup($('#location'), null, MAX_INPUT_LENGTH, false);
    setup($('#desc'), MIN_DESC_LENGTH, MAX_DESC_LENGTH, true);
    
    addImageListeners();
    
    var autocomplete = new google.maps.places.Autocomplete($('#location')[0]);
    addLocationChangeListener(autocomplete);
    
    $("#location").on("blur", function() {
        setTimeout(function() {
            var locationFieldVal = $("#location").val();
            var place = autocomplete.getPlace();
            var invalidLocErrMsg = locationFieldVal + " is not a valid location. Please select location from list.";
            if($("#location").val().trim() === '') {
                displayError($("#location"), "This field is required");
            } else if(!place || place.formatted_address !== locationFieldVal) {
                displayError($("#location"), invalidLocErrMsg);
            } // Endif
        }, 300);
    });
   
   $("form").submit(function(e){
        doValidations(e, autocomplete);
    });
    
});


// When user changes location, update map coordinates
function addLocationChangeListener(autocomplete) {
    autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();
        saveCoordinates(place); 
        checkIfCountrySpecified(place); //only allow address if country is specified
    }); // End Add Listener
}


// Extract lat and Lng from place and save them into #mapCoord
function saveCoordinates(place) {
    if(place && place.geometry) {
        $("#location").val(place.formatted_address);
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var coord = lat + "," + lng; 
        $('#mapCoord').val(coord);
    } else {
        $('#mapCoord').val(null); // DEAL HERE
    }   
}

// Check that place is associated with a particular country (not just continent). If not, ask user to specify more
// detailed address
function checkIfCountrySpecified(place) {
    if(place && place.geometry) {
        var address = place.address_components;
        var country;
        address.forEach(function(component) {
            var types = component.types;
            if (types.indexOf('country') > -1) {
                country = component.long_name;
            }
        });
        if(country === undefined) {
            var errMsg = "Your selected address does not specifiy a country. Please select a more specific address";
            displayError($("#location"), errMsg);
        } else {
            $("#campgroundCountry").val(country);
        }
    }
};


// This function is called when user attempts to submit form
function doValidations(e, autocomplete) {
    checkRequiredFieldsFilled();
    if(errors.length > 0) {
        errors.sort();
        $(window).scrollTop($('#'+errors[0]).offset().top);
        e.preventDefault(); 
    }
}

// Loops through all required fields. If empty, adds error to errors array and displays error.
function checkRequiredFieldsFilled() {
    $('.required').each(function() {
        if($(this).next().attr('id') !== "image") {
            if($(this).next().val() === '') {
               displayError($(this).next(), "This field is required");
            } 
        } else { // it is an image
            if($('#image')[0].files.length === 0 && $('#imageRemoved').val() === undefined) {
                displayError($('#image'), "You must upload an image", $('#imageInput'));
            } else if($('#imageRemoved').val() === "true" && $('#image')[0].files.length === 0) {
                console.log("This is the edit page. You removed previousImage and didn't replace it.");
                displayError($('#image'), "You must upload an image", $('#imageInput'));
            }
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
function displayError(field, errorMsg, imageField) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).removeClass('hidden');
    if(imageField) {
        imageField.addClass('errorBackground');
    } else {
        field.addClass('errorBackground');
    }
    $(errorDivID).text(errorMsg);
    if(errors.indexOf(field.parent().attr("id")) === -1) {
        errors.push(field.parent().attr("id"));
    }
}

// Remove Error
function removeError(field, imageField) {
    var errorDivID = "#" + field.attr("id") + "Error";
    $(errorDivID).empty();
    $(errorDivID).addClass('hidden');
    if(imageField) {
        imageField.removeClass('errorBackground');
    } else {
        field.removeClass('errorBackground');
    }
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


// Listeners for image upload, remove buttons
function addImageListeners() {
    var fileElem = document.getElementById("image"),
        fileSelect = document.getElementById("fileSelect"),
        fileRemove = document.getElementById("fileRemove");
    addUploadButtonListener(fileSelect,fileElem);
    addRemoveButtonListener(fileRemove);
}

// When user clicks fileSelect, trigger a click of fileElem
function addUploadButtonListener(fileSelect, fileElem) {
    fileSelect.addEventListener("click", function(e) {
        if (fileElem) {
          fileElem.click();
          e.preventDefault(); // to prevent submit
        }
    }, false);
};

// When user clicks fileRemove, remove files
function addRemoveButtonListener(fileRemove) {
    fileRemove.addEventListener("click", function(e) {
        e.preventDefault(); // prevent submit
        $('#fileName').empty();
        resetFileInputField();
        $('#fileSelect').text('Upload Image');
        removeError($('#image'), $('#imageInput'));
        if($('#imageRemoved')) {
            $('#imageRemoved').val("true");
        }
    });
}

// handle image upload
function handleFiles(files) { 
 var file = files[0];
  var imageType = /^image\//;
  if (!imageType.test(file.type)) {
    var msg = "The file you tried to upload is not an image. It will not be uploaded. Upload another image, or click 'remove image' to clear this error."
    handleInvalidFileError(msg);
    return;
  } else if (file.size > MAX_FILE_SIZE) {
      handleInvalidFileError("Maximum file Size is " + MAX_FILE_SIZE/1000000 + "MB. Your File is " + (file.size/1000000).toFixed(2) + " MB");
      return; 
  } else {
      $('#fileSelect').text('Replace Image');
      removeError($('#image'), $('#imageInput'));
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function(event) {
          $('#fileName').empty();
          $('#fileName').text(files[0].name);
      }
  }
}

// display error, remove file
function handleInvalidFileError(msg) {
    $('#fileRemove').trigger('click');
    displayError($('#image'), msg, $('#imageInput')); 
    resetFileInputField();
}

// reset image 
function resetFileInputField() {
    $('#image').wrap('<form>').closest('form').get(0).reset();
    $('#image').unwrap();
}

