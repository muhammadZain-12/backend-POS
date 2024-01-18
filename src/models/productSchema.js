const mongoose = require("mongoose")



const productSchema = mongoose.Schema({

    product_name: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
    },
    product_color: {
        type: [String] || String,
    },
    image1_url: {
        type: String,
        // required: true
    },
    image2_url: {
        type: String,
    },
    image3_url: {
        type: String,
    },
    supplier_code: {
        type: String
    },
    supplier_series: {
        type: String
    },
    department: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    sub_category: {
        type: String,
        required: true
    },
    make: {
        type: String,
        required: true,
        default: 1
    },
    model: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 1
    },
    reminder_qty: {
        type: Number,
    },
    cost_price: {
        type: Number,
        required: true,

    },
    trade_price: {
        type: Number,
        required: true,

    },
    warehouse_price: {
        type: Number,
        required: true,

    },
    retail_price: {
        type: Number,
        required: true,

    },
    cost_price_w_vat: {
        type: Number,
        required: true,

    },
    trade_price_w_vat: {
        type: Number,
        required: true,

    },
    warehouse_price_w_vat: {
        type: Number,
        required: true,

    },
    retail_price_w_vat: {
        type: Number,
        required: true,

    },
    retail_price_w_vat: {
        type: Number,
        required: true,

    },
    transportation_price: {
        type: Number,
    },

    transportation_price_w_vat: {
        type: Number,
    },

    other_expense: {
        type: Number,
    },
    other_expense_w_vat: {
        type: Number,
    },
    minimum_sale: {
        type: Number,
    },

    minimum_stock: {
        type: Number,
    },

    IMEI: {
        type: Number,
    },

    status: {
        type: String,
        required: true,
        default: "Active"

    },
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    },
    barcode: {
        type: Number,
        unique: true,
        required: true
    }   

})

const productModel = mongoose.model("products", productSchema)

module.exports = productModel











