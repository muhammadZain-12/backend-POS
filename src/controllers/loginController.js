require('dotenv').config()
const userModel = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")


const secretKey = process.env.SECRET_KEY

let LoginController = {
  post: async (req, res) => {
    let { employeeId, password } = req.body

    if (!employeeId || !password) {
      res.json({
        message: 'Required Fields are missing',
        status: false,
      })
      return
    }

    if (password?.length < 8) {

      res.json({
        message: 'Invalid Password',
        status: false,
      })
      return
    }

    try {
      // Check if the email already exists in the database
      const findUser = await userModel.findOne({ employee_id: employeeId });
      console.log(findUser, "existing")

      if (!findUser) {
        return res.json({ success: false, message: 'Employee Id is not valid' });
      }
      else {

        let pass = findUser.password

        bcrypt.compare(password, pass, async (err, result) => {
          if (err) {
            res.json({
              message: "hash password decrypt unsuccessfull",
              status: false

            }

            )
            return
          }
          else {
            if (result) {
              // Allow access to the user

              let time = Date.now()

              const payload = {

                id: findUser._id,
                employeeId: findUser?.employee_id,
                emailAddress: findUser?.email_address,
                fullName: findUser?.full_name,
                password: findUser?.password,
                confirmPassword: findUser.confirm_password,
                role: findUser?.role,
                show_price:findUser?.show_price,
                time: time,

              }

              const token = await jwt.sign(payload, secretKey)

              let data = {
                id: findUser._id,
                employeeId: findUser?.employee_id,
                emailAddress: findUser?.email_address,
                fullName: findUser?.full_name,
                time: Date.now(),
                role : findUser?.role,
                show_price : findUser?.show_price
              }

              data.token = token

              res.json({
                message: 'User login successfully',
                status: true,
                data: data,
              })

            }
            else {

              res.json({
                message: "Incorrect Password",
                status: false
              })
              return
            }
          }
        });


      }
    }

    catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}

module.exports = LoginController
