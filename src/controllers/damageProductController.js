const damageProductModel = require("../models/damageProductsSchema")
const ProductLedgerModel = require("../models/productLedgerSchema")
const productModel = require("../models/productSchema")
const trashProductModel = require("../models/TrashProductSchema")

const DamageProductController = {

    get: async (req, res) => {

        damageProductModel.find({}).then((data) => {

            if (data && data.length == 0) {

                res.json({
                    message: "No Damage Products",
                    status: true,
                    data: data
                })

            }
            else if (data && data.length > 0) {

                let dataToSend = data && data.length > 0 && data.filter((e, i) => e.DamageQty)

                res.json({
                    message: "Damage Products Successfully get",
                    status: true,
                    data: dataToSend
                })

            }

        }).catch((err) => {

            res.json({
                message: "Internal Server Error",
                status: false
            })

        })


    },
    addProduct: async (req, res) => {
        const product = req.body;


        if (!product?.barcode) {
            res.json({
                message: "Kindly select product",
                status: false,
            });
            return;
        }



        const ledgerEntry = {
            date: new Date(),
            qty: product?.qty,
            status: "damage",
            cost_price: product?.cost_price,
            retail_price: product?.retail_price,
            warehouse_price: product?.warehouse_price,
            trade_price: product?.trade_price,
            supplierDetails: {
                supplier_name: product?.supplier_name,
                supplier_address: product?.supplier_address,
                supplier_mobile_number: product?.supplier_mobile_number,
                supplier_id: product?.supplier_id
            },
        };

        product.productLedger = ledgerEntry

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });

            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty += Number(product.DamageQty);
                existingDamageProduct?.productLedger?.push(ledgerEntry)

                await existingDamageProduct.save();
            } else {
                // If the damage product does not exist, create a new one
                await damageProductModel.create(product);
            }

            const existingProduct = await productModel.findOne({ barcode: product.barcode });

            if (existingProduct) {

                const myLedgerEntry = {
                    date: new Date(),
                    qty: -product?.qty,
                    status: "damage",
                    cost_price: product?.cost_price,
                    retail_price: product?.retail_price,
                    warehouse_price: product?.warehouse_price,
                    trade_price: product?.trade_price,
                    supplierDetails: {
                        supplier_name: product?.supplier_name,
                        supplier_address: product?.supplier_address,
                        supplier_mobile_number: product?.supplier_mobile_number,
                        supplier_id: product?.supplier_id
                    },
                };


                existingProduct.qty -= Number(product.DamageQty);
                existingProduct.productLedger.push(myLedgerEntry)
                await existingProduct.save();
            } else {
                res.json({
                    message: "Product not found",
                    status: false,
                });
                return;
            }

            res.json({
                message: "Damage product and product model updated successfully",
                status: true,
            });

        } catch (error) {
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message,
            });
        }
    },
    addDamageProductInInventory: async (req, res) => {
        const product = req.body;

        if (!product?.barcode) {
            res.json({
                message: "Kindly select product",
                status: false,
            });
            return;
        }


        console.log(product, "products")


        const ledgerEntry = {
            date: new Date(),
            qty: -product?.DamageQty,
            status: "damage to inventory transfer",
            cost_price: product?.cost_price,
            retail_price: product?.retail_price,
            warehouse_price: product?.warehouse_price,
            trade_price: product?.trade_price,
            supplierDetails: {
                supplier_name: product?.supplier_name,
                supplier_address: product?.supplier_address,
                supplier_mobile_number: product?.supplier_mobile_number,
                supplier_id: product?.supplier_id
            },
        };

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });




            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty -= Number(product.DamageQty);
                existingDamageProduct.productLedger.push(ledgerEntry)
                await existingDamageProduct.save();
            } else {


                res.json({
                    message: "Product Doesn't exist",
                    status: false
                })

                return
            }


            const existingProduct = await productModel.findOne({ barcode: product.barcode });

            if (existingProduct) {

                const myLedgerEntry = {
                    date: new Date(),
                    qty: product?.DamageQty,
                    barcode: product.barcode,
                    status: "damage to inventory transfer",
                    cost_price: product?.cost_price,
                    retail_price: product?.retail_price,
                    warehouse_price: product?.warehouse_price,
                    trade_price: product?.trade_price,
                    supplierDetails: {
                        supplier_name: product?.supplier_name,
                        supplier_address: product?.supplier_address,
                        supplier_mobile_number: product?.supplier_mobile_number,
                        supplier_id: product?.supplier_id
                    },
                };

                existingProduct.qty += Number(product.DamageQty);
                // existingProduct.productLedger.push(myLedgerEntry)
                await ProductLedgerModel.create(myLedgerEntry)
                await existingProduct.save();
            } else {
                res.json({
                    message: "Product not found",
                    status: false,
                });
                return;
            }

            res.json({
                message: "Product successfully add in inventory",
                status: true,
            });

        } catch (error) {
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message,
            });
        }
    },

    addDamageProductInTrash: async (req, res) => {

        const product = req.body;


        if (!product?.barcode) {
            res.json({
                message: "Kindly select product",
                status: false,
            });
            return;
        }



        const ledgerEntry = {
            date: new Date(),
            qty: -product?.DamageQty,
            status: "damage to trash transfer",
            cost_price: product?.cost_price,
            retail_price: product?.retail_price,
            warehouse_price: product?.warehouse_price,
            trade_price: product?.trade_price,
            supplierDetails: {
                supplier_name: product?.supplier_name,
                supplier_address: product?.supplier_address,
                supplier_mobile_number: product?.supplier_mobile_number,
                supplier_id: product?.supplier_id
            },
        };

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });

            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty -= Number(product.DamageQty);
                existingDamageProduct.productLedger.push(ledgerEntry)
                await existingDamageProduct.save();
            } else {

                res.json({
                    message: "Product Doesn't exist",
                    status: false
                })

                return

            }



            const myLedgerEntry = {
                date: new Date(),
                qty: product?.DamageQty,
                status: "damage to trash transfer",
                cost_price: product?.cost_price,
                retail_price: product?.retail_price,
                warehouse_price: product?.warehouse_price,
                trade_price: product?.trade_price,
                supplierDetails: {
                    supplier_name: product?.supplier_name,
                    supplier_address: product?.supplier_address,
                    supplier_mobile_number: product?.supplier_mobile_number,
                    supplier_id: product?.supplier_id
                },
            };

            const existingProduct = await trashProductModel.findOne({ barcode: product.barcode });

            if (existingProduct) {
                existingProduct.qty += Number(product.DamageQty);
                existingProduct.productLedger.push(myLedgerEntry)
                await existingProduct.save();
            } else {
                // If the damage product does not exist, create a new one
                product.productLedger = myLedgerEntry
                await trashProductModel.create(product);
            }

            res.json({
                message: "Product successfully add in trash",
                status: true,
            });

        } catch (error) {
            console.log(error, "error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message,
            });
        }
    },
}


module.exports = DamageProductController