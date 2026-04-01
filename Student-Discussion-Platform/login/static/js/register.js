document.addEventListener('DOMContentLoaded', function () {
    const registrationForm = document.getElementById('registrationForm');
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('errorCode');

    if (errorCode === '1') {
        highlightErrorField(['email']);
        displayError('This Email has been Registered: Existing Account');

    }
    function displayError(message) {
        const errorMessageElement = document.getElementById('error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            errorMessageElement.style.display = 'block';
        }
    }
    function highlightErrorField(fieldId) {
        const fieldElement = document.getElementById(fieldId);
        if (fieldElement) {
            fieldElement.classList.add('error');
        }
    }

    registrationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('psw').value;

        const encryptedFirstName = encrypt(firstName);
        const encryptedLastName = encrypt(lastName);
        const encryptedEmail = encrypt(email);
        const encryptedPassword = hash(password);

        document.getElementById('encrypted_first_name').value = encryptedFirstName;
        document.getElementById('encrypted_last_name').value = encryptedLastName;
        document.getElementById('encrypted_email').value = encryptedEmail;
        document.getElementById('encrypted_psw').value = encryptedPassword;

        document.getElementById('first_name').value = "";
        document.getElementById('last_name').value = "";
        document.getElementById('email').value = "";
        document.getElementById('psw').value = "";

        this.submit();
    });
});


