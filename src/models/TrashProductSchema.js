const mongoose = require("mongoose")



const damageProductSchema = mongoose.Schema({

    product_name: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
    },
    product_color: {
        type: String,
    },
    image1_url: {
        type: String,
        // required: true
    },
    image2_url: {
        type: String,
    },
    image3_url: {
        type: String,
    },
    compatibility: {
        type: String
    },
    supplier_name: {
        type: String
    },
    supplier_address: {
        type: String,
    },
    supplier_mobile_number: {
        type: String
    },
    supplier_id: {
        type: String
    },
    department: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    sub_category: {
        type: String,
        required: true
    },
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
    },
    cost_price: {
        type: Number,
        required: true,
    },

    trade_price: {
        type: Number,
        required: true,
    },
    warehouse_price: {
        type: Number,
        required: true,
    },
    retail_price: {
        type: Number,
        required: true,
    },
    minimum_sale: {
        type: Number,
    },
    minimum_stock: {
        type: Number,
    },
    IMEI: {
        type: Number,
    },
    status: {
        type: String,
        required: true,
        default: "Trash"
    },
    created_at: {
        type: Date,
        default: Date.now, // Set the default value to the current timestamp when a document is created
    },
    barcode: {
        type: Number,
        unique: true,
        required: true
    },
    productLedger: [
        {
            date: { type: Date, default: Date.now },
            qty: { type: Number, required: true },
            status: {
                type: String
            },
            cost_price: {
                type: Number
            },
            retail_price: {
                type: Number
            },
            warehouse_price: {
                type: Number
            },
            trade_price: {
                type: Number
            },
            discount_price: {
                type: Number,
            },
            supplierDetails: {
                supplier_name: { type: String },
                supplier_address: { type: String },
                supplier_mobile_number: { type: String },
                supplier_id: {
                    type: String
                }
            },
            employeeId: {
                type: String
            },
            employeeDetails: {
                type: [mongoose.Schema.Types.Mixed],
            },
            invoiceDetails: {

                customerDetails: {
                    type: [mongoose.Schema.Types.Mixed],
                    required: true
                },
                invoiceNumber: {
                    type: String
                },

                status: {
                    type: String
                },
                paymentMethod: {
                    type: String
                },
                barcodeNumber: {
                    type: Number
                }


            }
        }
    ]

})

const trashProductModel = mongoose.model("Trashproducts", damageProductSchema)

module.exports = trashProductModel











