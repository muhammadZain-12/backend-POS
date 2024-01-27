const ClaimInvoiceModel = require("../models/claimInvoiceSchema")
const damageProductModel = require("../models/damageProductsSchema")
const ProductModel = require("../models/productSchema")
const warrantyProductModel = require("../models/warrantyProductSchema")
const moment = require("moment")


const ClaimInvoiceController = {

    post: async (req, res) => {

        let invoiceData = req.body
        let totalInvoice = await ClaimInvoiceModel.countDocuments({})
        invoiceData.invoiceNumber = totalInvoice + 1

        let { customerDetails, productDetails, total, discount, subtotal, employeeDetails, claimDate, status, paymentMethod, customerName, totalItems, totalQty, claimInvoiceRef } = req.body
        if (!customerDetails || !productDetails  || !total || !subtotal || !employeeDetails || !claimDate || !status || !totalItems || !totalQty || !customerName || !claimInvoiceRef) {

            res.json({
                message: " Required fields are missing",
                status: false
            })
            return
        }

        const updatePromises = productDetails.map(async (product) => {

            console.log(product, "products")

            const existingProduct = await ProductModel.findOne({ _id: product._id });

            console.log(existingProduct, "existing")

            if (existingProduct) {
                // If the product exists, update the damageQty
                existingProduct.qty -= product.DamageQty;
                await existingProduct.save();
            }
        })


        await Promise.all(updatePromises)



        ClaimInvoiceModel.create(invoiceData).then(async (data) => {


            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            res.json({
                message: "Transaction Successful",
                status: true,
                data: data
            })

        }).catch((err) => {

            res.json({
                message: err.message,
                status: false
            })
        })
    },

    addWarrantyProducts: async (req, res) => {


        let warrantyData = req.body

        let invoiceNumber = await warrantyProductModel.countDocuments({})

        warrantyData.invoiceNumber = invoiceNumber + 1

        warrantyProductModel.create(warrantyData).then((data) => {

            if (data) {

                res.json({
                    message: "Product Adds in warranty repair",
                    status: true,
                    data: data
                })

            }
            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false,

                })
            }


        }).catch((err) => {

            res.json({
                message: err.message,
                status: false,
            })

        })

    },

    getEmployeeDayClaimInvoices: async (req, res) => {



        try {
            let employeeId = req.params.id; // Assuming the employee ID is passed as a parameter

            // console.log(employeeId, "empliyee")

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await ClaimInvoiceModel.find({
                employeeId: employeeId,
                claimDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
            });

            // console.log(invoices, "invoices")

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }

            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }
    },
    getDayAllClaimInvoices: async (req, res) => {


        try {

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await ClaimInvoiceModel.find({
                claimDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
            });

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }


            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }

    },
    getAllClaimInvoices: async (req, res) => {


        try {

            const invoices = await ClaimInvoiceModel.find({});

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }

            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }

    },

    getEmployeeDayWarrantyInvoices: async (req, res) => {



        try {
            let employeeId = req.params.id; // Assuming the employee ID is passed as a parameter

            // console.log(employeeId, "empliyee")

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await warrantyProductModel.find({
                employeeId: employeeId,
                warrantyDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
            });

            // console.log(invoices, "invoices")

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }

            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }
    },
    getDayAllWarrantyInvoices: async (req, res) => {


        try {

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await warrantyProductModel.find({
                warrantyDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
            });

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }


            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }

    },
    getAllWarrantyInvoices: async (req, res) => {


        try {

            const invoices = await warrantyProductModel.find({});

            if (!invoices || invoices.length === 0) {
                res.json({
                    message: "No invoices found for the specified employee and date",
                    status: true,
                    data: []
                });
                return;
            }

            res.json({
                message: "Invoices successfully retrieved",
                status: true,
                data: invoices
            });
        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            });
        }

    },

}


module.exports = ClaimInvoiceController