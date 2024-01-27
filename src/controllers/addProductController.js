const productModel = require("../models/productSchema")


const AddProductController = {



    post: async (req, res) => {

        let {
            ProductName,
            productDescription,
            colors,
            image1,
            image2,
            image3,
            Supplier_code,
            Supplier_Series,
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
            cost_price_w_vat,
            trade_price_w_vat,
            warehouse_price_w_vat,
            retail_price_w_vat,
            transportation_price,
            transportation_price_w_vat,
            other_expense,
            other_expense_w_vat,
            minimumSale,
            minimumStock,
            warranty,
            warranty_duration,
            IMEI,
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


        let dataToSend = {

            product_name: ProductName,
            product_description: productDescription,
            product_color: colors,
            image1_url: image1,
            image2_url: image2,
            image3_url: image3,
            supplier_code: Supplier_code,
            supplier_series: Supplier_Series,
            department: department,
            category: category,
            sub_category: Sub_Category,
            make: make,
            model: model,
            qty: qty,
            reminder_qty: remind,
            cost_price: cost_price,
            trade_price: trade_price,
            warehouse_price: warehouse_price,
            retail_price: retail_price,
            cost_price_w_vat: cost_price_w_vat,
            trade_price_w_vat: trade_price_w_vat,
            warehouse_price_w_vat: warehouse_price_w_vat,
            retail_price_w_vat: retail_price_w_vat,
            transportation_price: transportation_price,
            transportation_price_w_vat: transportation_price_w_vat,
            other_expense: other_expense,
            other_expense_w_vat: other_expense_w_vat,
            warranty: warranty,
            IMEI: IMEI,
            warranty_duration: warranty_duration,
            minimum_sale: minimumSale,
            minimum_stock: minimumStock,
            barcode: barCode,
            status: status
        }

        try {
            // Check if the email already exists in the database
            const existingProduct = await productModel.findOne({ barcode: barCode });

            if (existingProduct) {
                return res.json({ status: false, message: 'The Product has already been added' });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: 'Internal server error.' });
        }

        productModel
            .create(dataToSend)
            .then((data) => {
                if (!data) {
                    res.json({
                        message: 'Internal Server Error',
                        status: false,
                    })
                    return
                }
                if (data) {
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

    get: async (req, res) => {


        try {


            let data = await productModel.find({})

            res.json({
                message: "Products Successfully Get",
                status: true,
                data: data
            })

        } catch (error) {

            res.json({
                message: "Internal Server Error",
                status: false
            })

        }
    }

}


module.exports = AddProductController