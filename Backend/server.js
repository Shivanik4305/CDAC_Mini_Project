const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// 1. Connect to MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: 3306,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Check database connection
connection.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully");
});

// 2. SIGN UP API
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password ||
            username.trim().length > 100 ||
            password.length < 8 ||
            password.length > 72
        ) {
            return res.status(400).json({
                message: "Enter a username and a password of 8–72 characters."
            });
        }

        const cleanUsername = username.trim();

        // Check if username already exists
        connection.query(
            "SELECT id FROM users WHERE username = ?",
            [cleanUsername],
            async (err, result) => {

                if (err) {
                    console.log(err);

                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (result.length > 0) {
                    return res.status(409).json({
                        message: "Username already exists"
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert user
                connection.query(
                    "INSERT INTO users (username, password) VALUES (?, ?)",
                    [cleanUsername, hashedPassword],
                    (err, result) => {

                        if (err) {
                            console.log(err);

                            if (err.code === "ER_DUP_ENTRY") {
                                return res.status(409).json({
                                    message: "Username already exists"
                                });
                            }

                            return res.status(500).json({
                                message: "Could not register user"
                            });
                        }

                        return res.status(201).json({
                            message: "Registration successful! Please log in."
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// 3. LOGIN API
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
    ) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    connection.query(
        "SELECT id, username, password FROM users WHERE username = ?",
        [username.trim()],
        async (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            const user = result[0];

            // Compare password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            // Generate JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            return res.json({
                message: "Login successful",
                token: token,
                username: user.username
            });
        }
    );
});

// 4. JWT MIDDLEWARE
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, decoded) => {

            if (err) {
                return res.status(401).json({
                    message: "Invalid or expired token. Please log in again."
                });
            }

            req.user = decoded;

            next();
        }
    );
}

// 5. PROTECTED HOME API
app.get("/home", verifyToken, (req, res) => {

    res.json({
        message: "Welcome to your protected home page!",
        username: req.user.username
    });

});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});