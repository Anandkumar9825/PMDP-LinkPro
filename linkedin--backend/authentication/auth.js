const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No Token, authorization denied." });
        }

        const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

        // ADMIN HANDLE
        if (decode.role === "admin") {
            req.user = {
                _id: "69c532bdc3915914fae31f02",
                email: "admin@gmail.com",
                role: "admin",
                friends: []
            };
            return next();
        }

        // NORMAL USER
        const user = await User.findById(decode.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        req.user = user;
        next();

    } catch (err) {
        res.status(401).json({ error: "Token is not valid." });
    }
};

exports.optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return next();
        }

        const decode = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        if (decode.role === "admin") {
            req.user = {
                _id: "69c532bdc3915914fae31f02",
                email: "admin@gmail.com",
                role: "admin",
                friends: []
            };
            return next();
        }

        const user = await User.findById(decode.userId).select('-password');
        if (user) {
            req.user = user;
        }
        next();
    } catch (err) {
        next();
    }
};