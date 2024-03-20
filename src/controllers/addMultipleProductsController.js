const productModel = require("../models/productSchema")
const fs = require('fs');
const path = require("path")
const BwipJs = require("bwip-js");
const supplierModel = require("./supplierSchema");
const CustomerLedgerController = require("./customerLedgerController");
const CustomerLedgerModel = require("../models/customerLedgerSchema");
const ProductLedgerModel = require("../models/productLedgerSchema");





function generateBarcode(barcodeNumber, imagePath) {
    return new Promise((resolve, reject) => {
        BwipJs.toBuffer({
            bcid: 'code128', // Barcode type
            text: barcodeNumber.toString(), // Text to encode in the barcode
            scale: 3, // Scaling factor
            height: 10, // Barcode height (adjust as needed)
            includetext: false,
            // Include human-readable text below the barcode
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


const AddMultipleProductsController = {

    post: async (req, res) => {

        let data = req.body

        if (!Array.isArray(data)) {
            res.json({

                message: "Invalid Data Type",
                status: false
            })

            return
        }

        let checkFields = data && data.length > 0 && data.some((e, i) => {
            !e?.ProductName || !e?.department || !e?.category || !e?.Sub_Category || !e?.make || !e?.model || !e?.barCode
        })

        if (checkFields) {

            res.json({

                message: `Required fields are missing`,
                status: false
            })
            return
        }


        let updateData = data && data.length > 0 && data.map((e, i) => {





            return {
                ...e,
                product_name: e?.ProductName,
                product_description: e.productDescription,
                product_color: e?.colors,
                image1_url: e.image1,
                image2_url: e.image2,
                image3_url: e.image3,
                department: e.department,
                category: e.category,
                sub_category: e.Sub_Category,
                make: e.make,
                model: e.model,
                qty: e.qty,
                supplier_name: e?.supplier_name,
                supplier_address: e?.supplier_address,
                supplier_mobile_number: e?.supplier_mobile_number,
                supplier_id: e?.supplier_id,
                reminder_qty: e.remind,
                cost_price: e.cost_price,
                trade_price: e.trade_price,
                warehouse_price: e.warehouse_price,
                retail_price: e.retail_price,
                barcode: e.barCode,
                status: e.status,
                // productLedger: ledgerEntry
            }

        })

        try {
            // Check for existing products based on barcode
            const existingProducts = await productModel.find({ barcode: { $in: updateData.map(product => product?.barcode) } });

            let newProducts = updateData.filter(product => {
                // Check if the product ID is not present in the existingProducts array
                return !existingProducts.some(existingProduct => existingProduct.barcode === product.barcode);
            });

            if (newProducts && newProducts?.length > 0) {


                const productsWithBarcodeImages = await Promise.all(newProducts.map(async e => {


                    const barcodeImagePath = path.join(__dirname, '../products/', `${e.barcode}_barcode.png`);
                    await generateBarcode(e?.barcode, barcodeImagePath);
                    const barcodeImage = `${e.barcode}_barcode.png`;

                    let supplier;
                    try {
                        supplier = await supplierModel.findOne({ supplierName: e?.supplier_name });
                        if (!supplier) {
                            return res.json({ status: false, message: 'Supplier not found.' });
                        }
                    } catch (error) {
                        console.error(error);
                        return res.status(500).json({ status: false, message: 'Error finding supplier.' });
                    }

                    // Push entry to supplier ledger
                    let supplier_ledger = {
                        productName: e.ProductName,
                        barcode: e?.barcode,
                        qty: e.qty,
                        cost_price: e.cost_price,
                        retail_price: e.retail_price,
                        warehouse_price: e.warehouse_price,
                        trade_price: e.trade_price,
                        totalAmount: Number(e.cost_price) * Number(e.qty),
                        paymentMethod: "credit",
                        status: "purchase goods from supplier",
                    };

                    supplier.supplier_ledger.push(supplier_ledger);
                    if (supplier.balance) {
                        supplier.balance += (Number(e?.qty) * Number(e?.cost_price))

                    }
                    else {
                        supplier.balance = Number(supplier_ledger?.totalAmount)
                    }
                    try {
                        await supplier.save();
                    } catch (error) {
                        console.error(error);
                        return res.status(500).json({ status: false, message: 'Error saving supplier ledger.' });
                    }


                    const ledgerEntry = {
                        date: new Date(),
                        qty: e?.qty,
                        status: "purchase",
                        barcode: e?.barCode,
                        cost_price: e?.cost_price,
                        retail_price: e?.retail_price,
                        warehouse_price: e?.warehouse_price,
                        trade_price: e?.trade_price,
                        supplierDetails: {
                            supplier_name: e?.supplier_name,
                            supplier_address: e?.supplier_address,
                            supplier_mobile_number: e?.supplier_mobile_number,
                            supplier_id: e?.supplier_id
                        },
                    };

                    await ProductLedgerModel.create(ledgerEntry)

                    return {
                        ...e,
                        barcodeImage: barcodeImage
                    };
                }));


                const result = await productModel.insertMany(productsWithBarcodeImages);

                res.json({
                    message: "Product added successfully",
                    status: true,
                    data: result,
                    existingProducts: existingProducts
                })
                // }
            } else {
                res.json({
                    message: "Product already exists",
                    status: false,
                    existingProducts: existingProducts.length
                })
            }
        } catch (error) {
            res.json({
                message: "Internal Server Error",
                status: false
            })
            console.error('Error checking and adding products to the database:', error);
        }




    }

}


module.exports = AddMultipleProductsController



