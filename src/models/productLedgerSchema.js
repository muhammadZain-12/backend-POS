const mongoose = require("mongoose")



const ProductLedgerSchema = mongoose.Schema({

    date: { type: Date, default: Date.now },
    qty: { type: Number },
    status: {
        type: String
    },
    cost_price: {
        type: Number
    },
    retail_price: {
        type: Number
    },
    warehouse_price: {
        type: Number
    },
    trade_price: {
        type: Number
    },
    discount_price: {
        type: Number,
    },
    supplierDetails: {
        supplier_name: { type: String },
        paymentMethod: { type: String },
        supplier_address: { type: String },
        supplier_mobile_number: { type: String },
        supplier_id: {
            type: String
        }
    },
    employeeId: {
        type: String
    },
    employeeDetails: {
        type: [mongoose.Schema.Types.Mixed],
    },
    invoiceDetails: {

        customerDetails: {
            type: [mongoose.Schema.Types.Mixed],
            required: true
        },
        invoiceNumber: {
            type: String
        },

        status: {
            type: String
        },
        paymentMethod: {
            type: String
        },
        barcodeNumber: {
            type: Number
        },

    }


})

const ProductLedgerModel = mongoose.model("productLedger", ProductLedgerSchema)

module.exports = ProductLedgerModel











