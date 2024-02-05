const damageProductModel = require("../models/damageProductsSchema")
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

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });

            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty += Number(product.DamageQty);
                await existingDamageProduct.save();
            } else {
                // If the damage product does not exist, create a new one
                await damageProductModel.create(product);
            }


            const existingProduct = await productModel.findOne({ barcode: product.barcode });

            if (existingProduct) {
                existingProduct.qty -= Number(product.DamageQty);
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

        console.log(product, "products")

        if (!product?.barcode) {
            res.json({
                message: "Kindly select product",
                status: false,
            });
            return;
        }

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });

            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty -= Number(product.DamageQty);
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
                existingProduct.qty += Number(product.DamageQty);
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

        try {
            // Try to find the existing damage product
            const existingDamageProduct = await damageProductModel.findOne({ barcode: product.barcode });

            if (existingDamageProduct) {
                // If the damage product already exists, update the damage quantity
                existingDamageProduct.DamageQty -= Number(product.DamageQty);
                await existingDamageProduct.save();
            } else {

                res.json({
                    message: "Product Doesn't exist",
                    status: false
                })

                return

            }


            const existingProduct = await trashProductModel.findOne({ barcode: product.barcode });

            if (existingProduct) {
                existingProduct.qty += Number(product.DamageQty);
                await existingProduct.save();
            } else {
                // If the damage product does not exist, create a new one
                await trashProductModel.create(product);
            }

            res.json({
                message: "Product successfully add in trash",
                status: true,
            });

        } catch (error) {
            console.log(error,"error")
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message,
            });
        }
    },
}


module.exports = DamageProductController