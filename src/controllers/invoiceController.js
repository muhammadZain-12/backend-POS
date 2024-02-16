const CustomerModel = require("../models/customerSchema")
const InvoiceModel = require("../models/invoiceSchema")
const ProductModel = require("../models/productSchema")
const moment = require("moment")


const InvoiceController = {

    post: async (req, res) => {

        let invoiceData = req.body

        let totalInvoice = await InvoiceModel.countDocuments({})

        invoiceData.invoiceNumber = totalInvoice + 1
        

        let { customerDetails, productDetails, total, discount, deductAmount,subtotal, employeeDetails, status, paymentMethod, customerName, totalItems } = req.body

        if (!customerDetails || !productDetails || !total || !subtotal || !employeeDetails ||  !status || !paymentMethod || !totalItems || !customerName) {

            res.json({
                message: " Required fields are missing",
                status: false
            })
            return
        }

        const productsToUpdate = productDetails.map(product => ({
            productId: product._id,
            quantity: product.saleQty
        }));


        // Find and update the quantity for each sold product in the productModel
        Promise.all(productsToUpdate.map(product => {
            return ProductModel.findByIdAndUpdate(product.productId, {
                $inc: { qty: -product.quantity } // Decrement the quantity by the sold quantity
            });

        })).then((updatedProducts) => {


            InvoiceModel.create(invoiceData).then((invoice) => {

                if (!invoice) {

                    res.json({
                        message: "Internal Server Error",
                        status: false
                    })

                    return

                }

                invoice.id = invoice._id

                if (invoice.paymentMethod.toLowerCase() == "cheque" || invoice.paymentMethod.toLowerCase() == "credit") {


                    console.log(invoice, "invoice")

                    CustomerModel.findByIdAndUpdate(invoice.customerDetails[0]?.id, {
                        $inc: { credit_balance: (deductAmount ? deductAmount : invoice.subtotal) }
                    }).then((data) => {

                        res.json({
                            message: "Transaction Successful",
                            status: true,
                            data: invoice
                        })

                    }).catch((error) => {

                        res.json({
                            message: error.message,
                            status: false,
                            error: error
                        })
                    })

                    return
                }



                res.json({
                    message: "Transaction successful",
                    status: true,
                    data: invoice
                })

            }).catch((error) => {

                res.json({
                    message: error.message,
                    status: false,
                    error: error
                })

            })

        }).catch(error => {
            res.json({
                message: "Internal server error",
                status: false,
                error: error.message
            });

        })



    },
    get: async (req, res) => {



        try {
            let employeeId = req.params.id; // Assuming the employee ID is passed as a parameter

            // console.log(employeeId, "empliyee")

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await InvoiceModel.find({
                employeeId: employeeId,
                saleDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
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
    getDayAll: async (req, res) => {


        try {

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await InvoiceModel.find({
                saleDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
            });

            console.log(invoices, "invoices")

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

    getAll: async (req, res) => {


        try {


            const invoices = await InvoiceModel.find({});


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



    }

}

module.exports = InvoiceController