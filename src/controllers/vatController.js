const vatModel = require("../models/VATSchema")


const vatController = {

    get: (req, res) => {

        vatModel.findOne().then((data) => {

            // let vatRate = data.vatRate

            console.log(data, 'dataaa')

            // console.log(vatRate)

            res.json({
                message: "Vat Rate Successfully get",
                status: true,
                data: data
            })


        }).catch((err) => {

            res.json({

                error: err,
                message: err.message,
                status: false

            })

        });

    },

    put: (req, res) => {

        let data = req.body

        let id = data._id
        let rate = data.vatRate


        vatModel.findByIdAndUpdate(id, {
            $set: { vatRate: rate }
        }).then((data) => {

            if (data) {

                res.json({
                    message: "Vat Rate Successfully get",
                    status: true,
                    data: data
                });
            } else {
                res.json({
                    message: "No VAT data found",
                    status: false
                });
            }
        })
            .catch((err) => {
                console.log(err, "err ")
            })


    }

}

module.exports = vatController