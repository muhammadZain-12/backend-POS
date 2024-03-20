const CustomerModel = require("../models/customerSchema")
const InvoiceModel = require("../models/invoiceSchema")
const ProductModel = require("../models/productSchema")
const moment = require("moment")
const multer = require("multer") // Set the destination folder for uploaded files
const bwipjs = require("bwip-js")
const fs = require('fs');
const path = require("path")
const ExchangeInvoiceModel = require("../models/exchangeInvoiceSchema")
const cashModel = require("../models/cashSchema")
const trashProductModel = require("../models/TrashProductSchema")
const DamageProductModel = require("../models/damageProductsSchema")
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

async function updateCashBalance(subtotal, invoiceNumber, customerDetails, employeeDetails, employeeId) {


    let dataToSend = {

        amount: subtotal,
        invoiceNumber: invoiceNumber,
        status: "exchange",
        employeeId: employeeId,
        employeeDetails: employeeDetails,
        customerDetails: customerDetails

    }

    await cashModel.create(dataToSend);
}



async function updateCustomerCreditBalance(customerId, subtotal, deductAmount, invoiceData) {



    const updateAmount = deductAmount ? deductAmount : subtotal;

    if (invoiceData?.vatAmount) {

        await CustomerModel.findByIdAndUpdate(customerId, { $inc: { credit_balance: updateAmount } });
    } else {
        await CustomerModel.findByIdAndUpdate(customerId, { $inc: { quotation_balance: updateAmount } });
    }
}

function generateUniqueBarcodeNumber() {
    // Generate a random unique barcode number (you may need to adjust this according to your specific requirements)
    return Math.floor(Math.random() * 1000000000000); // Example: Generates a 12-digit random number
}



const exchangeController = {

    post: async (req, res) => {
        try {
            const invoiceData = req.body;


            let { customerDetails, deductAmount, productDetails, lessAmount, total, discount, deductCreditBalance, subtotal, employeeDetails, saleReturnDate, status, paymentMethod, customerName, totalItems, totalQty, returnInvoiceRef } = req.body

            const requiredFields = ['customerDetails', 'productDetails', 'employeeDetails', 'status', 'paymentMethod', 'customerName', 'returnProductDetails'];
            for (const field of requiredFields) {
                if (!invoiceData[field]) {
                    return res.status(400).json({ message: `${field} is required`, status: false });
                }
            }



            // Get the total number of invoices to generate the next invoice number
            const totalInvoice = await ExchangeInvoiceModel.countDocuments({});
            invoiceData.invoiceNumber = `exhInv${totalInvoice + 1}`;
            // Generate barcode image
            const barcodeNumber = await generateUniqueBarcodeNumber();

            const barcodeImagePath = path.join(__dirname, '../products/', `${invoiceData.invoiceNumber}_exh_barcode.png`);

            await generateBarcode(barcodeNumber, barcodeImagePath);

            // Associate the barcode image path with the invoice data
            invoiceData.barcodeNumber = barcodeNumber
            invoiceData.barcodeImagePath = `${invoiceData.invoiceNumber}_exh_barcode.png`;




            // Map product details to update product quantities
            const productsToUpdate = invoiceData?.productDetails?.map(product => ({
                productId: product._id,
                quantity: product.saleQty,
                barcode: product?.barcode,
                supplier_name: product?.supplier_name,
                supplier_address: product?.supplier_address,
                supplier_mobile_number: product?.supplier_mobile_number,
                supplier_id: product?.supplier_id,
                cost_price: product?.cost_price,
                trade_price: product?.trade_price,
                discount_price: product?.discountPrice,
                warehouse_price: product?.warehouse_price,
                retail_price: product?.retail_price,

            }));

            const productToAdd = invoiceData?.returnProductDetails?.map(product => ({
                productId: product._id,
                quantity: product.DamageQty ? product?.DamageQty : product?.saleQty
            }));

            await Promise.all(productsToUpdate.map(async product => {

                const ledgerEntry = {
                    date: new Date(),
                    qty: -product?.quantity,
                    barcode: product.barcode,
                    invoiceDetails: {
                        customerDetails: invoiceData?.customerDetails,
                        invoiceNumber: invoiceData?.invoiceNumber,
                        status: invoiceData?.status,
                        barcodeNumber: invoiceData?.barcodeNumber,
                        paymentMethod: invoiceData?.paymentMethod
                    },
                    cost_price: product?.cost_price,
                    trade_price: product?.trade_price,
                    discount_price: product?.discount_price ?? 0,
                    warehouse_price: product?.warehouse_price,
                    retail_price: product?.retail_price,
                    supplierDetails: {
                        supplier_name: product?.supplier_name,
                        supplier_address: product?.supplier_address,
                        supplier_mobile_number: product?.supplier_mobile_number,
                        supplier_id: product?.supplier_id
                    },
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeId: invoiceData?.employeeId,
                    status: "sale"
                };


                // await ProductModel.findByIdAndUpdate(product.productId, {
                //     $inc: { qty: -product.quantity },
                //     $push: { productLedger: ledgerEntry }
                //     // Decrement the quantity by the sold quantity
                // });

                await ProductLedgerModel.create(ledgerEntry)


            }));




            const updatePromises = invoiceData?.returnProductDetails?.map(async (product) => {


                const ledgerEntry = {
                    date: new Date(),
                    qty: product.DamageQty ? product.DamageQty : product?.saleQty,
                    barcode: product.barcode,
                    invoiceDetails: {
                        customerDetails: invoiceData?.customerDetails,
                        invoiceNumber: invoiceData?.invoiceNumber,
                        status: invoiceData?.status,

                        barcodeNumber: invoiceData?.barcodeNumber,
                        paymentMethod: invoiceData?.paymentMethod
                    },
                    cost_price: product?.cost_price,
                    trade_price: product?.trade_price,
                    discount_price: product?.discount_price ?? 0,
                    warehouse_price: product?.warehouse_price,
                    retail_price: product?.retail_price,
                    supplierDetails: {
                        supplier_name: product?.supplier_name,
                        supplier_address: product?.supplier_address,
                        supplier_mobile_number: product?.supplier_mobile_number,
                        supplier_id: product?.supplier_id
                    },
                    employeeDetails: invoiceData?.employeeDetails,
                    employeeId: invoiceData?.employeeId,
                    status: "Return"
                };


                if (status == "Return") {


                    const existingProduct = await ProductModel.findOne({ _id: product._id });

                    if (existingProduct) {
                        // If the product exists, update the damageQty

                        // await ProductModel.findByIdAndUpdate(product._id, {
                        //     $push: { productLedger: ledgerEntry }
                        // });

                        await ProductLedgerModel.create(ledgerEntry)

                        existingProduct.qty += product.DamageQty ? product?.DamageQty : product?.saleQty;
                        await existingProduct.save();
                    }
                }

                else if (status == "Damage") {

                    const existingProduct = await DamageProductModel.findOne({ _id: product._id });

                    if (existingProduct) {
                        // If the product exists, update the damageQty
                        existingProduct.DamageQty += product.DamageQty ? product?.DamageQty : product?.saleQty;
                        await DamageProductModel.findByIdAndUpdate(product._id, {
                            $push: { productLedger: ledgerEntry }
                        });
                        await existingProduct.save();
                    } else {
                        // If the product doesn't exist, create a new entry
                        product.productLedger = ledgerEntry
                        product.DamageQty = product.DamageQty ? product?.DamageQty : product?.saleQty
                        await DamageProductModel.create(product);
                    }
                }
                else if (status == "Trash") {

                    const existingProduct = await trashProductModel.findOne({ _id: product._id });

                    if (existingProduct) {
                        // If the product exists, update the damageQty
                        existingProduct.qty += Number(product.DamageQty ? product?.DamageQty : product?.saleQty);
                        await existingProduct.save();
                        await trashProductModel.findByIdAndUpdate(product._id, {
                            $push: { productLedger: ledgerEntry }
                        });
                    } else {
                        // If the product doesn't exist, create a new entry
                        product.productLedger = ledgerEntry
                        product.qty = product.DamageQty ? product?.DamageQty : product?.saleQty
                        await trashProductModel.create(product);
                    }
                }

            });

            await Promise.all(updatePromises);


            const createdInvoice = await ExchangeInvoiceModel.create(invoiceData);

            // Update customer credit balance if payment method is cheque or credit
            if (createdInvoice.paymentMethod.toLowerCase() === "cheque" || createdInvoice.paymentMethod.toLowerCase() === "credit") {
                await updateCustomerCreditBalance(invoiceData.customerDetails?.id, createdInvoice.subtotal, invoiceData.deductAmount, invoiceData);
            }

            if (createdInvoice.paymentMethod.toLowerCase() === "cash" || createdInvoice.paymentMethod.toLowerCase() === "refund cash") {
                await updateCashBalance(invoiceData?.subtotal, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
            }



            if (deductCreditBalance) {

                try {
                    const customer = await CustomerModel.findOne({ _id: invoiceData?.customerDetails?.id });
                    if (customer) {

                        if (lessAmount) {
                            let cashDeduct = Number(Math.abs(subtotal)) - Number(invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance))

                            cashDeduct = cashDeduct * -1

                            await updateCashBalance(cashDeduct, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
                        }
                        else if (deductAmount) {

                            let cashDeduct = Number(Math.abs(subtotal)) - Number(deductAmount)
                            cashDeduct = cashDeduct * -1

                            await updateCashBalance(cashDeduct, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
                        }

                        let deductedBalance = lessAmount ? (invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal)

                        if (invoiceData?.returnVat) {
                            customer.credit_balance -= deductedBalance; // Assuming the total amount is deducted from the credit balance
                        } else {
                            customer.quotation_balance -= deductedBalance;
                        }
                        await customer.save();
                    }
                } catch (error) {
                    console.error("Error deducting credit balance:", error.message);
                    // Handle error as needed
                }
            }


            const customer = await CustomerModel.findOne({ _id: customerDetails.id });


            // let customerSaleLedger = {

            //     date: invoiceData?.exchangeDate,
            //     employeeDetails: invoiceData?.employeeDetails,
            //     employeeName: invoiceData?.employeeDetails?.employeeName,
            //     status: invoiceData?.status,
            //     productDetails: invoiceData?.productDetails,
            //     vatAmount: invoiceData?.vatAmount,
            //     totalItems: invoiceData?.totalItems,
            //     totalQty: invoiceData?.totalQty,
            //     transactionType : invoiceData?.vatAmount ? "Invoice" : "Quotation",
            //     invoiceAmount: invoiceData?.subtotal,
            //     invoiceType: "Sale Invoice",
            //     paymentMethod: invoiceData?.paymentMethod,
            //     paid: (invoiceData?.paymentMethod.toLowerCase() == "credit" || invoiceData?.paymentMethod.toLowerCase() == "cheque") ? 0 : invoiceData?.subtotal,
            //     toPay: (invoiceData?.paymentMethod.toLowerCase() == "credit" || invoiceData?.paymentMethod.toLowerCase() == "cheque") ? invoiceData?.subtotal : 0,
            //     invoiceNumber: invoiceData?.invoiceNumber,
            //     invoiceBarcodeNumber: barcodeNumber,
            //     referenceId: invoiceData?.referenceId,
            //     transactionId: invoiceData?.transactionId,
            //     cheque_no: invoiceData?.cheque_no,
            //     bank_name: invoiceData?.bank_name,
            //     clear_date: invoiceData?.clear_date,
            //     creditDays: invoiceData?.creditDays,
            // }



            let customerLedger = {

                date: invoiceData?.exchangeDate,
                employeeDetails: invoiceData?.employeeDetails,
                customerId: invoiceData?.customerDetails?.id,
                employeeName: invoiceData?.employeeDetails?.employeeName,
                subtotal: invoiceData?.subtotal,
                discount: invoiceData?.discount,
                total: invoiceData?.total,
                status: invoiceData?.status,
                productDetails: invoiceData?.productDetails,
                customerDetails: invoiceData?.customerDetails,
                returnProductDetails: invoiceData?.returnProductDetails,
                vatAmount: invoiceData?.vatAmount,
                totalItems: invoiceData?.totalItems,
                totalQty: invoiceData?.totalQty,
                transactionType: invoiceData?.vatAmount ? "Exchange Invoice" : "Exchange Quotation",
                invoiceAmount: invoiceData?.subtotal,
                invoiceType: "Exchange Invoice",
                paymentMethod: invoiceData?.paymentMethod,
                paid: (invoiceData?.paymentMethod.toLowerCase() == "cash" || invoiceData?.paymentMethod.toLowerCase() == "card" || invoiceData?.paymentMethod.toLowerCase() == "online") ? invoiceData?.subtotal : 0,
                toPay: (invoiceData?.paymentMethod.toLowerCase() == "credit" || invoiceData?.paymentMethod.toLowerCase() == "cheque") ? invoiceData?.subtotal : 0,
                paidBackCash: (!deductCreditBalance && invoiceData?.paymentMethod?.toLowerCase() == "refund cash") ? Math.abs(Number(invoiceData?.subtotal)) : lessAmount ? (Number(Math.abs(subtotal)) - Number(invoiceData?.returnVat ? customer?.credit_balance : customer?.quotation_balance)) : 0,
                deductCredit: deductCreditBalance ? lessAmount ? (invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Math.abs(Number(subtotal)) : 0,
                invoiceNumber: invoiceData?.invoiceNumber,
                returnInvoiceRef: invoiceData?.returnInvoiceRef,
                invoiceBarcodeNumber: barcodeNumber,
                referenceId: invoiceData?.referenceId,
                transactionId: invoiceData?.transactionId,
                cheque_no: invoiceData?.cheque_no,
                bank_name: invoiceData?.bank_name,
                clear_date: invoiceData?.clear_date,
                creditDays: invoiceData?.creditDays,
            }

            // let previousLedger = [...customer.customerLedger]

            // let refInvoice = previousLedger && previousLedger?.length > 0 && previousLedger?.filter((e, i) => {
            //     return e?.invoiceNumber == customerLedger?.returnInvoiceRef
            // })
            // let otherInvoice = previousLedger && previousLedger?.length > 0 && previousLedger?.filter((e, i) => {
            //     return e?.invoiceNumber !== customerLedger?.returnInvoiceRef
            // })

            // refInvoice = refInvoice?.[0]
            // if (refInvoice?.returnAmount) {
            //     refInvoice.returnAmount += Number(invoiceData?.returnSubtotal)
            // } else {
            //     refInvoice.returnAmount = Number(invoiceData?.returnSubtotal)
            // }

            // if (refInvoice?.totalReturnInvoices) {

            //     refInvoice.totalReturnInvoices += 1

            // }
            // else {
            //     refInvoice.totalReturnInvoices = 1
            // }

            // if (deductCreditBalance && refInvoice?.toPay) {
            //     refInvoice.toPay -= lessAmount ? (invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Math.abs(Number(subtotal))
            // } else if (deductCreditBalance) {

            //     if (refInvoice?.deductCredit) {

            //         refInvoice.deductCredit += lessAmount ? (invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Math.abs(Number(subtotal))

            //     } else {
            //         refInvoice.deductCredit = lessAmount ? (invoiceData?.returnVat ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Math.abs(Number(subtotal))
            //     }

            // }
            // else {
            //     if (refInvoice.paidBackCash) {
            //         refInvoice.paidBackCash += Math.abs(Number(subtotal))
            //     } else {
            //         refInvoice.paidBackCash = Math.abs(Number(subtotal))
            //     }
            // }

            // if (refInvoice?.exchangeSaleAmount) {
            //     refInvoice.exchangeSaleAmount = invoiceData?.saleSubtotal
            // } else {
            //     refInvoice.exchangeSaleAmount += invoiceData?.saleSubtotal
            // }



            // let allInvoices = [...otherInvoice, refInvoice]

            // customer.customerLedger.push(customerLedger)

            // customer.customerLedger = allInvoices

            // customer.save()

            await CustomerLedgerModel.create(customerLedger)



            return res.json({ message: "Transaction successful", status: true, data: createdInvoice });

        }
        catch (error) {
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

            const invoices = await ExchangeInvoiceModel.find({
                employeeId: employeeId,
                exchangeDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
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

            const invoices = await ExchangeInvoiceModel.find({
                exchangeDate: { $gte: todayStart.toDate(), $lt: todayEnd.toDate() }
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
    getAll: async (req, res) => {


        try {


            const invoices = await ExchangeInvoiceModel.find({});


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

module.exports = exchangeController