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





    }

}

module.exports = DemandedProductController