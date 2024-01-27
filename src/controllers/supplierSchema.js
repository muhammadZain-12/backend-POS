



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
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    }

})

const supplierModel = mongoose.model("supplier", supplierSchema)

module.exports = supplierModel











