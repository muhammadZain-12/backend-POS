const cashModel = require("../models/cashSchema")



const CashController = {
    getAll: async (req, res) => {

        cashModel.find({})
            .then((cashData) => {

                res.json({
                    message: "Cash Balances Successfully Get",
                    status: true,
                    data: cashData
                })

            }

            ).catch((error) => {
                res.json({
                    message: "Internal Server Error",
                    status: false,
                    error: error
                })

            })


    },

    getDay: async (req, res) => {

        cashModel.find({})
            .then((cashData) => {

                let todayCash = cashData && cashData?.length > 0 && cashData?.filter((e, i) => {

                    let date = new Date(e?.date)


                    let cashDay = date?.getDate()
                    let cashmonth = date?.getMonth()
                    let cashyear = date?.getFullYear()

                    let currentDate = new Date()
                    let currentDay = currentDate?.getDate()
                    let month = currentDate?.getMonth()
                    let year = currentDate?.getFullYear()


                    if (cashDay == currentDay && cashmonth == month && cashyear == year) {
                        return e
                    }

                })


                res.json({
                    message: "Cash Balances Successfully Get",
                    status: true,
                    data: todayCash && todayCash.length > 0 ? todayCash : []
                })
            }

            ).catch((error) => {
                res.json({
                    message: "Internal Server Error",
                    status: false,
                    error: error
                })

            })


    }
}


module.exports = CashController