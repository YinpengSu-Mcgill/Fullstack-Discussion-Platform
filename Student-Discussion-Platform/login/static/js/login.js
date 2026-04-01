document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('errorCode');

    if (errorCode === '3') {
        highlightErrorFields(['email', 'role']);
        displayError('User Not Registered. Incorrect Email or Role');

    } else if (errorCode === '4') {
        highlightErrorFields(['psw']);
        displayError('Incorrect Password');
    }

    function displayError(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            errorMessageElement.style.display = 'block';
        }
    }
    function highlightErrorFields(fields) {
        fields.forEach(fieldId => {
            const fieldElement= document.getElementById(fieldId);
            if (fieldElement) {
                fieldElement.classList.add('error');
            }
        });
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();


        const email = document.getElementById('email').value;
        const password = document.getElementById('psw').value;

        const encryptedEmail = encrypt(email);
        const encryptedPassword = hash(password);

        document.getElementById('encrypted_email').value = encryptedEmail;
        document.getElementById('encrypted_psw').value = encryptedPassword;

        document.getElementById('email').value = "";
        document.getElementById('psw').value = "";


        this.submit();
    });
});




