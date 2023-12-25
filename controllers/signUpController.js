const userModel = require('../models/userSchema')
const bcrypt = require("bcrypt")

function isValidEmail(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

let SignupController = {
  post: async (req, res) => {
    let {
      fullName,
      employeeId,
      emailAddress,
      password,
      confirmPassword,
    } = req.body

    if (
      !fullName ||
      !employeeId ||
      !emailAddress ||
      !password ||
      !confirmPassword
    ) {
      res.json({
        message: 'Required Fields are missing',
        status: false,
      })
      return
    }

    if (!isValidEmail(emailAddress)) {
      res.json({
        message: 'Email address is not valid',
        status: false,
      })
      return
    }

    if (password?.length < 8) {

      res.json({
        message: 'Password length must be greater then 8',
        status: false,
      })
      return
    }

    if (confirmPassword !== password) {

      res.json({
        message: 'confirm password does not match',
        status: false,
      })
      return
    }

    let objToSend = {
      full_name: fullName,
      employee_id: employeeId,
      email_address: emailAddress,
      password: password,
      confirm_password: confirmPassword,
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await userModel.findOne({ email_address: emailAddress });
      console.log(existingUser, "existing")

      if (existingUser) {
        return res.json({ success: false, message: 'Email is already in use.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }

    try {
      // Check if the email already exists in the database
      const existingUser = await userModel.findOne({ employee_id: employeeId });
      console.log(existingUser, "existing")

      if (existingUser) {
        return res.json({ success: false, message: 'Employee Id is already in use.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }




    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        res.json({
          message: "Error in hashing password",
          status: false
        })
        return

      } else {
        console.log('Hashed Password:', hash);

        objToSend.password = hash
        objToSend.confirm_password = hash

        userModel
          .create(objToSend)
          .then((data) => {
            if (!data) {
              res.json({
                message: 'Internal Server Error',
                status: false,
              })
              return
            }
            if (data) {
              res.json({
                message: 'User registered successfully',
                status: true,
                data: data,
              })
            }
          })
          .catch((error) => {
            res.json({
              message: 'Internal Server Error',
              status: false,
              error: error,
            })
          })


      }
    });






    // let {
    //   fullName,
    //   emailAddress,
    //   countryCode,
    //   country,
    //   phoneNumber,
    //   callingCode,
    // } = req.body

    // if (
    //   !fullName ||
    //   !emailAddress ||
    //   !countryCode ||
    //   !country ||
    //   !phoneNumber ||
    //   !callingCode
    // ) {
    //   res.json({
    //     message: 'Required Fields are missing',
    //     status: false,
    //   })
    //   return
    // }

    //     userModel
    //       .findOne({emailAddress})
    //       .then((data) => {
    //         if (data) {
    //         console.log(data,"dataaa")
    //             res.json({
    //             message: 'This email address is already in used',
    //             status: false,
    //           })
    //           return
    //         }
    //         if (!data) {
    //             console.log(data,"dataa")
    //           let objToSend = {
    //             full_name: fullName,
    //             email_address: emailAddress,
    //             country_code: countryCode,
    //             calling_code: callingCode,
    //             country,
    //             phone_number: phoneNumber,
    //           }

    //           userModel
    //             .create(objToSend)
    //             .then((data) => {
    //               if (!data) {
    //                 res.json({
    //                   message: 'Sign up unsuccessfull',
    //                   status: false,
    //                 })
    //               } else {
    //                 res.json({
    //                   message: 'User Signup Successfully',
    //                   status: true,
    //                   data: data,
    //                 })
    //               }
    //             })
    //             .catch((error) => {
    //               if (error) {
    //                 res.json({
    //                   message: 'Internal Server Error',
    //                   status: false,
    //                   error: err,
    //                 })
    //                 return
    //               }
    //             })
    //         }
    //       })
    //       .catch((error) => {

    //         res.json({
    //             message : "Internal Server Error",
    //             status : false
    //         })

    //       })
  },
}

module.exports = SignupController
