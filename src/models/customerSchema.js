const mongoose = require("mongoose")



const CustomerSchema = mongoose.Schema({


    customer_name: {
        type: String,
        required: true
    },
    business_name: {
        type: String,
        required: true
    },
    accountNo: {
        type: Number,
        required: true
    },
    credit_balance: {
        type: Number,
    },
    quotation_balance: {
        type: Number,
    },
    comment: {
        type: String,
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
        required: true
        // Set the default value to the current timestamp when a document is created
    },
    postal_code: {
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
        required: true
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

    price_level: {
        type: [mongoose.Schema.Types.Mixed],
        required: true
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
    customerLedger: [{

        date: {
            type: Date,
            default: Date.now
        },
        employeeName: {
            type: String
        },
        status: {
            type: String
        },
        employeeDetails: {
            type: mongoose.Schema.Types.Mixed
        },
        productDetails: {
            type: [mongoose.Schema.Types.Mixed]
        },
        returnProductDetails: {
            type: [mongoose.Schema.Types.Mixed]
        },
        returnProductDetails: {
            type: [mongoose.Schema.Types.Mixed]
        },
        vatAmount: {
            type: Number
        },
        totalItems: {
            type: Number
        },
        totalQty: {
            type: Number
        },
        invoiceAmount: {
            type: Number
        },
        invoiceType: {
            type: String
        },
        paymentMethod:
            { type: String },
        paid: { type: Number },
        toPay: { type: Number },
        refund : {
            type : Number
        },
        paidBackCash : {
            type : Number
        },
        deductCredit : {
            type : Number
        },
        returnAmount : {
            type : Number
        },
        totalReturnInvoices : {
            type : Number
        },
        returnInvoiceRef : {
            type : String
        },
        exchangeSaleAmount : {
            type :Number
        },
        invoiceNumber: { type: String },
        invoiceBarcodeNumber: { type: Number },
        referenceId: {
            type: String
        },
        transactionId: {
            type: String
        },
        cheque_no: {
            type: String
        },
        bank_name: {
            type: String
        },
        clear_date: {
            type: Date
        },
        creditDays: {
            type: Number
        },
        transactionType : {
            type : String
        },
        invoiceRef : {
            type : String
        },
        isChequeCleared: {
            type: Boolean
        },
        chequeClearDate: {
            type: Date
        }
    }]

})

const CustomerModel = mongoose.model("customers", CustomerSchema)

module.exports = CustomerModel











