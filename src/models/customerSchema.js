const mongoose = require("mongoose")



const CustomerSchema = mongoose.Schema({


    customer_name: {
        type: String,
        // required: true
    },
    comment: {
        type: String,
        // required: true
    },
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    },
    address: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    city: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },

    email: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    postal_code: {
        type: Number,
        // Set the default value to the current timestamp when a document is created
    },
    legal_status: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    telephone_no: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    telephone_no2: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    mobile_number: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    fax: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    account_manager: {
        type: String,
        // Set the default value to the current timestamp when a document is created
    },
    credit_limits: {
        type: Number
    },

    credit_days: {
        type: Number
    },
    discount: {
        type: Number
    },
    price_level: {
        type: [mongoose.Schema.Types.Mixed],
    },
    order_location: {
        type: [mongoose.Schema.Types.Mixed]
    },
    delivery_address: {
        type: String
    },
    delivery_city: {
        type: String
    },
    delivery_postal_code: {
        type: String
    },

})

const CustomerModel = mongoose.model("customers", CustomerSchema)

module.exports = CustomerModel











