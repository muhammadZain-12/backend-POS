const mongoose = require("mongoose")



const warrantyProductSchema = mongoose.Schema({

    productDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    customerDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    invoiceNumber : {
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
        type: Number,
        required: true
    },
    totalQty: {
        type: Number,
        required: true,
    },
    totalItems: {
        type: Number,
        required: true
    },
    customerName: {
        type: String
    },
    warrantyDate: {
        type: Date
    },
    warrantyInvoiceRef: {
        type: Number
    },
    warrantyRefDate: {
        type: Date
    },
    paymentMethod: {
        type: String
    },
    vatAmount: {
        type: Number
    },
    employeeDetails: {
        type: [mongoose.Schema.Types.Mixed]
    },
    employeeId: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: "Warranty"
    },
    productStatus: {
        type: String,
        required: true
    },
    repairIn: {
        type: Number,
        required: true
    },

})

const warrantyProductModel = mongoose.model("Warrantyproducts", warrantyProductSchema)

module.exports = warrantyProductModel











