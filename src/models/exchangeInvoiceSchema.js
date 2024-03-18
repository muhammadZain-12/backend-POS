const mongoose = require("mongoose")



const ExchangeInvoiceSchema = mongoose.Schema({

    customerDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    productDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    returnProductDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    customerType: {
        type: String
    },
    deductCreditBalance: {
        type: Boolean
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
    returnSubtotal: {
        type: Number
    },
    saleSubtotal: {
        type: Number
    },
    costPrice: {
        type: Number,
    },
    barcodeImagePath: {
        type: String
    },
    barcodeNumber: {
        type: Number
    },
    vatAmount: {
        type: Number,
    },
    vatNumber: {
        type: String,
    },
    companyNumber: {
        type: String,
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalQty: {
        type: Number,
        required: true
    },
    customerName: {
        type: String,
        required: true,
    },
    exchangeDate: {
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
    returnInvoiceRef: {
        type: String,
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
    credit_days: {
        type: Number
    },
    clear_date: {
        type: Date
    },


})

const ExchangeInvoiceModel = mongoose.model("exchangeInvoices", ExchangeInvoiceSchema)

module.exports = ExchangeInvoiceModel











