const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
    },
    f_name: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    blocked: {
        type: Boolean,
        default: false
    },
    headline: {
        type: String,
        default: "LinkPro Member"
    },
    curr_company: {
        type: String,
        default: ""
    },
    curr_location: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    cover_pic: {
        type: String,
        default: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
    },
    about: {
        type: String,
        default: "LinkPro Member. Open to networking and new opportunities."
    },
    skills: {
        type: [String],
        default: [],
    },
    experience: [
        {
            designation: {
                type: String,
                default: ""
            },
            company_name: {
                type: String,
                default: ""
            },
            duration: {
                type: String,
                default: ""
            },
            location: {
                type: String,
                default: ""
            },
            startDate: {
                type: String,
                default: ""
            },
            endDate: {
                type: String,
                default: ""
            },
            isCurrent: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
                default: ""
            }
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    pending_friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    sent_requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post',
        }
    ],
    resume: {
        type: String,
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    resetToken: {
        type: String,
    },
    resetOtp: {
        type: String,
    },
    resetTokenExpire: {
        type: Date,
    },
    deleteAccountOtp: {
        type: String,
    },
    deleteAccountOtpExpire: {
        type: Date,
    },

}, { timestamps: true });

UserSchema.index({ f_name: 'text', headline: 'text', email: 'text' });
UserSchema.index({ friends: 1 });
UserSchema.index({ isOnline: 1 });
UserSchema.index({ createdAt: -1 });

const userModel = mongoose.model('user', UserSchema);
module.exports = userModel;