const mongoose = require("mongoose");

const Reward = require("../models/rewardModel");

const Redemption = require('../models/redemptionModel');

const User = require('../models/usermodel');

const Point = require('../models/pointModel');

// CREATE REWARD - ADMIN
exports.createReward = async (req, res) => {
    try {
        const {name, description, pointsRequired, quantity} = req.body;

        // Check required fields
        if (!name || !description || pointsRequired === undefined || quantity === undefined) {
            
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                data: null,
            });
        }

        // Check points
        if (!Number.isInteger(pointsRequired) || pointsRequired < 1) {
            return res.status(400).json({
                success: false,
                message: "Points required must be a whole number greater than 0",
                data: null,
            });
        }

        // Check quantity
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a whole number and cannot be negative",
                data: null,
            });
        }

        // Check duplicate reward name
        const existingReward = await Reward.findOne({ name });

        if (existingReward) {
            return res.status(409).json({
                success: false,
                message: "A reward with this name already exists",
                data: null,
            });
        }

        // Create reward
        const reward = await Reward.create({
            name,
            description,
            pointsRequired,
            quantity,
            isAvailable: quantity > 0,
        });

        return res.status(201).json({
            success: true,
            message: "Reward created successfully",
            data: {
                reward,
            },
        });
    } catch (error) {
        console.error("Error creating reward:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create reward",
            data: null,
        });
    }
};

// GET AVAILABLE REWARDS - USER
exports.getRewards = async (req, res) => {
    try {
        const rewards = await Reward.find({ isAvailable: true, quantity: { $gt: 0 }, }).sort({ pointsRequired: 1 });

        return res.status(200).json({
            success: true,
            message: "Available rewards retrieved successfully",
            data: {
                rewards,
            },
        });

    } catch (error) {
        console.error("Error getting available rewards:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve available rewards",
            data: null,
        });
    }
};

// GET ALL REWARDS - ADMIN
exports.getAllRewards = async (req, res) => {
    try {
        const rewards = await Reward.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All rewards retrieved successfully",
            data: {
                rewards,
            },
        });
    } catch (error) {
        console.error("Error getting all rewards:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve rewards",
            data: null,
        });
    }
};

// REDEEM REWARD - USER
exports.redeemReward = async (req, res) => {
    const session = await mongoose.startSession();

    try {

        const { rewardId } = req.body;

        // Check required field
        if (!rewardId) {
            return res.status(400).json({
                success: false,
                message: "Reward ID is required",
                data: null,
            });
        }

        session.startTransaction();

        // Find reward
        const reward = await Reward.findById(rewardId).session(session);

        if (!reward) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Reward not found",
                data: null,
            });
        }

        // Check reward availability
        if (!reward.isAvailable || reward.quantity <= 0) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "This reward is currently unavailable",
                data: null,
            });
        }

        // Find user
        const user = await User.findById(req.user._id).session(session);

        if (!user) {
            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null,
            });
        }

        // Check user's points
        if (user.pointsBalance < reward.pointsRequired) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "You do not have enough points to redeem this reward",
                data: {
                    pointsBalance: user.pointsBalance,
                    pointsRequired: reward.pointsRequired,
                },
            });
        }

        // Deduct points
        user.pointsBalance -= reward.pointsRequired;

        // Reduce reward quantity
        reward.quantity -= 1;

        // Make reward unavailable when stock reaches zero
        if (reward.quantity === 0) {reward.isAvailable = false;}

        // Create redemption record
        const redemption = new Redemption({
            user: user._id,
            reward: reward._id,
            pointsUsed: reward.pointsRequired,
            status: "Completed",
        });

        // Create points transaction
        const pointTransaction = new Point({
            user: user._id,
            type: "Redeemed",
            points: reward.pointsRequired,
            description: `Points redeemed for ${reward.name}`,
        });

        // Save updated user and reward
        await user.save({session});
        await reward.save({session});
        await redemption.save({session});
        await pointTransaction.save({session});

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Reward redeemed successfully",
            data: {
                redemption,
                pointTransaction: pointTransaction[0],
                reward: reward.name,
                pointsUsed: reward.pointsRequired,
                remainingPoints: user.pointsBalance,
                remainingRewardQuantity: reward.quantity,
            },
        });
    } catch (error) {
        await session.abortTransaction();

        console.error("Error redeeming reward:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to redeem reward",
            data: null,
        });
    } finally {
        session.endSession();
    }
};

// GET MY REDEMPTION HISTORY - USER
exports.getMyRedemptionHistory = async (req, res) => {
    try {
        const redemptions = await Redemption.find({ user: req.user._id })
            .populate("reward", "name description pointsRequired").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Your redemption history retrieved successfully",
            data: {
                redemptions,
            },
        });

    } catch (error) {
        console.error("Error getting redemption history:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve redemption history",
            data: null,
        });
    }
};

// GET ALL REDEMPTION HISTORY - ADMIN
exports.getAllRedemptionHistory = async (req, res) => {
    try {
        const redemptions = await Redemption.find()
            .populate("user", "firstName lastName email")
            .populate("reward", "name description pointsRequired")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All redemption history retrieved successfully",
            data: {
                redemptions,
            },
        });
    } catch (error) {
        console.error("Error getting all redemption history:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve redemption history",
            data: null,
        });
    }
};

exports.deactivateReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found",
                data: null,
            });
        }

        reward.isAvailable = false;

        await reward.save();

        return res.status(200).json({
            success: true,
            message: "Reward deactivated successfully",
            data: reward,
        });
    } catch (error) {
        console.error("Error deactivating reward:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to deactivate reward",
            data: null,
        });
    }
};

exports.reactivateReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found",
                data: null,
            });
        }

        if (reward.quantity === 0) {
            return res.status(400).json({
                success: false,
                message: "Reward cannot be reactivated because it has no stock",
                data: null,
            });
        }

        reward.isAvailable = true;

        await reward.save();

        return res.status(200).json({
            success: true,
            message: "Reward reactivated successfully",
            data: reward,
        });
    } catch (error) {
        console.error("Error reactivating reward:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reactivate reward",
            data: null,
        });
    }
};