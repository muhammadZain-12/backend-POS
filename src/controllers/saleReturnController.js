const SaleReturnInvoiceModel = require("../models/saleReturnInvoiceSchema")
const DamageProductModel = require("../models/damageProductsSchema")

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

            return {
                ...product,
                DamageQty: product.DamageQty ? product.DamageQty : product.saleQty,
                status: "Damage"
            }

        })

        console.log(productDetails, "productDetails")

        const updatePromises = productDetails.map(async (product) => {
            const existingProduct = await DamageProductModel.findOne({ _id: product._id });

            if (existingProduct) {
                // If the product exists, update the damageQty
                existingProduct.DamageQty += product.DamageQty;
                await existingProduct.save();
            } else {
                // If the product doesn't exist, create a new entry
                await DamageProductModel.create(product);
            }
        });

        await Promise.all(updatePromises);


        SaleReturnInvoiceModel.create(invoiceData).then((data) => {

            console.log(data, "dataaaa")

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




    }

}

module.exports = SaleReturnController