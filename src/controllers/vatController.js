const vatModel = require("../models/VATSchema")


const vatController = {

    get: (req, res) => {

        vatModel.findOne().then((data) => {

            res.json({
                message: "Company Information Successfully get",
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

        


        vatModel.findByIdAndUpdate(id,data).then((data) => {

            if (data) {

                res.json({
                    message: "Company Information Successfully Updated",
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