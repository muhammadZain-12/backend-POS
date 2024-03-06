



const mongoose = require("mongoose")



const supplierSchema = mongoose.Schema({

    supplierName: {
        type: String,
        required: true
    },
    shopDetails: {
        type: String,
    },
    mobileNumber: {
        type: String,
        required: true
    },
    balance: {
        type: Number
    },
    supplier_ledger : [
        {
        date : {
            type : Date,
            default : Date.now
        },
        productName : {
            type : String
        },
        barcode : {
            type : mongoose.Schema.Types.Mixed
        },
        qty : {
            type : Number
        },
        totalAmount : {
            type : Number
        },
        paymentMethod : {
            type : String
        },
        status : {
            type : String,
        },
        cost_price : {
            type : Number
        },
        retail_price : {
            type : Number
        },
        warehouse_price : {
            type : Number
        },
        trade_price : {
            type : Number
        },
        payAmount : {
            type : Number
        },
    }

    ],
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    }

})

const supplierModel = mongoose.model("supplier", supplierSchema)

module.exports = supplierModel











