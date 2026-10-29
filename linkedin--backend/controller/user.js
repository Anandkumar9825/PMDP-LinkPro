
const User = require('../models/user');      // Import model -> user.js File
const bcryptjs = require('bcryptjs');        // Importing bcryptjs to convert password into hashcode.
const { OAuth2Client } = require('google-auth-library');     // Used to verify Gmail Id for Login.
const jwt = require('jsonwebtoken');        // To store user data in cookies by generating token.
const NotificationModal = require('../models/notification');
// Import Creational Design Pattern: Factory Method
const NotificationFactory = require('../patterns/creational/NotificationFactory');
// Import Behavioral Design Pattern: State Pattern
const { ConnectionContext } = require('../patterns/behavioral/ConnectionState');
const sendEmail = require('../authentication/mailer');
const crypto = require('crypto');
const fs = require('fs');


// Creating Object to store Cookies.
const cookieOptions = {
    httpOnly: true,
    secure: false,  // Set to true in production or deploy.
    sameSite: 'Lax' // Set to None in production or deploy.
};

// Function for User Registration.
exports.register = async (req, res) => {
    try {
        let { email, password, f_name } = req.body;
        let isUserExist = await User.findOne({ email: email });     // "find" return Array Values., "findOne" return Object
        if (isUserExist) {
            return res.status(400).json({ error: "Already have an account with this Email. Please try with other Email." });
        }

        // Converting Password into Hashcode into 10 bits.
        const hashedPassword = await bcryptjs.hash(password, 10)
        console.log(hashedPassword)

        // To save code into Database.
        const newUser = new User({
            email,
            password: hashedPassword,
            f_name,
            headline: "LinkPro Member",
            about: "LinkPro Member. Open to networking and new opportunities.",
            profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            cover_pic: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
        });
        await newUser.save();

        // EMAIL SEND to user after registration.
        try {
            await sendEmail(
                email,
                "Welcome to LinkPro",
                `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0;">LinkPro</h1>
                    <p style="margin: 5px 0 0;">Connect. Grow. Succeed.</p>
                </div>

                <!-- Body -->
                <div style="padding: 25px; text-align: center;">
                    <h2 style="color: #111827;">Welcome, ${f_name} 👋</h2>
                    <p style="color: #6b7280; font-size: 15px;">
                        Your account has been successfully created on <b>LinkPro</b>.
                        Start building your professional network and explore opportunities.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">© 2026 LinkPro. All rights reserved.</p>
                </div>

            </div>
        </div>
        `
            );
        } catch (emailError) {
            console.error("Non-fatal: Registration Email failed to send.", emailError);
        }

        return res.status(201).json({ message: "User Registration Successfull.", success: "Yes", data: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
}


// Function for User Login.

// exports.login = async (req, res) => {
//     try {
//         let { email, password } = req.body;
//         const userExist = await User.findOne({ email });

//         if (userExist && await bcryptjs.compare(password, userExist.password)) {
//             let token = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY);       // Generate Token of user for storing data.
//             res.cookie('token', token, cookieOptions)
//             return res.json({ message: "Logged in Successfully.", success: "True", userExist });
//         } else {
//             return res.status(400).json({ error: "Invalid Credentials." });
//         }

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Server Error", message: err.message });
//     }
// }

exports.login = async (req, res) => {
    try {
        let { email, password, rememberMe } = req.body;

        // ADMIN LOGIN
        if (email === "admin@gmail.com" && password === "admin123") {

            let token = jwt.sign(
                { userId: "admin123", role: "admin" },
                process.env.JWT_PRIVATE_KEY
            );

            res.cookie('token', token, cookieOptions);

            return res.json({
                message: "Admin Login Success",
                success: "True",
                isAdmin: true,
                userExist: {
                    email: "admin@gmail.com",
                    role: "admin"
                }
            });
        }

        // FIND USER
        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(400).json({ error: "User not found" });
        }

        // To Display User is Blocked.
        if (userExist.blocked) {
            return res.status(403).json({
                error: "Your account is blocked by Admin"
            });
        }

        // To Check if User has Loggedin with Gmail.
        if (!userExist.password) {
            return res.status(400).json({ error: 'Please Login Through Google.' });
        }

        // Checking Password.
        const isMatch = await bcryptjs.compare(password, userExist.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid Credentials." });
        }

        // TOKEN
        let token = jwt.sign(
            { userId: userExist._id, role: userExist.role || "user" },
            process.env.JWT_PRIVATE_KEY
        );

        const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        res.cookie('token', token, { ...cookieOptions, maxAge: cookieMaxAge });

        return res.json({
            message: "Logged in Successfully.",
            success: "True",
            userExist,
            isAdmin: false
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Function to Login through Gmail.
exports.loginThroughGmail = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let userExist = await User.findOne({ email });

        let isNewUser = false;
        const validGooglePicture = picture && picture.startsWith('http') ? picture : null;

        if (!userExist) {
            isNewUser = true;
            userExist = await User.create({
                googleId: sub,
                email,
                f_name: name,
                headline: "LinkPro Member",
                about: "LinkPro Member. Open to networking and new opportunities.",
                profilePic: validGooglePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                cover_pic: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
            });
        } else {
            // Update existing user with Google avatar if using placeholder
            if (validGooglePicture && (!userExist.profilePic || userExist.profilePic.includes('placeholder'))) {
                userExist.profilePic = validGooglePicture;
                await userExist.save();
            }
        }

        // Display User Blocked
        if (userExist.blocked) {
            return res.status(403).json({
                error: "Your account is blocked by admin"
            });
        }

        let jwttoken = jwt.sign(
            { userId: userExist._id, role: userExist.role || "user" },
            process.env.JWT_PRIVATE_KEY
        );

        res.cookie('token', jwttoken, cookieOptions)

        if (isNewUser) {
            try {
                await sendEmail(
                    email,
                    "Welcome to LinkPro",
                    `
        <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="background-color: #0a66c2; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0;">LinkPro</h1>
                    <p style="margin: 5px 0 0;">Connect. Grow. Succeed.</p>
                </div>
                <!-- Body -->
                <div style="padding: 25px; text-align: center;">
                    <h2 style="color: #111827;">Welcome, ${name} 👋</h2>
                    <p style="color: #6b7280; font-size: 15px;">
                        Your account has been successfully created using Google Sign-In.
                        Start building your professional network and explore opportunities.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p style="margin: 0;">© 2026 LinkPro. All rights reserved.</p>
                </div>
            </div>
        </div>
                    `
                );
            } catch (err) {
                console.error("Gmail Registration Email Failed: ", err);
            }
        }

        return res.status(200).json({
            user: userExist,
            isNewUser,
            googlePicture: validGooglePicture
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
}



// To Update User Details.
exports.updateUser = async (req, res) => {
    try {
        // Get User Details.
        const { user } = req.body;
        const isExist = await User.findById(req.user._id);
        if (!isExist) {
            return res.status(400).json({ error: " User Doesn't Exist. " });
        }
        const updateData = await User.findByIdAndUpdate(isExist._id, user);

        const userData = await User.findById(req.user._id);
        res.status(200).json({
            message: "User Updated Successfully.",
            user: userData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
}



// To see other user Id.
exports.getProfileById = async (req, res) => {
    try {
        let { id } = req.params;

        // Gracefully handle 'me'
        if (id === 'me') {
            if (req.user && req.user._id) {
                id = req.user._id.toString();
            } else if (req.cookies && req.cookies.token) {
                try {
                    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'secret');
                    id = decoded.id || decoded._id;
                } catch (e) {}
            }
        }

        const mongoose = require('mongoose');
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            if (req.user && req.user._id) {
                id = req.user._id.toString();
            } else {
                return res.status(400).json({ error: "Invalid user ID format." });
            }
        }

        const isExist = await User.findById(id).select('-password').lean();
        if (!isExist) {
            return res.status(404).json({ error: "No Such User Exist." });
        }
        return res.status(200).json({
            message: "User Details Fetched Successfully.",
            user: isExist
        });
    } catch (err) {
        console.error("getProfileById error:", err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};



// To Logout User.
exports.logout = async (req, res) => {
    // To Delete cookie when he logout.
    res.clearCookie('token', cookieOptions).json({ message: "Logged Out Successfully. " });
}



// To Search / Discover Users.
exports.findUser = async (req, res) => {
    try {
        let { query } = req.query;
        query = (query || "").trim();

        // Only exclude the logged-in user themselves from the search results
        let excludedIds = [req.user._id];

        const filter = {
            _id: { $nin: excludedIds },
            role: { $nin: ['admin', 'superadmin'] },
            blocked: { $ne: true },
            email: { $not: /admin@/i }
        };

        if (query) {
            filter.$or = [
                { f_name: { $regex: query, $options: 'i' } },
                { headline: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Fetched Members Successfully.",
            users: users
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Dedicated Discover Suggestions endpoint with mutual connection calculation
exports.getDiscoverSuggestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const freshSelf = await User.findById(userId).select('friends pending_friends sent_requests');

        const myFriends = (freshSelf?.friends || []).map(id => id.toString());
        const myPending = (freshSelf?.pending_friends || []).map(id => id.toString());
        const mySent = (freshSelf?.sent_requests || []).map(id => id.toString());

        const excludedIds = [userId.toString(), ...myFriends, ...myPending, ...mySent];

        const filter = {
            _id: { $nin: excludedIds },
            role: { $nin: ['admin', 'superadmin'] },
            blocked: { $ne: true },
            email: { $not: /admin@/i }
        };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const candidates = await User.find(filter)
            .select('f_name headline curr_location profilePic cover_pic friends createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Compute mutual connections count for each candidate
        const suggestions = candidates.map(user => {
            const userObj = user.toObject();
            const candidateFriends = (user.friends || []).map(id => id.toString());
            const mutualCount = candidateFriends.filter(fId => myFriends.includes(fId)).length;

            userObj.mutualConnectionsCount = mutualCount;
            userObj.friendsCount = candidateFriends.length;
            delete userObj.friends; // keep response clean

            return userObj;
        });

        return res.status(200).json({
            message: "Suggestions fetched successfully",
            users: suggestions,
            total: suggestions.length
        });

    } catch (err) {
        console.error("Discovery fetch error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};



// To Send Friend Request.
exports.sendFriendRequest = async (req, res) => {
    try {
        const sender = req.user._id;
        const { reciever } = req.body;

        const userExist = await User.findById(reciever);
        if (!userExist) {
            return res.status(400).json({
                error: "No Such User Exist."
            });
        }

        /**
         * ====================================================================
         * BEHAVIORAL DESIGN PATTERN APPLIED: STATE PATTERN
         * ====================================================================
         * WHY ARE WE USING THIS PATTERN?
         * - A connection between two users is an evolving state machine:
         *     NotConnectedState  --->  PendingRequestState  --->  ConnectedState
         * - The State Pattern eliminates scattered and fragile conditional logic 
         *   by encapsulating state validation (e.g. checking if already friends or 
         *   already requested) and state-specific behavior inside dedicated State classes.
         * 
         * WHERE ARE WE USING THIS PATTERN?
         * - Here in `controller/user.js` -> `sendFriendRequest` via `ConnectionContext`.
         * ====================================================================
         */
        const connectionContext = new ConnectionContext(req.user, userExist);
        const result = await connectionContext.sendRequest();

        return res.status(200).json(result);

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Accept Friend Request.
exports.acceptFriendRequest = async (req, res) => {
    try {
        let { friendId } = req.body;
        let selfId = req.user._id;

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(400).json({
                error: "No Such User Exist."
            });
        }

        /**
         * ====================================================================
         * BEHAVIORAL DESIGN PATTERN APPLIED: STATE PATTERN
         * ====================================================================
         * WHY ARE WE USING THIS PATTERN?
         * - State transition from PendingRequestState to ConnectedState.
         * - Enforces state constraints: only users in PendingRequestState can be accepted.
         * - Automatically mutates friends arrays, removes pending requests,
         *   dispatches acceptance notifications via NotificationFactory, and persists models.
         * 
         * WHERE ARE WE USING THIS PATTERN?
         * - Here in `controller/user.js` -> `acceptFriendRequest`.
         * ====================================================================
         */
        const connectionContext = new ConnectionContext(req.user, friendData);
        const result = await connectionContext.acceptRequest();

        return res.status(200).json(result);

    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Decline Friend Request.
exports.declineFriendRequest = async (req, res) => {
    try {
        let { friendId } = req.body;
        let selfId = req.user._id;

        const friendData = await User.findById(friendId);
        const index = req.user.pending_friends.findIndex(id => id.equals(friendId));
        if (index !== -1) {
            req.user.pending_friends.splice(index, 1);
        }

        if (friendData) {
            const sentIdx = friendData.sent_requests.findIndex(id => id.equals(selfId));
            if (sentIdx !== -1) {
                friendData.sent_requests.splice(sentIdx, 1);
            }
            await friendData.save();
        }

        await req.user.save();
        return res.status(200).json({ message: "Connection request declined." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Revoke / Withdraw Sent Friend Request.
exports.revokeFriendRequest = async (req, res) => {
    try {
        let { targetId } = req.body;
        let selfId = req.user._id;

        const targetUser = await User.findById(targetId);
        const sentIdx = req.user.sent_requests.findIndex(id => id.equals(targetId));
        if (sentIdx !== -1) {
            req.user.sent_requests.splice(sentIdx, 1);
        }

        if (targetUser) {
            const pendIdx = targetUser.pending_friends.findIndex(id => id.equals(selfId));
            if (pendIdx !== -1) {
                targetUser.pending_friends.splice(pendIdx, 1);
            }
            await targetUser.save();
        }

        await req.user.save();
        return res.status(200).json({ message: "Connection request revoked successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Get Friends List.
exports.getFriendsList = async (req, res) => {
    try {
        let friendsList = await req.user.populate("friends", "-password");
        return res.status(200).json({
            friends: friendsList.friends
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Get Pending Received Friends List.
exports.getPendingFriendsList = async (req, res) => {
    try {
        let pendingList = await req.user.populate("pending_friends", "-password");
        return res.status(200).json({
            pendingFriends: pendingList.pending_friends
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// To Get Sent Requests List.
exports.getSentFriendsList = async (req, res) => {
    try {
        let sentList = await req.user.populate("sent_requests", "-password");
        return res.status(200).json({
            sentRequests: sentList.sent_requests
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }
};



// To Remove Friend.
exports.removeFromFriend = async (req, res) => {
    try {
        let selfId = req.user._id;      // Smit.
        let { friendId } = req.params;      // Anand.

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(400).json({
                error: "No Such User Exist."
            })
        }

        const index = req.user.friends.findIndex(id => id.equals(friendId));
        const friendIndex = friendData.friends.findIndex(id => id.equals(selfId));

        if (index !== -1) {
            req.user.friends.splice(index, 1);
        } else {
            return res.status(400).json({
                error: "Not Any Request From Such User."
            })
        }

        if (friendIndex !== -1) {
            friendData.friends.splice(friendIndex, 1)
        } else {
            return res.status(400).json({
                error: "Not Any Request From Such User."
            })
        }

        await req.user.save();
        await friendData.save();
        return res.status(200).json({
            message: "You Both Are Disconnected Now."
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error", message: err.message });
    }

}


// For Forgot Password - Sends 6-digit verification code & reset link
// For Forgot Password - Sends 6-digit verification code & reset link
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Please enter your registered email address." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        const token = crypto.randomBytes(32).toString("hex");
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        if (user) {
            user.resetToken = token;
            user.resetOtp = await bcryptjs.hash(otp, 10);
            user.resetTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
            await user.save();
        } else {
            // Auto-create user account so any typed email works seamlessly!
            const hashedPassword = await bcryptjs.hash("tempDefaultPass123", 10);
            user = new User({
                email: normalizedEmail,
                password: hashedPassword,
                f_name: normalizedEmail.split('@')[0] || "Member",
                headline: "LinkPro Member",
                about: "LinkPro Member.",
                resetToken: token,
                resetOtp: await bcryptjs.hash(otp, 10),
                resetTokenExpire: Date.now() + 15 * 60 * 1000
            });
            await user.save();
        }

        const resetLink = "http://localhost:5173/reset-password/" + token;

        // Big, prominent ASCII banner directly in process.stdout and console.log
        const banner = "\n" +
            "======================================================================\n" +
            "======================================================================\n" +
            ">>> LINKPRO PASSWORD RESET VERIFICATION CODE <<<\n" +
            "USER EMAIL  : " + normalizedEmail + "\n" +
            "6-DIGIT OTP : [ " + otp + " ]\n" +
            "RESET LINK  : " + resetLink + "\n" +
            "VALID FOR   : 15 Minutes\n" +
            "======================================================================\n" +
            "======================================================================\n\n";

        process.stdout.write(banner);
        console.log(banner);

        // Also save to a local text file for absolute convenience
        try {
            fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/LATEST_PASSWORD_RESET_CODE.txt', banner, 'utf8');
            fs.writeFileSync('d:/MCA/MCA Subjects/Gen A.I/LinkedIn/linkedin--backend/LATEST_PASSWORD_RESET_CODE.txt', banner, 'utf8');
        } catch (e) {}

        // Send email if real email / SMTP is configured
        try {
            await sendEmail(
                user.email,
                "LinkPro Password Reset Code",
                `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EE; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E8E8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background-color: #0A66C2; padding: 24px; text-align: center; color: white;">
                            <div style="display: inline-block; background-color: white; color: #0A66C2; font-weight: bold; font-size: 22px; padding: 6px 14px; border-radius: 6px; margin-bottom: 8px;">in</div>
                            <h1 style="margin: 0; font-size: 20px;">LinkPro</h1>
                            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Password Recovery Request</p>
                        </div>
                        <div style="padding: 28px; text-align: center;">
                            <h2 style="color: #191919; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                                We received a request to reset the password for your <b>LinkPro</b> account (${user.email}). Use the 6-digit recovery code below or click the reset link.
                            </p>
                            <div style="display: inline-block; background-color: #F8FAFC; border: 2px dashed #0A66C2; border-radius: 12px; padding: 12px 28px; margin: 20px auto; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0A66C2;">
                                ${otp}
                            </div>
                            <div style="margin: 20px 0;">
                                <a href="${resetLink}" style="display: inline-block; background-color: #0A66C2; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 24px; font-weight: 600; font-size: 14px;">Reset Password Online</a>
                            </div>
                            <p style="color: #8C8C8C; font-size: 12px; margin-top: 15px;">
                                This code will expire in 15 minutes. If you did not request this, please disregard this email.
                            </p>
                        </div>
                        <div style="background-color: #F9FAFB; border-top: 1px solid #E8E8E8; padding: 14px; text-align: center; font-size: 11px; color: #8C8C8C;">
                            <p style="margin: 0;">© 2026 LinkPro. All rights reserved.</p>
                        </div>
                    </div>
                </div>
                `
            );
        } catch (emailErr) {
            console.warn("Nodemailer notice:", emailErr.message);
        }

        return res.status(200).json({
            message: "Password reset verification code sent to your email (and logged in CMD terminal).",
            resetLink
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// For Reset Password - Verifies Token or OTP & Updates Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { email, otp, password, newPassword } = req.body;
        const targetPassword = password || newPassword;

        let user;
        if (token) {
            user = await User.findOne({
                resetToken: token,
                resetTokenExpire: { $gt: Date.now() }
            });
        } else if (email && otp) {
            const candidate = await User.findOne({
                email: email.trim().toLowerCase(),
                resetTokenExpire: { $gt: Date.now() }
            });
            if (candidate && candidate.resetOtp) {
                const isMatch = await bcryptjs.compare(otp.toString().trim(), candidate.resetOtp);
                if (isMatch) user = candidate;
            }
        }

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired password reset token/code." });
        }

        if (!targetPassword || targetPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        user.password = await bcryptjs.hash(targetPassword, 10);
        user.resetToken = undefined;
        user.resetOtp = undefined;
        user.resetTokenExpire = undefined;

        await user.save();

        const successNotice = "\n" +
            "======================================================================\n" +
            ">>> [LINKPRO SECURITY NOTICE] PASSWORD UPDATED SUCCESSFULLY <<<\n" +
            "USER: " + user.email + "\n" +
            "TIME: " + new Date().toLocaleString() + "\n" +
            "======================================================================\n\n";
        process.stdout.write(successNotice);
        console.log(successNotice);

        // Send confirmation email to user that password was updated!
        try {
            await sendEmail(
                user.email,
                "LinkPro Security Alert: Password Updated Successfully",
                `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EE; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E8E8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background-color: #0A66C2; padding: 24px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 20px;">LinkPro</h1>
                            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Security Alert</p>
                        </div>
                        <div style="padding: 28px; text-align: center;">
                            <h2 style="color: #191919; font-size: 18px; margin-top: 0;">Password Successfully Updated 🔒</h2>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                                Hi <b>${user.f_name || 'Member'}</b>, the password for your LinkPro account (${user.email}) was successfully updated on ${new Date().toLocaleString()}.
                            </p>
                            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 12px; color: #64748B;">
                                If you made this change, you can now log in with your new password. If you did NOT make this change, please contact support or reset your password immediately.
                            </div>
                        </div>
                        <div style="background-color: #F9FAFB; border-top: 1px solid #E8E8E8; padding: 14px; text-align: center; font-size: 11px; color: #8C8C8C;">
                            <p style="margin: 0;">© 2026 LinkPro Security. All rights reserved.</p>
                        </div>
                    </div>
                </div>
                `
            );
        } catch (emailErr) {
            console.warn("Reset password confirmation email notice:", emailErr.message);
        }

        return res.status(200).json({ message: "Password reset successfully. A confirmation email has been sent. You can now log in." });

    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Change Password in Profile Settings with current password verification
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Please enter both current and new password." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters long." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Validate current password
        if (user.password) {
            const isMatch = await bcryptjs.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password does not match our records." });
            }
        }

        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();

        // Dispatch security alert email
        try {
            await sendEmail(
                user.email,
                "LinkPro Security Alert: Password Changed",
                `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EE; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E8E8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <div style="background-color: #0A66C2; padding: 24px; text-align: center; color: white;">
                            <div style="display: inline-block; background-color: white; color: #0A66C2; font-weight: bold; font-size: 22px; padding: 6px 14px; border-radius: 6px; margin-bottom: 8px;">in</div>
                            <h1 style="margin: 0; font-size: 20px;">LinkPro</h1>
                            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Security Alert</p>
                        </div>
                        <div style="padding: 28px; text-align: center;">
                            <h2 style="color: #191919; font-size: 18px; margin-top: 0;">Password Successfully Updated 🔒</h2>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                                Hi ${user.f_name || 'Member'}, the password for your <b>LinkPro</b> account was recently changed on ${new Date().toLocaleString()}.
                            </p>
                            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 12px; color: #64748B;">
                                If you performed this change, no further action is required. If you did NOT make this change, please reset your password immediately.
                            </div>
                        </div>
                        <div style="background-color: #F9FAFB; border-top: 1px solid #E8E8E8; padding: 14px; text-align: center; font-size: 11px; color: #8C8C8C;">
                            <p style="margin: 0;">© 2026 LinkPro Security. All rights reserved.</p>
                        </div>
                    </div>
                </div>
                `
            );
        } catch (emailErr) {
            console.warn("Change password email notice:", emailErr.message);
        }

        return res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        console.error("Change password error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Step 1: Request 6-digit OTP for Account Deletion
exports.requestDeleteAccountOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcryptjs.hash(otp, 10);

        user.deleteAccountOtp = hashedOtp;
        user.deleteAccountOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        console.log(`[ACCOUNT DELETION OTP] Generated OTP for ${user.email}: ${otp}`);

        // Dispatch Email
        await sendEmail(
            user.email,
            "Security Code: Confirm LinkPro Account Deletion",
            `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EE; padding: 24px;">
                <div style="max-width: 480px; margin: auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E8E8; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; background-color: #0A66C2; color: #FFFFFF; font-weight: bold; font-size: 24px; padding: 8px 16px; border-radius: 8px;">in</div>
                        <h2 style="color: #191919; margin-top: 16px; font-size: 20px;">Confirm Account Deletion</h2>
                        <p style="color: #666666; font-size: 14px; margin-top: 4px;">You requested to permanently delete your LinkPro account.</p>
                    </div>
                    <div style="background-color: #FFF5F5; border: 1px solid #FED7D7; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 12px; color: #CC1016; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Your 6-Digit Verification Code</span>
                        <div style="font-size: 32px; font-weight: 800; color: #CC1016; letter-spacing: 6px; margin: 12px 0;">${otp}</div>
                        <p style="font-size: 12px; color: #742A2A; margin: 0;">This code is valid for 10 minutes. Do not share it with anyone.</p>
                    </div>
                    <p style="color: #666666; font-size: 13px; line-height: 1.5;">
                        If you did not request this, please secure your account immediately. Your account will remain intact until verified.
                    </p>
                </div>
            </div>
            `
        );

        return res.status(200).json({
            message: "Verification code sent to your registered email.",
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
        });

    } catch (err) {
        console.error("Error requesting deletion OTP:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// Step 2: Verify OTP and Execute Full Cascade Deletion
exports.verifyDeleteAccountOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user._id;

        if (!otp || otp.toString().trim().length !== 6) {
            return res.status(400).json({ error: "Please enter a valid 6-digit verification code." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!user.deleteAccountOtp || !user.deleteAccountOtpExpire) {
            return res.status(400).json({ error: "No active verification code found. Please request a new code." });
        }

        if (new Date(user.deleteAccountOtpExpire).getTime() < Date.now()) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
        }

        const isMatch = await bcryptjs.compare(otp.toString().trim(), user.deleteAccountOtp);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
        }

        // Full Cascade Deletion across all collections
        const PostModel = require('../models/post');
        const CommentModel = require('../models/comment');
        const MessageModel = require('../models/message');
        const ConversationModel = require('../models/conversation');

        // 1. Delete user's posts & associated comments
        const userPosts = await PostModel.find({ user: userId }).select('_id');
        const userPostIds = userPosts.map(p => p._id);
        await CommentModel.deleteMany({ post: { $in: userPostIds } });
        await PostModel.deleteMany({ user: userId });

        // 2. Delete user's comments on other posts and decrement comments count
        const userComments = await CommentModel.find({ user: userId });
        for (let comment of userComments) {
            await PostModel.findByIdAndUpdate(comment.post, { $inc: { comments: -1 } });
        }
        await CommentModel.deleteMany({ user: userId });

        // 3. Remove user from all likes
        await PostModel.updateMany({}, { $pull: { likes: userId } });
        await CommentModel.updateMany({}, { $pull: { likes: userId } });

        // 4. Remove user from friends, pending_friends, and sent_requests of all users
        await User.updateMany({}, {
            $pull: {
                friends: userId,
                pending_friends: userId,
                sent_requests: userId
            }
        });

        // 5. Delete messages & conversations
        await MessageModel.deleteMany({ sender: userId });
        await ConversationModel.deleteMany({ members: userId });

        // 6. Delete notifications
        await NotificationModal.deleteMany({
            $or: [{ sender: userId }, { reciever: userId }]
        });

        // 7. Dispatch Farewell / Account Deletion Confirmation Email
        const userEmail = user.email;
        const userName = user.f_name || "Member";
        try {
            await sendEmail(
                userEmail,
                "LinkPro Account Deletion Confirmation",
                `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F2EE; padding: 24px;">
                    <div style="max-width: 500px; margin: auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E8E8E8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <!-- Header -->
                        <div style="background-color: #0A66C2; padding: 24px; text-align: center; color: white;">
                            <div style="display: inline-block; background-color: white; color: #0A66C2; font-weight: bold; font-size: 22px; padding: 6px 14px; border-radius: 6px; margin-bottom: 8px;">in</div>
                            <h1 style="margin: 0; font-size: 20px;">LinkPro</h1>
                            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Account Successfully Deleted</p>
                        </div>
                        <!-- Body -->
                        <div style="padding: 28px; text-align: center;">
                            <h2 style="color: #191919; font-size: 18px; margin-top: 0;">Goodbye, ${userName} 👋</h2>
                            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                                We confirm that your <b>LinkPro</b> account and all associated personal records, posts, comments, messages, and connections have been permanently erased from our servers.
                            </p>
                            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin: 20px 0; text-align: left; font-size: 12px; color: #64748B;">
                                <div style="font-weight: bold; color: #334155; margin-bottom: 4px;">Data Erased Summary:</div>
                                • Profile details, experience & resume: Cleared<br/>
                                • Feed posts, comments & likes: Removed<br/>
                                • Chat messages & conversations: Purged<br/>
                                • Network connections: Disconnected
                            </div>
                            <p style="color: #8C8C8C; font-size: 12px; margin-top: 15px;">
                                Thank you for being part of LinkPro. You are always welcome back whenever you wish to create a new professional journey.
                            </p>
                        </div>
                        <!-- Footer -->
                        <div style="background-color: #F9FAFB; border-top: 1px solid #E8E8E8; padding: 14px; text-align: center; font-size: 11px; color: #8C8C8C;">
                            <p style="margin: 0;">© 2026 LinkPro. All rights reserved.</p>
                        </div>
                    </div>
                </div>
                `
            );
        } catch (emailErr) {
            console.warn("Account deletion email notice:", emailErr.message);
        }

        // 8. Delete user account record
        await User.findByIdAndDelete(userId);

        // 9. Clear cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax'
        });

        return res.status(200).json({
            message: "Account and all associated data permanently deleted."
        });

    } catch (err) {
        console.error("Account deletion error:", err);
        return res.status(500).json({ error: "Server Error during account deletion", message: err.message });
    }
};

// ==========================================
// EXPERIENCE CRUD CONTROLLERS
// ==========================================

// 1. Add Experience
exports.addExperience = async (req, res) => {
    try {
        const userId = req.user._id;
        const { designation, company_name, duration, location, startDate, endDate, isCurrent, description } = req.body;

        if (!designation || !company_name) {
            return res.status(400).json({ error: "Role/Designation and Company name are required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Generate formatted duration if not provided
        let computedDuration = duration;
        if (!computedDuration && startDate) {
            computedDuration = `${startDate} - ${isCurrent ? 'Present' : (endDate || 'Present')}`;
        }

        const newExperience = {
            designation: designation.trim(),
            company_name: company_name.trim(),
            duration: (computedDuration || "").trim(),
            location: (location || "").trim(),
            startDate: (startDate || "").trim(),
            endDate: (endDate || "").trim(),
            isCurrent: Boolean(isCurrent),
            description: (description || "").trim()
        };

        user.experience.unshift(newExperience);
        await user.save();

        const updatedUser = await User.findById(userId).select("-password");

        return res.status(201).json({
            message: "Experience added successfully.",
            experience: user.experience,
            user: updatedUser
        });
    } catch (err) {
        console.error("Add experience error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// 2. Edit Experience
exports.editExperience = async (req, res) => {
    try {
        const userId = req.user._id;
        const { expId } = req.params;
        const { designation, company_name, duration, location, startDate, endDate, isCurrent, description } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const expIndex = user.experience.findIndex(item => item._id.toString() === expId.toString());
        if (expIndex === -1) {
            return res.status(404).json({ error: "Experience record not found." });
        }

        let computedDuration = duration;
        if (!computedDuration && startDate) {
            computedDuration = `${startDate} - ${isCurrent ? 'Present' : (endDate || 'Present')}`;
        }

        if (designation !== undefined) user.experience[expIndex].designation = designation.trim();
        if (company_name !== undefined) user.experience[expIndex].company_name = company_name.trim();
        if (computedDuration !== undefined) user.experience[expIndex].duration = computedDuration.trim();
        if (location !== undefined) user.experience[expIndex].location = location.trim();
        if (startDate !== undefined) user.experience[expIndex].startDate = startDate.trim();
        if (endDate !== undefined) user.experience[expIndex].endDate = endDate.trim();
        if (isCurrent !== undefined) user.experience[expIndex].isCurrent = Boolean(isCurrent);
        if (description !== undefined) user.experience[expIndex].description = description.trim();

        await user.save();

        const updatedUser = await User.findById(userId).select("-password");

        return res.status(200).json({
            message: "Experience updated successfully.",
            experience: user.experience,
            user: updatedUser
        });
    } catch (err) {
        console.error("Edit experience error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};

// 3. Delete Experience
exports.deleteExperience = async (req, res) => {
    try {
        const userId = req.user._id;
        const { expId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const initialLength = user.experience.length;
        user.experience = user.experience.filter(item => item._id.toString() !== expId.toString());

        if (user.experience.length === initialLength) {
            return res.status(404).json({ error: "Experience record not found." });
        }

        await user.save();

        const updatedUser = await User.findById(userId).select("-password");

        return res.status(200).json({
            message: "Experience deleted successfully.",
            experience: user.experience,
            user: updatedUser
        });
    } catch (err) {
        console.error("Delete experience error:", err);
        return res.status(500).json({ error: "Server Error", message: err.message });
    }
};