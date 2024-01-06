require('dotenv').config()
const userModel = require('../models/userSchema')




let EmployeeDetailsController = {
    get: (req, res) => {

        res.json({
            message: "User Details Successfully Get",
            data: req.user,
            status: true
        })

    }
}

module.exports = EmployeeDetailsController