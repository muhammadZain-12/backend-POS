const trashProductModel = require("../models/TrashProductSchema")
const damageProductModel = require("../models/damageProductsSchema")
const productModel = require("../models/productSchema")



const TrashProductController = {

    get: async (req, res) => {

        trashProductModel.find({}).then((data) => {

            if (data && data.length == 0) {

                res.json({
                    message: "No Trash Products",
                    status: true,
                    data: data
                })

            }
            else if (data && data.length > 0) {

                
                let dataToSend = data && data.length > 0 && data.filter((e, i) => e.qty)


                res.json({
                    message: "Trash Products Successfully get",
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
    addTrashProductInDamage : async (req,res) => {
    
    
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
                const existingTrashProduct = await trashProductModel.findOne({ barcode: product.barcode });
    
                if (existingTrashProduct) {
                    // If the damage product already exists, update the damage quantity
                    existingTrashProduct.qty -= Number(product.DamageQty);
                    await existingTrashProduct.save();
                } else {
    
                    res.json({
                        message: "Product Doesn't exist",
                        status: false
                    })
    
                    return
    
                }
    
    
                const existingProduct = await damageProductModel.findOne({ barcode: product.barcode });
    
                if (existingProduct) {
                    existingProduct.DamageQty += Number(product.DamageQty);
                    await existingProduct.save();
                } else {
                    // If the damage product does not exist, create a new one
                    await damageProductModel.create(product);
                }
    
                res.json({
                    message: "Product successfully add in damages",
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
    addTrashProductInInventory: async (req, res) => {
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
            const existingTrashProduct = await trashProductModel.findOne({ barcode: product.barcode });

            if (existingTrashProduct) {
                // If the damage product already exists, update the damage quantity
                existingTrashProduct.qty -= Number(product.DamageQty);
                await existingTrashProduct.save();
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

}


module.exports = TrashProductController