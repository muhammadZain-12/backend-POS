const SaleReturnInvoiceModel = require("../models/saleReturnInvoiceSchema")
const DamageProductModel = require("../models/damageProductsSchema")
const ProductModel = require("../models/productSchema")
const trashProductModel = require("../models/TrashProductSchema")
const moment = require("moment")

const SaleReturnController = {

    post: async (req, res) => {


        let invoiceData = req.body

        let totalInvoice = await SaleReturnInvoiceModel.countDocuments({})

        invoiceData.invoiceNumber = totalInvoice + 1

        let { customerDetails, productDetails, total, discount, subtotal, employeeDetails, saleReturnDate, status, paymentMethod, customerName, totalItems, totalQty, returnInvoiceRef } = req.body

        if (!customerDetails || !productDetails || !total || !subtotal || !employeeDetails || !saleReturnDate || !status || !totalItems || !totalQty || !customerName || !returnInvoiceRef) {

            res.json({
                message: " Required fields are missing",
                status: false
            })
            return
        }

        productDetails = productDetails.map((product) => {

            if (status == "Damage") {
                return {
                    ...product,
                    DamageQty: product.DamageQty ? product.DamageQty : product.saleQty,
                    status: status
                }
            }
            else if (status == "Trash") {
                return {
                    ...product,
                    qty: product.DamageQty ? product.DamageQty : product.saleQty,
                    status: status
                }
            } else {

                return {
                    ...product,
                    qty: product.DamageQty ? product.DamageQty : product.saleQty,
                }
            }

        })

        const updatePromises = productDetails.map(async (product) => {

            if (status == "Return") {

                const existingProduct = await ProductModel.findOne({ _id: product._id });

                if (existingProduct) {
                    // If the product exists, update the damageQty
                    existingProduct.qty += product.qty;
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    await ProductModel.create(product);
                }
            }
            else if (status == "Damage") {

                const existingProduct = await DamageProductModel.findOne({ _id: product._id });

                if (existingProduct) {
                    // If the product exists, update the damageQty
                    existingProduct.DamageQty += product.DamageQty;
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    await DamageProductModel.create(product);
                }
            }
            else if (status == "Trash") {

                const existingProduct = await trashProductModel.findOne({ _id: product._id });

                if (existingProduct) {
                    // If the product exists, update the damageQty
                    existingProduct.qty += product.qty;
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    await trashProductModel.create(product);
                }
            }

        });

        await Promise.all(updatePromises);


        SaleReturnInvoiceModel.create(invoiceData).then((data) => {


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
    getEmployeeDayInvoices: async (req, res) => {



        try {
            let employeeId = req.params.id; // Assuming the employee ID is passed as a parameter

            // console.log(employeeId, "empliyee")

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await SaleReturnInvoiceModel.find({
                employeeId: employeeId,
                saleReturnDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
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
    getDayAllInvoices: async (req, res) => {


        try {

            const todayStart = moment().startOf('day');
            const todayEnd = moment().endOf('day');

            const invoices = await SaleReturnInvoiceModel.find({
                saleReturnDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
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

}

module.exports = SaleReturnController