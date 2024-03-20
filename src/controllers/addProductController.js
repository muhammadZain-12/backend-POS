const BwipJs = require("bwip-js");
const productModel = require("../models/productSchema")
const fs = require('fs');
const path = require("path");
const supplierModel = require("./supplierSchema");
const ProductLedgerModel = require("../models/productLedgerSchema");




function generateBarcode(barcodeNumber, imagePath) {
    return new Promise((resolve, reject) => {
        BwipJs.toBuffer({
            bcid: 'code128', // Barcode type
            text: barcodeNumber.toString(), // Text to encode in the barcode
            scale: 3, // Scaling factor
            height: 10, // Barcode height (adjust as needed)
            includetext: false, // Include human-readable text below the barcode
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



const AddProductController = {



    post: async (req, res) => {

        let {
            ProductName,
            productDescription,
            colors,
            image1,
            image2,
            image3,
            department,
            category,
            Sub_Category,
            make,
            model,
            qty,
            remind,
            cost_price,
            warehouse_price,
            trade_price,
            retail_price,
            IMEI,
            supplier_name,
            supplier_id,
            supplier_address,
            supplier_mobile_number,
            barCode,
            status
        } = req.body


        if (!ProductName || !department || !category || !Sub_Category || !make || !model || !barCode || !cost_price || !trade_price || !retail_price || !warehouse_price) {


            res.json({
                message: "Required fields are missing",
                status: false
            })
            return
        }

        const ledgerEntry = {
            date: new Date(),
            qty: qty,
            status: "purchase",
            cost_price: cost_price,
            barcode: barCode,
            retail_price: retail_price,
            warehouse_price: warehouse_price,
            trade_price: trade_price,
            supplierDetails: {
                supplier_name: supplier_name,
                supplier_address: supplier_address,
                supplier_mobile_number: supplier_mobile_number,
                supplier_id: supplier_id
            },
        };

        let dataToSend = {

            product_name: ProductName,
            product_description: productDescription,
            product_color: colors,
            image1_url: image1,
            image2_url: image2,
            image3_url: image3,
            department: department,
            category: category,
            sub_category: Sub_Category,
            make: make,
            model: model,
            qty: qty,
            supplier_name: supplier_name,
            supplier_address: supplier_address,
            supplier_mobile_number: supplier_mobile_number,
            supplier_id: supplier_id,
            reminder_qty: remind,
            cost_price: cost_price,
            trade_price: trade_price,
            warehouse_price: warehouse_price,
            retail_price: retail_price,
            IMEI: IMEI,
            barcode: barCode,
            status: status,
            // productLedger: ledgerEntry
        }



        try {
            // Check if the email already exists in the database
            const existingProduct = await productModel.findOne({ barcode: barCode });

            if (existingProduct) {
                // existingProduct?.productLedger?.push(ledgerEntry);
                return res.json({ status: false, message: 'The Product has already been added' });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Internal server error.' });
        }

        const barcodeImagePath = path.join(__dirname, '../products/', `${dataToSend.barcode}_barcode.png`);

        await generateBarcode(dataToSend?.barcode, barcodeImagePath);

        dataToSend.barcodeImage = `${dataToSend.barcode}_barcode.png`;


        // let supplier_ledger = {

        //     ProductName: dataToSend?.product_name,
        //     qty: dataToSend?.qty,
        //     cost_price: dataToSend?.cost_price,
        //     retail_price: dataToSend?.retail_price,
        //     warehouse_price: dataToSend?.warehouse_price,
        //     trade_price: dataToSend?.trade_price,
        //     totalAmount: Number(dataToSend?.cost_price) * Number(dataToSend?.qty),
        //     paymentMethod: "credit",
        //     status: "purchase goods from supplier",

        // }

        let supplier;
        try {
            supplier = await supplierModel.findById(supplier_id);
            if (!supplier) {
                return res.json({ status: false, message: 'Supplier not found.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Error finding supplier.' });
        }

        // Push entry to supplier ledger
        let supplier_ledger = {
            productName: dataToSend.product_name,
            barcode: dataToSend?.barcode,
            qty: dataToSend.qty,
            cost_price: dataToSend.cost_price,
            retail_price: dataToSend.retail_price,
            warehouse_price: dataToSend.warehouse_price,
            trade_price: dataToSend.trade_price,
            totalAmount: Number(dataToSend.cost_price) * Number(dataToSend.qty),
            paymentMethod: "credit",
            status: "purchase goods from supplier",
        };

        supplier.supplier_ledger.push(supplier_ledger);
        if (supplier.balance) {
            supplier.balance += (Number(dataToSend?.qty) * Number(dataToSend?.cost_price))
        } else {
            supplier.balance = Number(supplier_ledger?.totalAmount)
        }
        try {
            await supplier.save();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Error saving supplier ledger.' });
        }

        productModel
            .create(dataToSend)
            .then(async (data) => {
                if (!data) {
                    res.json({
                        message: 'Internal Server Error',
                        status: false,
                    })
                    return
                }
                if (data) {

                    ledgerEntry.productId = data?._id

                    await ProductLedgerModel.create(ledgerEntry)

                    res.json({
                        message: 'product added successfully',
                        status: true,
                        data: data,
                    })
                }
            })
            .catch((error) => {
                res.json({
                    message: 'Internal Server Error',
                    status: false,
                    error: error,
                })
            })

    },

    put: async (req, res) => {

        let data = req.body

        let { qty, trade_price, cost_price, warehouse_price, retail_price, barcode, supplier_name, supplier_address, supplier_mobile_number, supplier_id } = data

        if (!cost_price || !warehouse_price || !retail_price || !trade_price) {

            res.json({
                message: "Required Fields are missing",
                status: false
            })
            return
        }



        const ledgerEntry = {
            date: new Date(),
            qty: qty,
            status: "purchase",
            cost_price: cost_price,
            retail_price: retail_price,
            warehouse_price: warehouse_price,
            trade_price: trade_price,
            supplierDetails: {
                supplier_name: supplier_name,
                supplier_address: supplier_address,
                supplier_mobile_number: supplier_mobile_number,
                supplier_id: supplier_id
            },
        };

        try {
            // Check if the email already exists in the database
            const existingProduct = await productModel.findOne({ barcode: barcode });
            ledgerEntry.productId = existingProduct?._id
            ledgerEntry.barcode = existingProduct?.barcode
            if (existingProduct) {
                await productModel.findByIdAndUpdate(existingProduct._id, {
                    // $push: { productLedger: ledgerEntry },
                    $set: {
                        cost_price: cost_price,
                        retail_price: retail_price,
                        warehouse_price: warehouse_price,
                        trade_price: trade_price
                    },
                    $inc: { qty: qty }
                });


                await ProductLedgerModel.create(ledgerEntry)

                return res.json({ status: true, message: 'The Product Has Successfully Updated' });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Internal server error.' });
        }







    },

    get: async (req, res) => {



        try {

            let data = await productModel.find({})

            console.log(data, "dataaa")

            res.json({
                message: "Products Successfully Get",
                status: true,
                data: data
            })

        } catch (error) {

            console.log(error, "errorrr")
            res.json({
                message: "Internal Server Error",
                status: false
            })

        }
    },




    delete: async (req, res) => {
        try {
            const productIds = req.body.map(product => product._id);

            if (!productIds || productIds.length === 0) {
                return res.json({
                    message: "Invalid request. Product IDs are missing.",
                    status: false,
                });
            }

            const result = await productModel.deleteMany({ _id: { $in: productIds } });


            if (result.deletedCount > 0) {
                res.json({
                    message: "Products successfully deleted",
                    status: true,
                    data: result,
                });
            } else {
                res.json({
                    message: "Products not found or already deleted",
                    status: false,
                    data: result,
                });
            }
        } catch (error) {
            console.error('Error deleting products:', error);
            res.status(500).json({
                message: "Internal Server Error",
                status: false,
                data: null,
            });
        }
    },
    changeStatus: async (req, res) => {
        try {
            const products = req.body;

            if (!Array.isArray(products) || products.length === 0) {
                return res.json({
                    message: "Invalid request. Products array is required.",
                    status: false,
                });
            }

            // Extract product IDs and new status from the array
            const productUpdates = products.map(product => ({
                updateOne: {
                    filter: { _id: product._id },
                    update: { $set: { status: product.status } },
                },
            }));

            // Update the status of products
            const result = await productModel.bulkWrite(productUpdates);

            if (result.modifiedCount > 0) {
                res.json({
                    message: "Products status successfully changed",
                    status: true,
                    data: result,
                });
            } else {
                res.json({
                    message: "No products found or status already set to the desired value",
                    status: false,
                    data: result,
                });
            }
        } catch (error) {
            console.error('Error changing product status:', error);
            res.status(500).json({
                message: "Internal Server Error",
                status: false,
                data: null,
            });
        }
    }




}


module.exports = AddProductController