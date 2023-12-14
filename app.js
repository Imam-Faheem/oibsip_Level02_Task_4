const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;


// MongoDB connection
const uri = 'mongodb://127.0.0.1:27017/LoginSystem';
mongoose.connect(uri, {
 
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('Connected to MongoDB database');
});

connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Create a user schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    resetToken: String,  // Add this field for the reset token
    resetTokenExpiration: Date,  // Add this field for the token expiration date
});

const User = mongoose.model('User', userSchema);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));

// Serve static files (CSS, client-side scripts, etc.)
app.use(express.static(__dirname + '/public'));




// ///////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////




// Serve login page on the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.redirect('/home.html'); // Redirect to the dashboard or another authenticated route
            
        } else {
            // res.status(401).send('Invalid credentials');
            res.send('<script>alert("Invalid credentials. Please try again.");</script>');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// Forgot Password endpoint---------------------------------

// In-memory storage for the email-token mapping (you should use a database in a real-world scenario)
const emailTokenMap = {};
// Helper function to generate a unique token
// Helper function to generate a unique 6-digit code
function generateUniqueToken() {
    // Generate a random 6-digit number
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
}
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Generate a unique token
        const token = generateUniqueToken();

        // Save the token and associate it with the user's email in your database
        emailTokenMap[token] = email;

        // Send the email with the reset link
        sendResetEmail(email, token);
        // Redirect the user to the reset-password page
        // res.redirect('/reset-password.html');
         res.redirect('/enter-code.html');
        // res.status(200).send('Password reset instructions sent to your email.');
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});





// Enter Code endpoint
app.get('/enter-code.html', (req, res) => {
    res.sendFile(__dirname + '/public/enter-code.html');
});

app.post('/verify-code', async (req, res) => {
    const { code } = req.body;

    try {
        const email = emailTokenMap[code];

        if (email) {
            res.redirect(`/reset-password.html?code=${code}`);
        } else {
            res.status(401).send('Invalid code');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




// Verification endpoint
app.post('/verify-code', async (req, res) => {
    const { code } = req.body;
    const email = emailTokenMap[code];

    if (email) {
        // Code is valid
        res.redirect(`/reset-password.html?email=${encodeURIComponent(email)}`);
    } else {
        // Code is invalid or expired
        res.status(400).send('Invalid or expired verification code.');
    }
});




// Reset Password endpoint
// Reset Password endpoint
app.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        // Check if the user exists
        if (!user) {
            return res.status(404).send('User not found');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's document in the database with the new hashed password
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

        res.status(200).send('Password reset successful.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});






// ///////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////









// Helper function to send a reset password email
function sendResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  // Replace with your SMTP server host
        port: 587,  // Replace with your SMTP server port
        secure: false,  // Set to true if your SMTP server requires a secure connection (e.g., SSL/TLS)
        auth: {
            user: 'imamhusain941@gmail.com',  // Replace with your email address
            pass: 'ohop mcps zwpb xbhp',  // Replace with your email password or an app-specific password
        },
    });

    const mailOptions = {
        from: 'imamhusain941@gmail.com',
        to: email,
        subject: 'Password Reset',
        html: `<p>Your shopify E-commerce store account password reset code is: <strong>${token}</strong></p>`,  // Include the generated code in HTML format
        text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email sending failed:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}



// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
         // Check if the password meets the minimum length requirement
         if (password.length < 8) {
            return res.status(400).send('<script>alert("Password must be at least 8 characters long");</script> Go back');
        }
         // Check if the password and its confirmation match
         if (password !== confirmPassword) {
            return res.status(400).send('<script>alert("Passwords do not match");</script> Go back');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.redirect('/home.html'); // Redirect to the home page or another authenticated route

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


    // Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/'); // Redirect to the login page or another route after logout
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
