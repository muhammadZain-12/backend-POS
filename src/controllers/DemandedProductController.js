const DemandedProductModel = require("../models/demandedProduct")



const DemandedProductController = {



    post: async (req, res) => {

        let { productName } = req.body

        if (!productName) {
            res.json({
                message: "Required fields are missing",
                status: false
            })
            return
        }



        DemandedProductModel.findOne({ product_name: productName }).then((data) => {


            if (data) {


                DemandedProductModel.findByIdAndUpdate(data._id, {
                    $inc: { count: 1 }
                })
                    .then((data) => {

                        console.log(data, "dataa")

                        if (data) {
                            res.json({
                                message: "Demanded Product Successfully Submitted",
                                status: true,
                                data: data
                            })
                        }

                        if (!data) {

                            res.json({
                                message: "Internal Server Error",
                                status: false
                            })

                        }


                    }).catch((err) => {
                        console.log(err, "err")
                        res.json({
                            message: err.message,
                            status: false
                        })

                    })



            } else {

                let dataToSend = {

                    product_name: productName,
                    count: 1
                }

                DemandedProductModel.create(dataToSend).then((data) => {

                    console.log(data, "dataaa")

                    if (!data) {
                        res.json({
                            message: "Internal Server Error",
                            status: false
                        })
                        return
                    }

                    res.json({
                        message: "Demanded Product Successfully Submitted",
                        status: true,
                        data: data
                    })

                }).catch((err) => {

                    res.json({
                        message: err.message,
                        status: false
                    })

                })


            }



        }).catch((err) => {

            res.json({
                message: err.message,
                status: false
            })

        });





    },

    get: async (req, res) => {

        DemandedProductModel.find({}).then(data => {

            if (data && data.length == 0) {

                res.json({
                    message: "No Data Found",
                    status: false
                })
                return
            }

            res.json({
                message: "Product Successfully Get",
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

            const result = await DemandedProductModel.deleteMany({ _id: { $in: productIds } });

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

}

module.exports = DemandedProductController