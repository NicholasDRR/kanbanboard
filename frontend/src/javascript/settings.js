$(document).ready(function() {

    function closeModal(modalId) {
        $(`#${modalId}`).css('display', 'none'); 
    }

    $('#closeErrorModal').on('click', function() {
        closeModal('errorModal');
    });

    $('#closeSuccessModal').on('click', function() {
        closeModal('successModal');
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#errorModal')) {
            closeModal('errorModal');
        }
        if ($(event.target).is('#successModal')) {
            closeModal('successModal');
        }
    });

    $('#myform-search').on('submit', function(event) {
        event.preventDefault(); 
        const oldPassword = $('#o-p').val();
        const newPassword = $('#p').val();
        const confirmPassword = $('#p-c').val();

        if (validatePasswords(newPassword, confirmPassword)) {
            ChangeUserPassword(oldPassword, newPassword)
                .then(({ status }) => {  // Destructure to get the status
                    console.log(status);
                    if (status === 204 || status === 201) { // Check for both 204 and 201
                        $('#successModal').css('display', 'flex');
                    } else {
                        $('#errorModal').css('display', 'flex');
                    }
                })
                .catch(({ status }) => {
                    console.error("Error changing password:", status);
                    $('#errorModal').css('display', 'flex'); // Show error modal on catch
                });
        }
    });


    function validatePasswords(newPassword, confirmPassword) {
        const passwordWarning = $('#password-warning');
        passwordWarning.text(''); // Clear previous warnings

        if (newPassword.length < 6) {
            passwordWarning.text('New password must be at least 6 characters long.');
            return false;
        }

        const upperCasePattern = /[A-Z]/;
        const numberPattern = /[0-9]/;
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

        if (!upperCasePattern.test(newPassword) || 
            !numberPattern.test(newPassword) || 
            !specialCharPattern.test(newPassword)) {
            passwordWarning.text('New password must contain at least 1 upper case letter, 1 number, and 1 special character.');
            return false;
        }

        if (newPassword !== confirmPassword) {
            passwordWarning.text('New password and confirm password do not match.');
            return false;
        }

        return true;
    }

    function ChangeUserPassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://${ambient}:8000/users/user/update?old_password=${oldPassword}&new_password=${newPassword}`,
                crossDomain: true,
                type: "PUT",
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Accept': 'application/json'
                },
                success: function(response, status, xhr) {
                    resolve({ response, status: xhr.status });
                },
                error: function(xhr, status, error) {
                    reject({ status: xhr.status, error });
                }
            });
        });
    }

    $('.unmask').on('click', function() {
        const passwordField = $(this).prev('.password');
        const fieldType = passwordField.attr('type') === 'password' ? 'text' : 'password';
        passwordField.attr('type', fieldType);
    
        // Toggle icon for visibility
        $(this).find('.unmask:before').toggleClass('fa-eye fa-eye-slash');
    });

    $('.password').on('keyup', function() {
        const p = $('#p');
        const p_c = $('#p-c');

        let warningMessage = '';
        
        if (p.val().length > 0) {
            if (p.val() !== p_c.val()) {
                $('#valid').html("Passwords Don't Match");
            } else {
                $('#valid').html('');
            }

            const lengthValid = p.val().length >= 6;
            const upperCaseValid = /[A-Z]/.test(p.val());
            const numberValid = /\d/.test(p.val());
            const specialCharValid = /[^\w\s]/.test(p.val());

            if (!lengthValid) {
                warningMessage += "Password must be at least 6 characters long.<br>";
            }
            if (!upperCaseValid) {
                warningMessage += "Password must contain at least 1 uppercase letter.<br>";
            }
            if (!numberValid) {
                warningMessage += "Password must contain at least 1 number.<br>";
            }
            if (!specialCharValid) {
                warningMessage += "Password must contain at least 1 special character.<br>";
            }

            $('#password-warning').html(warningMessage);

            let strength = 'weak';
            if (lengthValid && numberValid && upperCaseValid && specialCharValid) {
                strength = 'strong';
                $('#password-warning').html(''); 
            } else if (lengthValid && (numberValid || upperCaseValid || specialCharValid)) {
                strength = 'medium';
            }

            $('#strong span').removeClass('weak medium strong').addClass(strength).html(strength);
        } else {
            $('#password-warning').html('');
        }
    });

    $('#myform-search').on('submit', function(e) {
        const p = $('#p');
        const lengthValid = p.val().length >= 6;
        const upperCaseValid = /[A-Z]/.test(p.val());
        const numberValid = /\d/.test(p.val());
        const specialCharValid = /[^\w\s]/.test(p.val());
        
        if (!(lengthValid && upperCaseValid && numberValid && specialCharValid)) {
            e.preventDefault(); 
            $('#password-warning').html("Please ensure your password meets all the requirements.");
        }
    });
});
