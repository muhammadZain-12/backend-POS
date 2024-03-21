const CustomerModel = require("../models/customerSchema")
const InvoiceModel = require("../models/invoiceSchema")
const ProductModel = require("../models/productSchema")
const moment = require("moment")
const bwipjs = require("bwip-js")
const fs = require('fs');
const path = require("path")
const cashModel = require("../models/cashSchema")
const CustomerLedgerModel = require("../models/customerLedgerSchema")
const ProductLedgerModel = require("../models/productLedgerSchema")



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


async function updateCustomerCreditBalance(customerId, subtotal, deductAmount, invoiceData) {



    const updateAmount = deductAmount ? deductAmount : subtotal;




    if (invoiceData?.vatAmount) {

        await CustomerModel.findByIdAndUpdate(customerId, { $inc: { credit_balance: updateAmount } });

    } else {

        await CustomerModel.findByIdAndUpdate(customerId, { $inc: { quotation_balance: updateAmount } });

    }

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


            const productsToUpdate = invoiceData.productDetails.map(product => ({

                productId: product._id,
                quantity: product.saleQty,
                cost_price: product?.cost_price,
                trade_price: product?.trade_price,
                warehouse_price: product?.warehouse_price,
                retail_price: product?.retail_price,
                discount_price: product?.discountPrice,
                barcode: product?.barcode

            }));

            // Update product quantities
            await Promise.all(productsToUpdate.map(async product => {
                await ProductModel.findByIdAndUpdate(product.productId, {
                    $inc: { qty: -product.quantity } // Decrement the quantity by the sold quantity
                });


                const ledgerEntry = {
                    date: new Date(),
                    qty: -product.quantity,
                    productId: product?.productId,
                    barcode: product.barcode,
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

                // await ProductModel.findByIdAndUpdate(product.productId, {
                //     $push: { productLedger: ledgerEntry }
                // });

                await ProductLedgerModel.create(ledgerEntry)

            }));



            await generateBarcode(barcodeNumber, barcodeImagePath);

            // Associate the barcode image path with the invoice data
            invoiceData.barcodeNumber = barcodeNumber
            invoiceData.barcodeImagePath = `${invoiceData.invoiceNumber}_barcode.png`;

            // Create invoice
            const createdInvoice = await InvoiceModel.create(invoiceData);

            // Update customer credit balance if payment method is cheque or credit
            if (createdInvoice.paymentMethod.toLowerCase() === "cheque" || createdInvoice.paymentMethod.toLowerCase() === "credit") {
                await updateCustomerCreditBalance(invoiceData.customerDetails?.id, createdInvoice.subtotal, invoiceData.deductAmount, invoiceData);
            }

            if (createdInvoice.paymentMethod.toLowerCase() === "cash") {

                await updateCashBalance(createdInvoice?.subtotal, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)

            }

            let customerLedger = {

                date: invoiceData?.saleDate,
                customerId: invoiceData?.customerDetails?.id,
                employeeDetails: invoiceData?.employeeDetails,
                employeeName: invoiceData?.employeeDetails?.employeeName,
                status: invoiceData?.status,
                subtotal: invoiceData?.subtotal,
                discount: invoiceData?.discount,
                total: invoiceData?.total,
                productDetails: invoiceData?.productDetails,
                customerDetails: invoiceData?.customerDetails,
                vatAmount: invoiceData?.vatAmount,
                totalItems: invoiceData?.totalItems,
                totalQty: invoiceData?.totalQty,
                transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                invoiceAmount: invoiceData?.subtotal,
                invoiceType: "Sale Invoice",
                paymentMethod: invoiceData?.paymentMethod,
                paid: (invoiceData?.paymentMethod.toLowerCase() == "credit" || invoiceData?.paymentMethod.toLowerCase() == "cheque") ? 0 : invoiceData?.subtotal,
                toPay: (invoiceData?.paymentMethod.toLowerCase() == "credit" || invoiceData?.paymentMethod.toLowerCase() == "cheque") ? invoiceData?.subtotal : 0,
                invoiceNumber: invoiceData?.invoiceNumber,
                invoiceBarcodeNumber: barcodeNumber,
                referenceId: invoiceData?.referenceId,
                transactionId: invoiceData?.transactionId,
                cheque_no: invoiceData?.cheque_no,
                bank_name: invoiceData?.bank_name,
                clear_date: invoiceData?.clear_date,
                creditDays: invoiceData?.creditDays,
            }

            await CustomerLedgerModel.create(customerLedger)

            // await CustomerModel.findByIdAndUpdate(invoiceData?.customerDetails?.id, {
            //     $push: { customerLedger: customerLedger }
            // });


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



    },
    changePaymentMethod: async (req, res) => {

        let { invoiceData, paymentMethod, transactionId, referenceId, bankName, chequeNo, clearDate, creditDays } = req.body


        if (invoiceData?.paymentMethod?.toLowerCase() == "cash") {


            if (paymentMethod?.toLowerCase() == "online" || paymentMethod?.toLowerCase() == "card") {


                let dataToSend = {

                    amount: -invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    status: "change paymentMethod",
                    employeeId: invoiceData?.employeeId,
                    employeeDetails: invoiceData?.employeeDetails,
                    customerDetails: invoiceData?.customerDetails

                }

                await cashModel.create(dataToSend);


                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: invoiceData?.subtotal,
                    toPay: 0,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: invoiceData?.cheque_no,
                    bank_name: invoiceData?.bank_name,
                    clear_date: invoiceData?.clear_date,
                    creditDays: invoiceData?.creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );



                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId

                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })









            }

            else if (paymentMethod?.toLowerCase() == "credit" || paymentMethod?.toLowerCase() == "cheque") {


                let dataToSend = {

                    amount: -invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    status: "change paymentMethod",
                    employeeId: invoiceData?.employeeId,
                    employeeDetails: invoiceData?.employeeDetails,
                    customerDetails: invoiceData?.customerDetails

                }

                await cashModel.create(dataToSend);




                let invoiceAmount = invoiceData?.subtotal

                let customerId = invoiceData?.customerDetails[0]?.id

                let customerUpdate = await CustomerModel.findById(customerId)

                if (invoiceData?.vatAmount) {

                    customerUpdate.credit_balance += invoiceAmount

                } else {

                    customerUpdate.quotation_balance += invoiceAmount


                }

                customerUpdate.save()


                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: 0,
                    toPay: invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })


            }

            return

        }

        if (invoiceData?.paymentMethod?.toLowerCase() == "online" || invoiceData?.paymentMethod?.toLowerCase() == "card") {


            if (paymentMethod.toLowerCase() == "cash") {


                let dataToSend = {

                    amount: invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    status: "change paymentMethod",
                    employeeId: invoiceData?.employeeId,
                    employeeDetails: invoiceData?.employeeDetails,
                    customerDetails: invoiceData?.customerDetails
                }

                await cashModel.create(dataToSend);

                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: invoiceData?.subtotal,
                    toPay: 0,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate

                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })

            }

            else if (paymentMethod.toLowerCase() == "credit" || paymentMethod.toLowerCase() == "cheque") {


                let invoiceAmount = invoiceData?.subtotal

                let customerId = invoiceData?.customerDetails[0]?.id

                let customerUpdate = await CustomerModel.findById(customerId)

                if (invoiceData?.vatAmount) {

                    customerUpdate.credit_balance += invoiceAmount

                } else {

                    customerUpdate.quotation_balance += invoiceAmount


                }

                customerUpdate.save()

                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: 0,
                    toPay: invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })





            }

            else if (paymentMethod?.toLowerCase() == "online" || paymentMethod?.toLowerCase() == "card") {

                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: invoiceData?.subtotal,
                    toPay: 0,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })


            }

        }

        if (invoiceData?.paymentMethod?.toLowerCase() == "credit" || invoiceData?.paymentMethod?.toLowerCase() == "cheque") {

            if (paymentMethod.toLowerCase() == "cash") {


                let dataToSend = {

                    amount: invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    status: "change paymentMethod",
                    employeeId: invoiceData?.employeeId,
                    employeeDetails: invoiceData?.employeeDetails,
                    customerDetails: invoiceData?.customerDetails
                }

                await cashModel.create(dataToSend);

                let invoiceAmount = invoiceData?.subtotal
                let customerId = invoiceData?.customerDetails[0]?.id
                let customerUpdate = await CustomerModel.findById(customerId)

                if (invoiceData?.vatAmount) {
                    customerUpdate.credit_balance -= invoiceAmount
                } else {
                    customerUpdate.quotation_balance -= invoiceAmount
                }

                customerUpdate.save()

                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: invoiceData?.subtotal,
                    toPay: 0,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })




            }
            else if (paymentMethod.toLowerCase() == "card" || paymentMethod.toLowerCase() == "online") {


                let invoiceAmount = invoiceData?.subtotal
                let customerId = invoiceData?.customerDetails[0]?.id
                let customerUpdate = await CustomerModel.findById(customerId)

                if (invoiceData?.vatAmount) {
                    customerUpdate.credit_balance -= invoiceAmount
                } else {
                    customerUpdate.quotation_balance -= invoiceAmount
                }

                customerUpdate.save()

                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: invoiceData?.subtotal,
                    toPay: 0,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })




            }

            else if (paymentMethod.toLowerCase() == "cheque" || paymentMethod.toLowerCase() == "credit") {


                let customerLedger = {

                    date: invoiceData?.saleDate,
                    customerId: invoiceData?.customerDetails?.id,
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeName: invoiceData?.employeeDetails?.employeeName,
                    status: invoiceData?.status,
                    subtotal: invoiceData?.subtotal,
                    discount: invoiceData?.discount,
                    total: invoiceData?.total,
                    productDetails: invoiceData?.productDetails,
                    customerDetails: invoiceData?.customerDetails,
                    vatAmount: invoiceData?.vatAmount,
                    totalItems: invoiceData?.totalItems,
                    totalQty: invoiceData?.totalQty,
                    transactionType: invoiceData?.vatAmount ? "Invoice" : "Quotation",
                    invoiceAmount: invoiceData?.subtotal,
                    invoiceType: "Sale Invoice",
                    paymentMethod: paymentMethod,
                    paid: 0,
                    toPay: invoiceData?.subtotal,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    invoiceBarcodeNumber: invoiceData?.barcodeNumber,
                    referenceId: referenceId,
                    transactionId: transactionId,
                    cheque_no: chequeNo,
                    bank_name: bankName,
                    clear_date: clearDate,
                    creditDays: creditDays,
                }

                let updatedCustomerLedger = await CustomerLedgerModel.findOneAndUpdate(
                    { invoiceNumber: invoiceData?.invoiceNumber, status: "Sale" }, // Query to find the document
                    customerLedger, // New data to replace with existing document
                    { new: true, upsert: true } // Options: "new" to return the modified document, "upsert" to create a new document if it doesn't exist
                );


                invoiceData.paymentMethod = paymentMethod
                invoiceData.referenceId = referenceId
                invoiceData.transactionId = transactionId
                invoiceData.creditDays = creditDays
                invoiceData.cheque_no = chequeNo
                invoiceData.bank_name = bankName
                invoiceData.clear_date = clearDate


                InvoiceModel.findByIdAndUpdate(invoiceData?._id, invoiceData).then((updatedData) => {

                    if (!updatedData) {

                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Payment Method Successfully Updated",
                        status: true,
                        data: invoiceData
                    })


                }).catch((error) => {

                    res.json({
                        message: "Internal Server Error",
                        status: false,
                        error: error?.message
                    })

                })




            }



        }

    }

}

module.exports = InvoiceController