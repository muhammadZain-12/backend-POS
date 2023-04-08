const userModel = require('../models/userSchema')

let SignupController = {
  post: (req, res) => {
    let {
      fullName,
      emailAddress,
      countryCode,
      country,
      phoneNumber,
      callingCode,
    } = req.body

    if (
      !fullName ||
      !emailAddress ||
      !countryCode ||
      !country ||
      !phoneNumber ||
      !callingCode
    ) {
      res.json({
        message: 'Required Fields are missing',
        status: false,
      })
      return
    }

    console.log(req.body)

    let objToSend = {
      full_name: fullName,
      email_address: emailAddress,
      country_code: countryCode,
      country,
      phone_number: phoneNumber,
      calling_code: callingCode,
    }

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
