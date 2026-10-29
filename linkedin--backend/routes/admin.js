// const express = require('express')
// const router = express.Router()
// const User = require('../models/user')
// const { auth } = require('../authentication/auth')

// router.get('/users', auth, async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ error: 'Access Denied' })
//         }

//         const users = await User.find().select('-password')

//         res.json({
//             success: true,
//             users,
//         })
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// })

// router.patch('/users/:id/block', auth, async (req, res) => {
//     try {
//         if (req.user.role !== 'admin') {
//             return res.status(403).json({ error: 'Access Denied' })
//         }

//         const { blocked } = req.body

//         if (typeof blocked !== 'boolean') {
//             return res.status(400).json({ error: 'blocked must be true or false' })
//         }

//         const updatedUser = await User.findByIdAndUpdate(
//             req.params.id,
//             { blocked },
//             { new: true }
//         ).select('-password')

//         if (!updatedUser) {
//             return res.status(404).json({ error: 'User not found' })
//         }

//         res.json({
//             success: true,
//             message: blocked ? 'User blocked' : 'User unblocked',
//             user: updatedUser,
//         })
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// })

// module.exports = router


// routes/admin.js

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const { auth } = require('../authentication/auth')

// Getting User + Posts Details
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access Denied' })
        }

        const users = await User.find().select('-password')

        const usersWithPosts = await Promise.all(
            users.map(async (user) => {
                const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 })

                return {
                    ...user._doc,
                    posts
                }
            })
        )

        res.json({
            success: true,
            users: usersWithPosts
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


// BLOCK / UNBLOCK USER
router.patch('/users/:id/block', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access Denied' })
        }

        const { blocked } = req.body

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { blocked },
            { new: true }
        ).select('-password')

        res.json({
            success: true,
            message: blocked ? 'User blocked' : 'User unblocked',
            user
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
