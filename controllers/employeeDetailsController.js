require('dotenv').config()
const userModel = require('../models/userSchema')




let EmployeeDetailsController = {
    get: (req, res) => {

        console.log(req,"req")

        console.log(req.user, "reqqquest")

        res.json({
            message: "User Details Successfully Get",
            data: req.user,
            status: true
        })

    }
}

module.exports = EmployeeDetailsController