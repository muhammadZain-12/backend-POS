const userModel = require('../models/userSchema')
require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

function generateOTP() {
  let otp = ''
  const digits = '0123456789'

  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }

  return otp
}

let LoginVerificationController = {
  post: (req, res) => {
    let { callingCode, phoneNumber } = req.body

    console.log(req.body, 'body')

    userModel
      .findOne({ phone_number: phoneNumber })
      .then((data) => {
        if (!data) {
          res.json({
            message: "Phone number doesn't exists",
            status: false,
          })
          return
        }
        if (data) {
          
          if (data.calling_code !== callingCode) {
            res.json({
              message: "Phone number doesn't exists",
              status: false,
            })
            return
          }

          let otpCode = generateOTP()

          let objToSend = {
            id : data._id,
            callingCode : data.calling_code,
            country : data.country,
            countryCode : data.country_code,
            emailAddress: data.email_address,
            fullName : data.full_name,
            phoneNumber : data.phone_number,
            otpCode : otpCode,
            status : "login"
           }

          client.messages
            .create({
              body: `Your OTP code is ${otpCode}`,
              from: '+15673991679', // your Twilio phone number
              to: `+${callingCode}${phoneNumber}`, // user's phone number
            })
            .then((message) => {
              

              res.json({
                message: 'Otp Successfully sent',
                status: true,
                data: objToSend,
              })
            })
            .catch((error) => {
              res.json({
                message: 'Otp unsuccessfull',
                status: false,
                error: error,
              })
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
  },
}

module.exports = LoginVerificationController
