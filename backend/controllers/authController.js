const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const User = require('../models/usermodel');

const generateToken = require('../utilities/generateToken')

const generateVerificationCode = require("../utilities/generateEmailCode");

const sendVerificationEmail = require("../utilities/sendEmail");


// Create new user
exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        if (!firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
                data: null,
            });
        }

        // Check for existing user (email and phone)

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
        });

        if (existingUser) {
             if (existingUser.email === normalizedEmail) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists",
                    data: null,
                });
            }

                return res.status(409).json({
                    success: false,
                    message: "This phone number is already in use",
                    data: null,
                });
        }

        // Hashing password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Generate verification code

        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
        const verificationSentAt = new Date();

        const user = await User.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            role: "USER",
            isActive: false,
            isEmailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires,  
            emailVerificationSentAt: verificationSentAt,  
        });

        try {
            await sendVerificationEmail(user.email, user.firstName, verificationCode);

        } catch (error) {
                await User.findByIdAndDelete(user._id);

                return res.status(500).json({
                    success: false,
                    message: "Account could not be created because verification email failed",
                    error: 'Unable to send verification email',
                    data: null,
                });
            }

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                isEmailVerified: user.isEmailVerified,
                pointsBalance: user.pointsBalance,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message,
            data: null,
        });
    }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code ) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select("+emailVerificationCode +emailVerificationExpires");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null,
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
                data: null,
            });
        }

        if ( !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification code has expired",
                data: null,
            });
        }

        if (user.emailVerificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code",
                data: null,
            });
        }

        user.isEmailVerified = true;
        user.isActive = true;

        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        user.emailVerificationSentAt = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully. Your account is now active.",
        });

    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Unable to verify email',
        });
    }
};

// RESEND VERIFICATION CODE
exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
                data: null,
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail }).select("+emailVerificationCode +emailVerificationExpires +emailVerificationSentAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null, 
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
                data: null,
            });
        }

        if (user.emailVerificationSentAt) {
            const secondsSinceLastSent = (Date.now() - user.emailVerificationSentAt.getTime()) / 1000;

            if (secondsSinceLastSent < 60) {
                const secondsRemaining = Math.ceil(60 - secondsSinceLastSent);

                return res.status(429).json({
                    success: false,
                    message: `Please wait ${secondsRemaining} seconds before requesting another verification code`,
                    data: null,
                });
            }
        }

        const verificationCode = generateVerificationCode();

        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

        const verificationSentAt = new Date();

        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = verificationExpires;
        user.emailVerificationSentAt = verificationSentAt;

        await user.save();

        await sendVerificationEmail(user.email, user.firstName, verificationCode);

        res.status(200).json({
            success: true,
            message: "A new verification code has been sent to your email.",
            data: null,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to resend verification code',
            data: null,
        });
    }
};

// LOGIN
exports.loginUser = async (req, res) => {
    try {

        // Check required fields
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                data: null,
            });
        }

        // Check if user exists and password match

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({email: normalizedEmail}).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                data: null,
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                data: null,
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in",
                data: null,
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
                data: null,
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                    pointsBalance: user.pointsBalance,
                    avatarUrl: user.avatarUrl,
                    createdAt: user.createdAt,
                },
            },
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Unable to login user',
        data: null,   
        });
    }
};

// get user

exports.getUser = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: {
            user: {
                id: req.user._id.toString(),
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                pointsBalance: req.user.pointsBalance,
                isEmailVerified: req.user.isEmailVerified,
                avatarUrl: req.user.avatarUrl,
                createdAt: req.user.createdAt,
            },
        },
    });
};

// Get all users (ADMIN)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -emailVerificationExpires -emailVerificationSentAt');

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to retrieve users',
            data: null
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const {firstName, lastName, phone, avatarIcon} = req.body;

        const user = req.user;

        // Preset icon avatars (not uploaded files) are sent as a short id like
        // "solar:cat-bold" and stored prefixed with "icon:" so the frontend can
        // tell them apart from an uploaded file path.
        if (avatarIcon !== undefined) {
            if (typeof avatarIcon !== 'string' || !avatarIcon.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid avatar icon',
                    data: null,
                });
            }
            user.avatarUrl = `icon:${avatarIcon.trim()}`;
        }

        if (firstName !== undefined) {
            user.firstName = firstName;
        }

        if (lastName !== undefined) {
            user.lastName = lastName;
        }

        if (phone !== undefined) {
            const normalizedPhone = phone.trim();

            const existingPhone = await User.findOne({
                phone,
                _id: {$ne: user._id},
            });

            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number is already in use',
                    data: null
                });
            }

            user.phone = normalizedPhone;
        }

        await user.save();

        return res.status (200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id.toString(),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    pointsBalance: user.pointsBalance,
                    avatarUrl: user.avatarUrl
                },
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to update profile',
            data: null
        })
    }
};

// Upload / replace profile picture
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file was provided',
                data: null,
            });
        }

        const user = req.user;

        // Delete the old avatar file from disk if one exists, so uploads
        // don't pile up unused files every time someone changes their photo.
        if (user.avatarUrl) {
            const oldPath = path.join(__dirname, '..', 'uploads', 'avatars', path.basename(user.avatarUrl));
            fs.unlink(oldPath, () => {}); // best-effort, ignore errors
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        user.avatarUrl = avatarUrl;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        console.error('Upload avatar error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to upload profile picture',
            data: null,
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please enter current and new password',
                data: null
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
                data: null
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword, 
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
                data: null
            });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from your current password',
                data: null
            });
        }

        // Encrypt password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.passwordChangedAt = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: null
        });
    } catch (error) {
        console.error('Change Password error:', error)

        res.status(500).json({
            success: false,
            message: 'Unable to change password',
            data: null
        });
    }
};

// Deactivate own Account 
exports.deactivateAccount = async (req, res) => {
    try {
        const user = req.user;

        user.isActive = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account deactivated successfully',
            data: null
        });
    } catch (error) {
        console.error('Deactivate account error:', error);

        return res.status(500).json({
            success: false,
            message: 'Deactivation failed',
            data: null
        });
    }
};

exports.deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account from this endpoint',
                data: null
            });
        }

        user.isActive = false;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User account deactivated successfully',
            data: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to deactivate user account',
            data: null
        });
    }
};

// Activate user (ADMIN)
exports.activateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }

        user.isActive = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User account activated successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Unable to activate user account',
            data: null
        });
    }
};




