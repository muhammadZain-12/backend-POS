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

})

const vatModel = mongoose.model("Vat", vatSchema)

module.exports = vatModel











