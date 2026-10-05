const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Where avatar files get saved on disk.
const avatarDir = path.join(__dirname, '..', 'uploads', 'avatars');

// Make sure the folder exists before multer tries to write into it.
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        // req.user is already set by the protect middleware, which runs before this.
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${req.user._id}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
    }
};

const uploadAvatar = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

module.exports = uploadAvatar;
