require('dotenv').config()
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)
const userModel = require('../models/userSchema')

function generateOTP() {
  let otp = ''
  const digits = '0123456789'

  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }

  return otp
}

let SignupVerificationController = {
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

    userModel
      .findOne({ email_address: emailAddress })
      .then((data) => {
        if (data) {
          res.json({
            message: 'Email address already exists',
            status: false,
          })
          return
        }
        if (!data) {
          userModel.findOne({ phone_number: phoneNumber }).then((data) => {
            if (data) {
              if (data.calling_code == callingCode) {
                res.json({
                  message: 'phone number already exists',
                  status: false,
                })
              } else {
                let otpCode = generateOTP()
                console.log(otpCode, 'code')
                client.messages
                  .create({
                    body: `Your OTP code is ${otpCode}`,
                    from: '+15673991679', // your Twilio phone number
                    to: `+${callingCode}${phoneNumber}`, // user's phone number
                  })
                  .then((message) => {
                    let data = { ...req.body }
                    data.otpCode = otpCode

                    res.json({
                      message: 'Otp Successfully sent',
                      status: true,
                      data: data,
                    })
                  })
                  .catch((error) => {
                    res.json({
                      message: 'Otp unsuccessfull ',
                      status: false,
                      error: error,
                    })
                  })
              }
            }
            if (!data) {
              let otpCode = generateOTP()
              console.log(otpCode, 'otpcode')
              client.messages
                .create({
                  body: `Your OTP code is ${otpCode}`,
                  from: '+15673991679', // your Twilio phone number
                  to: `+${callingCode}${phoneNumber}`, // user's phone number
                })
                .then((message) => {
                  let data = { ...req.body }
                  data.otpCode = otpCode

                  res.json({
                    message: 'Otp Successfully sent',
                    status: true,
                    data: data,
                  })
                })
                .catch((error) => {
                  res.json({
                    message: 'Otp sending unsuccessfull',
                    status: false,
                    error: error,
                  })
                })
            }
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

module.exports = SignupVerificationController
