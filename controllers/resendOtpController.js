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

let ResendOtpController = {
  post: (req, res) => {

    let {phoneNumber,callingCode} = req.body

    let otpCode = generateOTP()

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
          data: otpCode,
        })
      })
      .catch((error) => {
        res.json({
          message: 'Otp unsuccessfull',
          status: false,
          error: error,
        })
      })
  },
}

module.exports = ResendOtpController
