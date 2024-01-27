const productModel = require("../models/productSchema")
const supplierModel = require("./supplierSchema")






const ArrangeProductController = {

    post: async (req, res) => {

        let data = req.body

        let { productDetails, supplierDetails, paymentMethod } = data

        if (!productDetails || !supplierDetails || !paymentMethod) {
            res.json({
                message: "Required fields are missing",
                status: false
            })
            return
        }

        let {
            product_name,
            department,
            category,
            sub_category,
            make,
            model,
            qty,
            cost_price,
            warehouse_price,
            trade_price,
            retail_price,
            barcode,
            status
        } = productDetails

        let { supplierName, shopDetails, mobileNumber } = supplierDetails



        if (!supplierName || !shopDetails || !mobileNumber) {


            res.json({
                message: "Supplier fields are missing",
                status: false
            })
            return
        }

        if (!product_name || !department || !category || !sub_category || !make || !model || !barcode || !cost_price || !trade_price || !retail_price || !warehouse_price || !qty) {


            res.json({
                message: "Product fields are missing",
                status: false
            })
            return
        }

        if (!paymentMethod) {
            res.json({
                message: "Payment Method is missing",
                status: false
            })
            return

        }


        if (paymentMethod?.toLowerCase() == "credit") {


            supplierModel.findOne({ _id: supplierDetails?._id }).then((supplier) => {

                supplierModel.findByIdAndUpdate(supplier?._id, {
                    $inc: { balance: (cost_price * qty) }
                })
                    .then(async (supplier) => {

                        try {
                            // Check if the email already exists in the database
                            const existingProduct = await productModel.findOne({ barcode: barcode });

                            if (existingProduct) {

                                console.log(existingProduct._id, cost_price, trade_price, warehouse_price, retail_price, "working");


                                productModel.findByIdAndUpdate(existingProduct._id, {
                                    $inc: { qty: qty },
                                    $set: {
                                        cost_price: cost_price,
                                        trade_price: trade_price,
                                        warehouse_price: warehouse_price,
                                        retail_price: retail_price,
                                        category : productDetails?.category,
                                        sub_category : productDetails?.sub_category,
                                        make : productDetails.make,
                                        model : productDetails?.model,
                                        product_name : productDetails?.product_name,
                                        department : productDetails?.department,
                                    }

                                }).then((updatedProduct) => {


                                    let data = {

                                        supplierDetails: supplier,
                                        productDetails: updatedProduct

                                    }



                                    res.json({
                                        message: "Transaction Successful",
                                        status: true,
                                        data: data

                                    })

                                    return


                                }).catch((error) => {
                                    res.json({
                                        message: error.message,
                                        status: false
                                    })
                                })



                            }
                            else {

                                let productToSend = {
                                    ...productDetails,
                                    supplier_name: supplierName,
                                    supplier_address: shopDetails,
                                    supplier_mobile_number: mobileNumber,
                                    supplier_id: supplier?._id
                                }


                                productModel.create(productToSend).then((product) => {

                                    if (!product) {

                                        res.json({
                                            message: "Internal Server Error",
                                            status: false
                                        })
                                        return
                                    }

                                    let data = {

                                        supplierDetails: supplier,
                                        productDetails: product

                                    }

                                    res.json({
                                        message: "Transaction Successful",
                                        status: true,
                                        data: data

                                    })

                                }).catch((error) => {

                                    res.json({
                                        message: error.message,
                                        status: false
                                    })
                                    return
                                })

                            }
                        }

                        catch (error) {
                            console.error(error);
                            return res.status(500).json({ status: false, message: 'Internal server error.' });
                        }



                    }).catch((error) => {

                        res.json({
                            message: error.message,
                            status: false
                        })

                    })

            }).catch((error) => {

                res.json({
                    message: error.message,
                    status: false
                })

            })


        }


        else {


            try {
                // Check if the email already exists in the database
                const existingProduct = await productModel.findOne({ barcode: barcode });

                if (existingProduct) {

                    console.log(existingProduct._id, cost_price, trade_price, warehouse_price, retail_price, "working");


                    productModel.findByIdAndUpdate(existingProduct._id, {
                        $inc: { qty: qty },
                        $set: {
                            cost_price: cost_price,
                            trade_price: trade_price,
                            warehouse_price: warehouse_price,
                            retail_price: retail_price,
                            category : productDetails?.category,
                            sub_category : productDetails?.sub_category,
                            make : productDetails.make,
                            model : productDetails?.model,
                            product_name : productDetails?.product_name,
                            department : productDetails?.department,
                        
                        }
                    }).then((updatedProduct) => {

                        let data = {

                            supplierDetails: supplierDetails,
                            productDetails: updatedProduct

                        }

                        res.json({
                            message: "Transaction Successful",
                            status: true,
                            data: data

                        })
                        return


                    }).catch((error) => {

                        res.json({
                            message: error.message,
                            status: false,
                        })
                        return

                    })




                } else {

                    let productToSend = {
                        ...productDetails,
                        supplier_name: supplierName,
                        supplier_address: shopDetails,
                        supplier_mobile_number: mobileNumber,
                        supplier_id: supplierDetails?._id
                    }

                    productModel.create(productToSend).then((product) => {

                        if (!product) {

                            res.json({
                                message: "Internal Server Error",
                                status: false
                            })
                            return
                        }

                        let data = {

                            supplierDetails: supplierDetails,
                            productDetails: product

                        }

                        console.log(data, "dataaaaaaa")

                        res.json({
                            message: "Transaction Successful",
                            status: true,
                            data: data

                        })



                    }).catch((error) => {

                        res.json({
                            message: error.message,
                            status: false
                        })
                        return
                    })

                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ status: false, message: 'Internal server error.' });
            }


        }

















        // supplierModel.findByIdAndUpdate(supplierDataToSend).then(async (supplier) => {


        //     try {
        //         // Check if the email already exists in the database
        //         const existingProduct = await productModel.findOne({ barcode: barcode });

        //         if (existingProduct) {

        //             productModel.findByIdAndUpdate(existingProduct._id, {
        //                 $inc: { qty: qty } // Decrement the quantity by the sold quantity
        //             });


        //             return


        //         } else {

        //             let productToSend = {
        //                 ...productDetails,
        //                 supplier_name: supplierName,
        //                 supplier_address: shopDetails,
        //                 supplier_mobile_number: mobileNumber,
        //                 supplier_id: supplier?._id
        //             }

        //             productModel.create(productToSend).then((product) => {

        //                 if (!product) {

        //                     res.json({
        //                         message: "Internal Server Error",
        //                         status: false
        //                     })
        //                     return
        //                 }

        //                 let data = {

        //                     supplierDetails: supplier,
        //                     productDetails: product

        //                 }

        //                 res.json({
        //                     message: "Transaction Successful",
        //                     status: true,
        //                     data: data

        //                 })



        //             }).catch((error) => {

        //                 res.json({
        //                     message: error.message,
        //                     status: false
        //                 })
        //                 return
        //             })

        //         }
        //     }
        //     catch (error) {
        //         console.error(error);
        //         return res.status(500).json({ status: false, message: 'Internal server error.' });
        //     }





        // }).catch((error) => {

        //     res.json({
        //         message: error.message,
        //         status: false
        //     })
        //     return
        // })

















    }


}

module.exports = ArrangeProductController