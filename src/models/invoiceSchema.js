const mongoose = require("mongoose")



const InvoiceSchema = mongoose.Schema({

    customerDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    productDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    customerType : {
        type : String
    },
    employeeDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    employeeId: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
    },
    subtotal: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true,
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    }

})

const InvoiceModel = mongoose.model("invoices", InvoiceSchema)

module.exports = InvoiceModel











