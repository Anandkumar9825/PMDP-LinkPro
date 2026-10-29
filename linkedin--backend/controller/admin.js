const userModel = require('../models/userModel')

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password')
        return res.status(200).json({ users })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }
}

const blockUser = async (req, res) => {
    try {
        const { blocked } = req.body

        if (typeof blocked !== 'boolean') {
            return res.status(400).json({ error: 'blocked must be true or false' })
        }

        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            { blocked },
            { new: true }
        ).select('-password')

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.status(200).json({
            message: blocked ? 'User blocked' : 'User unblocked',
            user,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Server error' })
    }
}

module.exports = {
    getAllUsers,
    blockUser,
}
