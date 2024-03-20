const ProductLedgerModel = require("../models/productLedgerSchema")
const productModel = require("../models/productSchema")
const PuchaseOrderModel = require("../models/puchaseOrderSchema")
const ProductLedgerController = require("./ProductLedgerController")





const PurchaseOrderController = {

    get: async (req, res) => {


        PuchaseOrderModel.find({}).then((data) => {

            if (!data || data?.length == 0) {

                res.json({
                    message: "No Data Found",
                    status: true,
                    data: []
                })
            } else {

                res.json({
                    message: "Purchase Order Successfully Get",
                    status: true,
                    data: data
                })

            }

        }).catch((error) => {

            res.json({
                message: "Internal Server Error",
                status: true,
                error: error.message
            })

        })




    },
    post: async (req, res) => {

        let purchaseOrder = req.body

        let count = await PuchaseOrderModel.countDocuments({})

        purchaseOrder.purchaseOrder_number = count + 1

        PuchaseOrderModel.create(purchaseOrder).then((data) => {

            if (!data) {
                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            res.json({
                message: "Purchase Order Successfully Created",
                status: true,
                data: data
            })


        }).catch((error) => {


            res.json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })

        })






    },
    updateQtyArrived: async (req, res) => {
        let purchaseOrder = req.body;
        let { productDetails } = purchaseOrder;

        if (!productDetails || productDetails.length === 0) {
            return res.status(400).json({
                message: "Products are missing in PO",
                status: false
            });
        }

        try {
            productDetails = productDetails.map((e) => {

                return {
                    ...e,
                    remainingQty: (Number(e.remainingQty) || Number(e.orderQty)) - (Number(e.arrivedQty) || 0),
                    arriveQty: (Number(e.arriveQty) || 0) + (Number(e.arrivedQty) || 0),
                };
            });



            if (productDetails && productDetails?.length > 0 && productDetails?.every((e, i) => (e.orderQty - e?.arriveQty) == 0)) {

                purchaseOrder.status = "completed"

            }

            await PuchaseOrderModel.findByIdAndUpdate(purchaseOrder._id, {
                $set: { productDetails: productDetails, status: purchaseOrder?.status }
            });

            for (const productDetail of productDetails) {
                if (productDetail.arrivedQty) {


                    const product = await productModel.findById(productDetail?._id);
                    if (product) {
                        product.qty += Number(productDetail.arrivedQty);
                        product.cost_price = productDetail?.cost_price,
                            product.retail_price = productDetail?.retail_price,
                            product.warehouse_price = productDetail?.warehouse_price,
                            product.trade_price = productDetail?.retail_price

                        const ledgerEntry = {
                            date: new Date(),
                            qty: productDetail.arrivedQty,
                            barcode : product?.barcode,
                            status: "purchase",
                            cost_price: productDetail.cost_price,
                            retail_price: productDetail.retail_price,
                            warehouse_price: productDetail.warehouse_price,
                            trade_price: productDetail.trade_price,
                            supplierDetails: {
                                supplier_name: purchaseOrder.supplier_name,
                                supplier_address: purchaseOrder.supplier_address,
                                supplier_mobile_number: purchaseOrder.supplier_mobile_number,
                                supplier_id: purchaseOrder.supplierDetails?.[0]?.supplier_id
                            }
                        };


                        // product.productLedger.push(ledgerEntry);

                        await ProductLedgerModel.create(ledgerEntry)

                        delete productDetail.arrivedQty
                        delete product.arrivedQty
                        await product.save();
                    }
                }
            }

            return res.json({
                message: "Purchase order updated successfully",
                status: true
            });
        } catch (error) {
            console.error("Error updating purchase order:", error);
            return res.status(500).json({
                message: "Error updating purchase order",
                status: false
            });
        }
    },
    updateQtyLeft: async (req, res) => {
        let purchaseOrder = req.body;
        let { productDetails } = purchaseOrder;


        console.log(purchaseOrder, "purchaseOrder")

        if (!productDetails || productDetails.length === 0) {
            return res.status(400).json({
                message: "Products are missing in PO",
                status: false
            });
        }

        for (const productDetail of productDetails) {
            if (Number(productDetail?.orderQty) > Number(productDetail?.arriveQty || 0)) {

                const product = await productModel.findById(productDetail?._id);
                if (product) {


                    product.qty += Number(productDetail?.orderQty) - Number(productDetail?.arriveQty || 0);
                    product.cost_price = productDetail?.cost_price,
                        product.retail_price = productDetail?.retail_price,
                        product.warehouse_price = productDetail?.warehouse_price,
                        product.trade_price = productDetail?.retail_price

                    const ledgerEntry = {
                        date: new Date(),
                        qty: Number(productDetail?.orderQty) - Number(productDetail?.arriveQty || 0),
                        status: "purchase",
                        barcode : product.barcode,
                        cost_price: productDetail.cost_price,
                        retail_price: productDetail.retail_price,
                        warehouse_price: productDetail.warehouse_price,
                        trade_price: productDetail.trade_price,
                        supplierDetails: {
                            supplier_name: purchaseOrder.supplier_name,
                            supplier_address: purchaseOrder.supplier_address,
                            supplier_mobile_number: purchaseOrder.supplier_mobile_number,
                            supplier_id: purchaseOrder.supplierDetails?.[0]?.supplier_id
                        }
                    };


                    // product.productLedger.push(ledgerEntry);

                    await ProductLedgerModel.create(ledgerEntry)

                    delete productDetail.arrivedQty
                    delete product.arrivedQty
                    await product.save();
                }
            }
        }

        try {
            productDetails = productDetails.map((e) => {
                return {
                    ...e,
                    remainingQty: 0,
                    arriveQty: e?.orderQty,
                };
            });

            purchaseOrder.status = "completed"

            await PuchaseOrderModel.findByIdAndUpdate(purchaseOrder._id, {
                $set: { productDetails: productDetails, status: purchaseOrder?.status }
            });



            return res.json({
                message: "Purchase order updated successfully",
                status: true
            });
        } catch (error) {
            console.error("Error updating purchase order:", error);
            return res.status(500).json({
                message: "Error updating purchase order",
                status: false
            });
        }
    },
    editPO: async (req, res) => {

        let purchaseOrderDetails = req.body

        PuchaseOrderModel.findByIdAndUpdate(purchaseOrderDetails?._id, purchaseOrderDetails).then((data) => {

            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })

                return
            }

            res.json({
                message: "Purchase Order Successfully Edited",
                status: true,
                data: data
            })


        }).catch((error) => {


            res.json({
                message: "Internal Server Error",
                status: false,
                error: error?.message
            })


        })




    }




}

module.exports = PurchaseOrderController