const mongoose = require("mongoose")



const DemandedProductSchema = mongoose.Schema({

    product_name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    },

})

const DemandedProductModel = mongoose.model("DemandedProduct", DemandedProductSchema)

module.exports = DemandedProductModel














