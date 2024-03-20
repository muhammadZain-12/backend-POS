const SaleReturnInvoiceModel = require("../models/saleReturnInvoiceSchema")
const DamageProductModel = require("../models/damageProductsSchema")
const ProductModel = require("../models/productSchema")
const trashProductModel = require("../models/TrashProductSchema")
const CustomerModel = require("../models/customerSchema")
const moment = require("moment")
const bwipjs = require("bwip-js")
const fs = require('fs');
const path = require("path")
const cashModel = require("../models/cashSchema")
const CustomerLedgerModel = require("../models/customerLedgerSchema")





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

            }
        });
    });
}

function generateUniqueBarcodeNumber() {
    // Generate a random unique barcode number (you may need to adjust this according to your specific requirements)
    return Math.floor(Math.random() * 1000000000000); // Example: Generates a 12-digit random number
}


async function updateCashBalance(subtotal, invoiceNumber, customerDetails, employeeDetails, employeeId) {


    let dataToSend = {

        amount: `-${subtotal}`,
        invoiceNumber: invoiceNumber,
        status: "return",
        employeeId: employeeId,
        employeeDetails: employeeDetails,
        customerDetails: customerDetails

    }

    console.log(dataToSend, "datatOsEND")



    await cashModel.create(dataToSend);
}




const SaleReturnController = {

    post: async (req, res) => {


        let invoiceData = req.body

        let totalInvoice = await SaleReturnInvoiceModel.countDocuments({})

        const barcodeNumber = await generateUniqueBarcodeNumber();

        const barcodeImagePath = path.join(__dirname, '../products/', `${invoiceData.invoiceNumber}_return_barcode.png`);

        await generateBarcode(barcodeNumber, barcodeImagePath);

        // Associate the barcode image path with the invoice data
        invoiceData.barcodeNumber = barcodeNumber
        invoiceData.barcodeImagePath = `${invoiceData.invoiceNumber}_return_barcode.png`;


        invoiceData.invoiceNumber = totalInvoice + 1

        let { customerDetails, deductAmount, productDetails, lessAmount, total, discount, deductCreditBalance, subtotal, employeeDetails, saleReturnDate, status, paymentMethod, customerName, totalItems, totalQty, returnInvoiceRef } = req.body

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


            const ledgerEntry = {
                date: new Date(),
                qty: product.DamageQty ? product.DamageQty : product?.saleQty,
                invoiceDetails: {
                    customerDetails: invoiceData?.customerDetails,
                    invoiceNumber: invoiceData?.invoiceNumber,
                    status: invoiceData?.status,
                    barcodeNumber: invoiceData?.barcodeNumber,
                    paymentMethod: invoiceData?.paymentMethod
                },
                cost_price: product?.cost_price,
                trade_price: product?.trade_price,
                discount_price: product?.discountPrice ?? 0,
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

                    await ProductModel.findByIdAndUpdate(product._id, {
                        $push: { productLedger: ledgerEntry }
                    });

                    existingProduct.qty += product.qty;
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    product.productLedger = ledgerEntry
                    await ProductModel.create(product);
                }
            }
            else if (status == "Damage") {

                const existingProduct = await DamageProductModel.findOne({ _id: product._id });

                if (existingProduct) {
                    // If the product exists, update the damageQty
                    existingProduct.DamageQty += product.DamageQty;
                    await DamageProductModel.findByIdAndUpdate(product._id, {
                        $push: { productLedger: ledgerEntry }
                    });
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    product.productLedger = ledgerEntry
                    await DamageProductModel.create(product);
                }
            }
            else if (status == "Trash") {

                const existingProduct = await trashProductModel.findOne({ _id: product._id });

                if (existingProduct) {
                    // If the product exists, update the damageQty
                    existingProduct.qty += product.qty;
                    await trashProductModel.findByIdAndUpdate(product._id, {
                        $push: { productLedger: ledgerEntry }
                    });
                    await existingProduct.save();
                } else {
                    // If the product doesn't exist, create a new entry
                    product.productLedger = ledgerEntry
                    await trashProductModel.create(product);
                }
            }

        });

        await Promise.all(updatePromises);



        SaleReturnInvoiceModel.create(invoiceData).then(async (data) => {


            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }


            if (!deductCreditBalance) {

                await updateCashBalance(invoiceData?.subtotal, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)

            }

            if (deductCreditBalance) {

                try {
                    const customer = await CustomerModel.findOne({ _id: customerDetails.id });
                    if (customer) {

                        if (lessAmount) {
                            if (invoiceData?.vatAmount) {
                                let cashDeduct = Number(subtotal) - Number(customer?.credit_balance)
                                await updateCashBalance(cashDeduct, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
                            } else {
                                let cashDeduct = Number(subtotal) - Number(customer?.quotation_balance)
                                await updateCashBalance(cashDeduct, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
                            }

                        }
                        else if (deductAmount) {

                            let cashDeduct = Number(subtotal) - Number(deductAmount)
                            await updateCashBalance(cashDeduct, invoiceData?.invoiceNumber, invoiceData?.customerDetails, invoiceData?.employeeDetails, invoiceData?.employeeId)
                        }

                        let deductedBalance = lessAmount ? (invoiceData?.vatAmount ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal)
                        if (invoiceData?.vatAmount) {
                            customer.credit_balance -= deductedBalance;
                        } else {
                            customer.quotation_balance -= deductedBalance;
                        }

                        // Assuming the total amount is deducted from the credit balance
                        await customer.save();
                    }
                } catch (error) {
                    console.error("Error deducting credit balance:", error.message);
                    // Handle error as needed
                }
            }

            const customer = await CustomerModel.findOne({ _id: customerDetails.id });

            let customerLedger = {

                date: invoiceData?.saleReturnDate,
                customerId  : invoiceData?.customerDetails?.id,
                employeeDetails: invoiceData?.employeeDetails,
                employeeName: invoiceData?.employeeDetails?.employeeName,
                status: invoiceData?.status,
                productDetails: invoiceData?.productDetails,
                customerDetails : invoiceData?.customerDetails,
                subtotal : invoiceData?.subtotal,
                discount : invoiceData?.discount,
                total : invoiceData?.total,
                vatAmount: invoiceData?.vatAmount,
                totalItems: invoiceData?.totalItems,
                totalQty: invoiceData?.totalQty,
                transactionType: invoiceData?.vatAmount ? "Return Invoice" : "Return Quotation",
                invoiceAmount: invoiceData?.subtotal,
                invoiceType: "Sale Return Invoice",
                paymentMethod: invoiceData?.paymentMethod,
                paidBackCash: !deductCreditBalance ? invoiceData?.subtotal : lessAmount ? (Number(subtotal) - Number(invoiceData?.vatAmount ? customer?.credit_balance : customer?.quotation_balance)) : lessAmount ? (Number(subtotal) - (invoiceData?.vatAmount ? customer?.credit_balance : customer?.quotation_balance)) : 0,
                deductCredit: deductCreditBalance ? lessAmount ? (invoiceData?.vatAmount ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal) : 0,
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
            //     refInvoice.returnAmount += Number(subtotal)
            // } else {
            //     refInvoice.returnAmount = Number(subtotal)
            // }

            // if (refInvoice?.totalReturnInvoices) {

            //     refInvoice.totalReturnInvoices += 1

            // }
            // else {
            //     refInvoice.totalReturnInvoices = 1
            // }


            // if (deductCreditBalance && refInvoice?.toPay) {
            //     refInvoice.toPay -= lessAmount ? (invoiceData?.vatAmount ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal)
            // }
            // else if (deductCreditBalance) {
              
            //     if (refInvoice?.deductCredit) {

            //         refInvoice.deductCredit += lessAmount ? (invoiceData?.vatAmount ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal)

            //     } else {
            //         refInvoice.deductCredit = lessAmount ? (invoiceData?.vatAmount ? Number(customer?.credit_balance) : Number(customer?.quotation_balance)) : deductAmount ? Number(deductAmount) : Number(subtotal)
            //     }

            //     if (refInvoice?.paidBackCash) {
            //         refInvoice.paidBackCash += lessAmount ? (Number(subtotal) - Number(invoiceData?.vatAmount ? customer?.credit_balance : customer?.quotation_balance)) : 0
            //     } else {
            //         refInvoice.paidBackCash = lessAmount ? (Number(subtotal) - Number(invoiceData?.vatAmount ? customer?.credit_balance : customer?.quotation_balance)) : 0
            //     }

            // } 
            // else {
            //     if (refInvoice.paidBackCash) {
            //         refInvoice.paidBackCash += Number(subtotal)
            //     } else {
            //         refInvoice.paidBackCash = Number(subtotal)
            //     }
            // }

            // let allInvoices = [...otherInvoice, refInvoice]

            // customer.customerLedger.push(customerLedger)
            // customer.customerLedger = allInvoices
            // customer.save()

            await CustomerLedgerModel.create(customerLedger)


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
    getAllInvoices: async (req, res) => {


        try {

            const invoices = await SaleReturnInvoiceModel.find({});

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