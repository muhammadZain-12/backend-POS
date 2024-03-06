

const mongoose = require("mongoose")



const PurchaseOrderSchema = mongoose.Schema({

    purchaseOrder_number: {
        type: Number,
        required: true
    },
    productDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    supplierDetails: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
    },
    total_cost: {
        type: Number
    },
    total_items: {
        type: Number
    },
    status: {
        type: String,
        default: "pending",
    },
    created_at: {
        type: Date,
        default: Date.now
    }



})

const PuchaseOrderModel = mongoose.model("puchaseOrder", PurchaseOrderSchema)

module.exports = PuchaseOrderModel











