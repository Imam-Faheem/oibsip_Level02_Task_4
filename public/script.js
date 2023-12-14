// script.js

document.addEventListener('DOMContentLoaded', function () {
    // Populate the username from the session or any other way you store it
    const usernameElement = document.getElementById('username');
    const username = getUsernameFromSession(); // Replace with the actual method to get the username
    if (username) {
        usernameElement.textContent = username;
    }
});




// Define the logout function in the global scope
function logout() {
    // Perform a logout request to the server
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin', // Include cookies in the request
    })
    .then(response => {
        if (response.ok) {
            // Redirect to the login page after successful logout
            window.location.href = '/';
        } else {
            console.error('Logout failed:', response.statusText);
        }
    })
    .catch(error => console.error('Logout failed:', error));
}

function getUsernameFromSession() {
    // Replace this with your actual method to get the username from the session
    // For example, you might store the username in a session variable on the server side
    return 'JohnDoe'; // Replace with the actual username
}



// Function to handle the reset password form
// script.js

document.addEventListener('DOMContentLoaded', function () {
    // ... (existing code)

    // Check if the page is reset-password.html and handle the reset password form
    if (window.location.pathname.includes('reset-password')) {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', function (event) {
                event.preventDefault();
                resetPassword();
            });
        }
    }
});

// Function to handle the reset password form
async function resetPassword() {
    // const email = document.getElementById('email').value; // Replace 'email' with the actual ID of your email input field
    const email = "hitest1122334455@gmail.com"; 
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate new password and confirmation
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    // Additional validation for password strength (add your own logic)
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
    }

    // Send data to the server
    const response = await fetch('/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }), // Include email in the request body
    });

    if (response.ok) {
        alert('Password reset successful. You can now log in with your new password.');
        // Redirect to the login page or another route
        window.location.href = '/login.html';
    } else {
        alert('Password reset failed. Please try again later.');
        console.error('Password reset failed:', response.statusText);
    }
}
