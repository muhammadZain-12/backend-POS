const userModel = require("../models/userSchema")





const EmployeeController = {

    get: async (req, res) => {


        userModel.find({}).then((result) => {

            res.json({
                message: "Employees Successfully Get",
                data: result,
                status: true
            })


        }).catch((err) => {


            res.json({
                message: err.message,
                error: err,
                status: false
            })

        });



    },
    delete: (req, res) => {

        let id = req.params.id

        userModel.findOneAndDelete({ employee_id: id }).then((data) => {

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

    changeStatus: (req, res) => {

        let { id, status } = req.body

        userModel.findOneAndUpdate({ employee_id: id }, { $set: { status: status.toLowerCase() == "block" ? "active" : "block" } }).then((data) => {

            if (data) {
                res.json({
                    message: "Employee status successfully updated",
                    data: data,
                    status: true
                })
                return
            } else {


                res.json({
                    message: "Internal Server Error",
                    data: {},
                    status: false
                })

            }


        }).catch((error) => {

            res.json({
                message: error.message,
                error: error,
                status: false
            })


        })






    },
    changeRole: (req, res) => {

        let { id, role } = req.body

        userModel.findOneAndUpdate({ employee_id: id }, { $set: { role:role }}).then((data) => {

            if (data) {
                res.json({
                    message: "Employee role successfully updated",
                    data: data,
                    status: true
                })
                return
            } else {


                res.json({
                    message: "Internal Server Error",
                    data: {},
                    status: false
                })

            }


        }).catch((error) => {

            res.json({
                message: error.message,
                error: error,
                status: false
            })


        })






    },
    changePriceShowStatus: (req, res) => {

        let { id, status } = req.body

        userModel.findOneAndUpdate({ employee_id: id }, { $set: { show_price: status ? false : true } }).then((data) => {

            if (data) {
                res.json({
                    message: "Employee price status successfully updated",
                    data: data,
                    status: true
                })
                return
            } else {


                res.json({
                    message: "Internal Server Error",
                    data: {},
                    status: false
                })

            }


        }).catch((error) => {

            res.json({
                message: error.message,
                error: error,
                status: false
            })


        })



    }



}

module.exports = EmployeeController