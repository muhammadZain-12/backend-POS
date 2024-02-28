const mongoose = require("mongoose")



const cashSchema = mongoose.Schema({

    invoiceNumber: {
        type: String,
    },
    employeeId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    supplierDetails: {
        type: [mongoose.Schema.Types.Mixed],
    },
    customerDetails: {
        type: [mongoose.Schema.Types.Mixed],
    },
    employeeDetails: {
        type: [mongoose.Schema.Types.Mixed],
    },
    date: {
        type: Date,
        default: Date.now
    }

})

const cashModel = mongoose.model("Cash", cashSchema)

module.exports = cashModel











