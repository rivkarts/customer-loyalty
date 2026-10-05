// Call dotenv
require('dotenv').config();

// Call dependencies
const path = require('path');
const express = require('express');
const cors = require('cors');

// Call database and routes
const connectDB = require('./config/databaseConfig');
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const pointRoutes = require('./routes/pointRoutes');
const rewardRoutes = require('./routes/rewardRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Customer Loyalty API is running',
        data: null,
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/rewards', rewardRoutes);

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Customer loyalty API is running on ${PORT}`);
});