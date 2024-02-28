const CustomerModel = require("../models/customerSchema")
const InvoiceModel = require("../models/invoiceSchema")
const ProductModel = require("../models/productSchema")
const moment = require("moment")
const multer = require("multer") // Set the destination folder for uploaded files
const bwipjs = require("bwip-js")
const fs = require('fs');
const path = require("path")
const cashModel = require("../models/cashSchema")



function generateBarcode(barcodeNumber, imagePath) {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128', // Barcode type
            text: barcodeNumber.toString(), // Text to encode in the barcode
            scale: 3, // Scaling factor
            height: 10, // Barcode height (adjust as needed)
            includetext: true, // Include human-readable text below the barcode
            textxalign: 'center' // Text alignment
        }, (err, png) => {
            if (err) {
                console.error(err);
                reject(new Error("Error generating barcode"));
            } else {

                fs.writeFile(imagePath, png, function (err) {
                    if (err) {
                        console.error(err);
                        reject()
                    } else {
                        resolve()
                        console.log('Barcode image generated successfully.');
                    }
                });

                // fs.writeFile(imagePath, png)
                //     .then(() => {
                //         console.log("Barcode image saved successfully");
                //         resolve();
                //     })
                //     .catch(error => {
                //         console.error(error);
                //         reject(new Error("Error saving barcode image"));
                //     });
            }
        });
    });
}


async function updateCustomerCreditBalance(customerId, subtotal, deductAmount) {



    const updateAmount = deductAmount ? deductAmount : subtotal;

    console.log(updateAmount, "updateAmount")

    console.log(customerId, "customerId")

    await CustomerModel.findByIdAndUpdate(customerId, { $inc: { credit_balance: updateAmount } });
}

async function updateCashBalance(subtotal, invoiceNumber, customerDetails, employeeDetails, employeeId) {


    let dataToSend = {

        amount: subtotal,
        invoiceNumber: invoiceNumber,
        status: "sale",
        employeeId: employeeId,
        employeeDetails: employeeDetails,
        customerDetails: customerDetails

    }

    console.log(dataToSend, "datatOsEND")



    await cashModel.create(dataToSend);
}

function generateUniqueBarcodeNumber() {
    // Generate a random unique barcode number (you may need to adjust this according to your specific requirements)
    return Math.floor(Math.random() * 1000000000000); // Example: Generates a 12-digit random number
}

const InvoiceController = {

    post: async (req, res) => {
        try {
            const invoiceData = req.body;

            const requiredFields = ['customerDetails', 'productDetails', 'total', 'subtotal', 'employeeDetails', 'status', 'paymentMethod', 'customerName', 'totalItems'];
            for (const field of requiredFields) {
                if (!invoiceData[field]) {
                    return res.status(400).json({ message: `${field} is required`, status: false });
                }
            }

            // Get the total number of invoices to generate the next invoice number
            const totalInvoice = await InvoiceModel.countDocuments({});
            invoiceData.invoiceNumber = totalInvoice + 1;
            const barcodeNumber = await generateUniqueBarcodeNumber();
            const barcodeImagePath = path.join(__dirname, '../products/', `${invoiceData.invoiceNumber}_barcode.png`);


            // Map product details to update product quantities
            const productsToUpdate = invoiceData.productDetails.map(product => ({

                productId: product._id,
                quantity: product.saleQty,
                cost_price: product?.cost_price,
                trade_price: product?.trade_price,
                warehouse_price: product?.warehouse_price,
                retail_price: product?.retail_price,
                discount_price: product?.discountPrice

            }));

            // Update product quantities
            await Promise.all(productsToUpdate.map(async product => {
                await ProductModel.findByIdAndUpdate(product.productId, {
                    $inc: { qty: -product.quantity } // Decrement the quantity by the sold quantity
                });


                const ledgerEntry = {
                    date: new Date(),
                    qty: -product.quantity,
                    cost_price: product?.cost_price,
                    trade_price: product?.trade_price,
                    discount_price: product?.discount_price ? product?.discount_price : 0,
                    warehouse_price: product?.warehouse_price,
                    retail_price: product?.retail_price,
                    invoiceDetails: {
                        customerDetails: invoiceData?.customerDetails,
                        invoiceNumber: invoiceData?.invoiceNumber,
                        status: invoiceData?.status,
                        barcodeNumber: barcodeNumber,
                        paymentMethod: invoiceData?.paymentMethod
                    },
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeId: invoiceData?.employeeId,
                    status: "sale"
                };

                await ProductModel.findByIdAndUpdate(product.productId, {
                    $push: { productLedger: ledgerEntry }
                });


            }));



            await generateBarcode(barcodeNumber, barcodeImagePath);

            // Associate the barcode image path with the invoice data
            invoiceData.barcodeNumber = barcodeNumber
            invoiceData.barcodeImagePath = `${invoiceData.invoiceNumber}_barcode.png`;

            // Create invoice
            const createdInvoice = await InvoiceModel.create(invoiceData);

            // Update customer credit balance if payment method is cheque or credit
            if (createdInvoice.paymentMethod.toLowerCase() === "cheque" || createdInvoice.paymentMethod.toLowerCase() === "credit") {
                await updateCustomerCreditBalance(invoiceData.customerDetails?.id, createdInvoice.subtotal, invoiceData.deductAmount);
            }

            if (createdInvoice.paymentMethod.toLowerCase() === "cash") {

                await updateCashBalance(createdInvoice?.subtotal, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)

            }


            return res.json({ message: "Transaction successful", status: true, data: createdInvoice });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error", status: false, error: error });
        }
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