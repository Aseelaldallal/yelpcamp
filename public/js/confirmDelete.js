
function confirmDelete(formField) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonClass: 'btn btn-success',
            customClass: 'modal_custom',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false,
            allowOutsideClick: false,
            allowEscapeKey: false, 
            allowEnterKey: false,
            focusConfirm: false
        }).then(function () {
             formField.submit(); 
        }, function (dismiss) {
            // Do nothing
        });
};