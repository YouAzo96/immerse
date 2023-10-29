import axios from 'axios';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt'); // Needed for hashing password
const port = 3000; // ALWAYS UPDATE WHEN CHANGES MADE TO BACKEND SERVER PORT

app.use(bodyParser.json());


// Simulated User data
let users = [
    {
        id: 1,
        user_id: 'DefIK',
        passwordHash: '', // This will be the hashed password
        email: 'DefIceKing@gmail.com',
        fname: 'Gunter',
        lname: 'Petrikov',
        role: 'role',
    }
];

// Registration Route
app.post('/register', async (req, res) => {
    const { name, user_id, email, password, role } = req.body;

    // Check if the username(email) already exists
    const existingUser = users.find(
        (user) => user.email === email
    );

    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already in use' });
    }

    try {
        // Hash the user's password before storing it
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create a new user object with the hashed password
        const newUser = {
            id: users.length + 1,
            name,
            user_id,
            email,
            passwordHash,
            role,
        };

        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User registration failed' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user with the given email
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    try {
        // Verify the password by comparing the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (passwordMatch) {
            // In a real application, you would generate a JWT token for authentication
            res.status(200).json({ message: 'Login successful', user: user });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});