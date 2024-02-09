document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Make a request to your server to handle user registration
        fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from the server
            console.log(data);

            // Optionally, redirect the user to another page after successful signup
            // window.location.href = '/dashboard';
        })
        .catch(error => console.error('Error:', error));
    });
});
