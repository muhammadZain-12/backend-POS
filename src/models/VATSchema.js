const mongoose = require("mongoose")



const vatSchema = mongoose.Schema({

    vatRate: {
        type: Number,
        required: true
    },
    vatNumber: {
        type: String,
        required: true
    },
    companyNumber: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    companyAddress: {
        type: String,
        required: true
    },
    companyEmail: {
        type: String,
        required: true
    },


})

const vatModel = mongoose.model("Vat", vatSchema)

module.exports = vatModel











