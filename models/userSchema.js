const mongoose = require("mongoose")



const userSchema = mongoose.Schema({

    full_name: {
        type: String,
        required: true
    },
    employee_id: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirm_password: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    },
    roll : {
        type : String,
        role : "employee"
    }

})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel











