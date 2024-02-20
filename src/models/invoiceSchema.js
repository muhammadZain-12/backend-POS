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
    customerType: {
        type: String
    },
    employeeDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    // barcode: {
    //     type: Number,
    //     unique: true,
    //     required: true
    // },
    employeeId: {
        type: String,
        required: true
    },
    barcodeImagePath : {
        type : String
    },
    barcodeNumber : {
        type : Number
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
        type: Number
    },
    totalQty: {
        type: Number
    },
    vatAmount: {
        type: Number,
    },
    companyNumber : {
        type : String
    },
    vatNumber : {
        type : String
},
    creditDays : {
        type : Number
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

const InvoiceModel = mongoose.model("invoices", InvoiceSchema)

module.exports = InvoiceModel











