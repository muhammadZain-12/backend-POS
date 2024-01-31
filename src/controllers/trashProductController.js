const trashProductModel = require("../models/TrashProductSchema")




const TrashProductController = {

    get: async (req, res) => {

        trashProductModel.find({}).then((data) => {

            if (data && data.length == 0) {

                res.json({
                    message: "No Trash Products",
                    status: true,
                    data: data
                })

            }
            else if (data && data.length > 0) {

                res.json({
                    message: "Trash Products Successfully get",
                    status: true,
                    data: data
                })

            }

        }).catch((err) => {

            res.json({
                message: "Internal Server Error",
                status: false
            })

        })


    }

}


module.exports = TrashProductController