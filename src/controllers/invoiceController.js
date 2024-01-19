const InvoiceModel = require("../models/invoiceSchema")
const ProductModel = require("../models/productSchema")
const moment = require("moment")


const InvoiceController = {

    post: async (req, res) => {

        let invoiceData = req.body

        let totalInvoice = await InvoiceModel.countDocuments({})

        invoiceData.invoiceNumber = totalInvoice + 1

        let { customerDetails, productDetails, total, discount, subtotal, employeeDetails, saleDate, status, paymentMethod, customerName, totalItems } = req.body

        if (!customerDetails || !productDetails || !total || !subtotal || !employeeDetails || !saleDate || !status || !paymentMethod || !totalItems || !customerName) {

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

            console.log(employeeId, "empliyee")

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await InvoiceModel.find({
                employeeId: employeeId,
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

    }

}

module.exports = InvoiceController