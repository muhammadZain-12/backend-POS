const mongoose = require("mongoose")



const CustomerLedgerSchema = mongoose.Schema({

    date: {
        type: Date,
        default: Date.now
    },
    employeeName: {
        type: String
    },
    customerId: {
        type: String
    },
    subtotal: {
        type: Number
    },
    discount: {
        type: Number
    },
    total: {
        type: Number
    },
    status: {
        type: String
    },
    employeeDetails: {
        type: mongoose.Schema.Types.Mixed
    },
    productDetails: {
        type: [mongoose.Schema.Types.Mixed]
    },
    returnProductDetails: {
        type: [mongoose.Schema.Types.Mixed]
    },
    returnProductDetails: {
        type: [mongoose.Schema.Types.Mixed]
    },
    vatAmount: {
        type: Number
    },
    totalItems: {
        type: Number
    },
    totalQty: {
        type: Number
    },
    invoiceAmount: {
        type: Number
    },
    invoiceType: {
        type: String
    },
    openingquotationBalance: {
        type: Number
    },

    openinginvoiceBalance: {
        type: Number
    },

    paymentMethod:
        { type: String },
    paid: { type: Number },
    toPay: { type: Number },
    refund: {
        type: Number
    },
    paidBackCash: {
        type: Number
    },
    deductCredit: {
        type: Number
    },
    returnAmount: {
        type: Number
    },
    totalReturnInvoices: {
        type: Number
    },
    returnInvoiceRef: {
        type: String
    },
    exchangeSaleAmount: {
        type: Number
    },
    invoiceNumber: { type: String },
    invoiceBarcodeNumber: { type: Number },
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
    creditDays: {
        type: Number
    },
    transactionType: {
        type: String
    },
    invoiceRef: {
        type: String
    },
    isChequeCleared: {
        type: Boolean
    },
    chequeClearDate: {
        type: Date
    }

})

const CustomerLedgerModel = mongoose.model("customerLedger", CustomerLedgerSchema)

module.exports = CustomerLedgerModel











