const mongoose = require("mongoose")



const emailSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    info: {

        type: [mongoose.Schema.Types.Mixed]

    },
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    },

})

const emailModel = mongoose.model("emails", emailSchema)

module.exports = emailModel











