const supplierModel = require("./supplierSchema")



const SupplierController = {
    post: (req, res) => {

        let supplierData = req.body

        let { supplierName, mobileNumber } = supplierData

        if (!supplierName || !mobileNumber) {
            res.json({
                message: "Required fields are missing",
                status: false
            })
            return
        }

        supplierModel.create(supplierData).then((data) => {

            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return

            }

            res.json({
                message: "Supplier Successfully Add",
                status: true,
                data: data
            })

        }).catch((err) => {

            res.json({
                message: err.message,
                status: false,
            })


        })

    },

    get: async (req, res) => {


        supplierModel.find({}).then(data => {

            res.json({
                message: "Supplier successfully get",
                data: data,
                status: true
            })

        }).catch((err) => {

            res.json({
                message: err.message,
                status: false
            })

        })


    }
}


module.exports = SupplierController