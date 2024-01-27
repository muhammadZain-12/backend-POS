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
            !e?.ProductName || !e?.Supplier_code || !e?.department || !e?.category || !e?.Sub_Category || !e?.make || !e?.model || !e?.barCode || !e?.cost_price || !e?.trade_price || !e?.retail_price || !e?.warehouse_price || !e?.warehouse_price_w_vat || !e?.cost_price_w_vat || !e?.trade_price_w_vat || !e?.retail_price_w_vat
        })

        if (checkFields) {

            res.json({

                message: `Required fields are missing`,
                status: false
            })
            return
        }

        let updateData = data && data.length > 0 && data.map((e, i) => {

            let colors = e.colors

            if (colors && colors.includes(",")) {

                let allColors = colors.split(",")
                colors = allColors

                return {
                    ...e,
                    product_name: e?.ProductName,
                    product_description: e.productDescription,
                    product_color: colors,
                    image1_url: e.image1,
                    image2_url: e.image2,
                    image3_url: e.image3,
                    supplier_code: e.Supplier_code,
                    supplier_series: e.Supplier_Series,
                    department: e.department,
                    category: e.category,
                    sub_category: e.Sub_Category,
                    make: e.make,
                    model: e.model,
                    qty: e.qty,
                    reminder_qty: e.remind,
                    cost_price: e.cost_price,
                    trade_price: e.trade_price,
                    warehouse_price: e.warehouse_price,
                    retail_price: e.retail_price,
                    cost_price_w_vat: e?.cost_price_w_vat,
                    trade_price_w_vat: e?.trade_price_w_vat,
                    warehouse_price_w_vat: e.warehouse_price_w_vat,
                    retail_price_w_vat: e.retail_price_w_vat,
                    transportation_price: e.transportation_price,
                    transportation_price_w_vat: e.transportation_price_w_vat,
                    other_expense: e.other_expense,
                    other_expense_w_vat: e.other_expense_w_vat,
                    minimum_sale: e.minimumSale,
                    warranty: e?.warranty,
                    warranty_duration: e?.warranty_duration,
                    minimum_stock: e?.minimumStock,
                    barcode: e?.barCode,
                    status: e?.status

                }
            } else {
                return {
                    ...e,
                    product_name: e?.ProductName,
                    product_description: e.productDescription,
                    product_color: e?.colors,
                    image1_url: e.image1,
                    image2_url: e.image2,
                    image3_url: e.image3,
                    supplier_code: e.Supplier_code,
                    supplier_series: e.Supplier_Series,
                    department: e.department,
                    category: e.category,
                    sub_category: e.Sub_Category,
                    make: e.make,
                    model: e.model,
                    qty: e.qty,
                    reminder_qty: e.remind,
                    cost_price: e.cost_price,
                    trade_price: e.trade_price,
                    warehouse_price: e.warehouse_price,
                    retail_price: e.retail_price,
                    cost_price_w_vat: e?.cost_price_w_vat,
                    trade_price_w_vat: e?.trade_price_w_vat,
                    warehouse_price_w_vat: e?.warehouse_price_w_vat,
                    retail_price_w_vat: e?.retail_price_w_vat,
                    transportation_price: e?.transportation_price,
                    transportation_price_w_vat: e?.transportation_price_w_vat,
                    other_expense: e?.other_expense,
                    other_expense_w_vat: e?.other_expense_w_vat,
                    minimum_sale: e?.minimumSale,
                    minimum_stock: e?.minimumStock,
                    barcode: e.barCode,
                    status: e.status
                }
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
                    // data: result,
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



