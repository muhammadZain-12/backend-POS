const mongoose = require("mongoose")



const ClaimInvoiceSchema = mongoose.Schema({

    customerDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    productDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    customerType: {
        type: String
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
    costPrice: {
        type: Number,
    },
    vatAmount: {
        type: Number,
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalQty : {
        type : Number,
        required : true
    },
    customerName: {
        type: String,
        required: true,
    },
    claimDate: {
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
    claimInvoiceRef: {
        type: Number,
        required: true
    },
    invoiceRefDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    referenceId: {
        type: String
    },
    transactionId: {
        type: String
    },
    cheque_no: {
        type: String
    },
    bank_name: {
        type: String
    },
    clear_date: {
        type: Date
    },


})

const ClaimInvoiceModel = mongoose.model("claimInvoices", ClaimInvoiceSchema)

module.exports = ClaimInvoiceModel










