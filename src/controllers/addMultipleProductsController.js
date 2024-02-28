const productModel = require("../models/productSchema")



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

            console.log(e,"eeee")


            const ledgerEntry = {
                date: new Date(),
                qty: e?.qty,
                status: "purchase",
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
                productLedger: ledgerEntry
            }

        })

        try {
            // Check for existing products based on barcode
            const existingProducts = await productModel.find({ barcode: { $in: updateData.map(product => product?.barcode) } });

            const newProducts = updateData.filter(product => {
                // Check if the product ID is not present in the existingProducts array
                return !existingProducts.some(existingProduct => existingProduct.barcode === product.barcode);
            });

            if (newProducts && newProducts?.length > 0) {
                const result = await productModel.insertMany(newProducts);
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



