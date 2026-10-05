const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        size: {
            type: String,
            required: false,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        points: {
            type: Number,
            required: true,
            min: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

    },
    {
        timestamps: true,
    }

);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;