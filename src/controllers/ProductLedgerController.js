const ProductLedgerModel = require("../models/productLedgerSchema")




const ProductLedgerController = {

    getProductLedger: async (req, res) => {

        let barcode = req?.params?.barcode

        ProductLedgerModel.find({ barcode: barcode }).then((result) => {

            if (!result || result.length == 0) {
                res.json({
                    message: "No Data Found",
                    data: [],
                    status: true
                })
                return
            }

            res.json({
                message: "Data Successfully Found",
                data: result,
                status: true
            })


        }).catch((err) => {

            res.json({
                message: "Internal Server Errro",
                error: err?.message,
                status: false
            })

        });


    }

}


module.exports = ProductLedgerController