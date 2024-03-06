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


    },
    delete: (req, res) => {

        let id = req.params.id

        supplierModel.findOneAndDelete({ _id: id }).then((data) => {

            console.log(data)
            if (data) {
                res.json({
                    message: "Data Successfully Delete",
                    status: true,
                    data: data
                })
                return
            } else {
                res.json({

                    message: "Internal Server Error",
                    status: false,
                    data: {}


                })
            }

        }).catch((err) => {

            res.json({
                message: err?.message,
                status: false,
                error: err
            })

        })


    },
    put: (req, res) => {

        let data = req.body

        supplierModel?.findByIdAndUpdate(data?._id, data).then((data) => {

            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            res.json({
                message: "Supplier Details Succesfully Edited",
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


    },
    payAmount: async (req, res) => {

        let { id, amount } = req.body


        console.log(req.body, "body")

        if (!id || !amount) {

            res.json({
                message: "Required fields are missing",
                status: false

            })
            return
        }


        let supplier = await supplierModel.findById(id)

        if (!supplier) {
            res.json({
                message: "Unable to find supplier",
                status: false
            })
            return
        }

        let supplier_ledger = {
            paymentMethod: "cash",
            payAmount: amount,
            qty : 0,
            cost_price : 0,
            totalAmount : 0,
            trade_price : 0,
            productName : "-",
            status: "paid cash to supplier",
        };


        supplier.supplier_ledger.push(supplier_ledger)
        supplier.balance -= amount

        supplier.save()

        res.json({
            message: "Succesfully update supplier",
            status: true,
            data: supplier
        })


    }

}


module.exports = SupplierController