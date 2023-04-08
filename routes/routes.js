const express = require("express")
const jwt = require("jsonwebtoken")
const SignupController = require("../controllers/signUpController")
const SignupVerificationController = require("../controllers/signupVerificationController")
const ResendOtpController = require("../controllers/resendOtpController")
const LoginController = require("../controllers/loginController")
const LoginVerificationController = require("../controllers/LoginVerificationController")
require("dotenv").config()
let router = express.Router()

// let secret_key = process.env.SECRET_KEY

// const verifyToken = (req, res, next) => {
//     // Get the token from the request headers
//     const token = req.headers['authorization'];
//     if (!token) {
//       // Return an error if the token is missing
//       return res.status(401).json({ error: 'Missing token' });
//     }
  
//     try {
//       // Verify the token using the JWT library
//       const decoded = jwt.verify(token, secret_key);
//       // Attach the decoded token to the request object
//       req.user = decoded;
//       // Call the next middleware function
//       next();
//     } catch (error) {
//       // Return an error if the token is invalid or expired
//       return res.status(401).json({ error: 'Invalid token' });
//     }
//   };



router.post("/api/signupVerification",SignupVerificationController.post)
router.post("/api/loginVerification",LoginVerificationController.post)
router.post("/api/signUp",SignupController.post)
router.post("/api/resendOtp",ResendOtpController.post)
router.post("/api/login",LoginController.post)


//// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
// const accountSid = process.env.ACCOUNT_SID;
// const authToken = process.env.AUTH_TOKEN;

// const client = require("twilio")(accountSid, authToken);

// let otpCode  = 123456

// client.messages
//   .create({
//      body: `Your OTP code is ${otpCode}`,
//      from: '+15673991679', // your Twilio phone number
//      to: "+923366667645" // user's phone number
//    })
//   .then(message => console.log(message.sid)).catch((error)=>{
//     console.log(error)
//   });





module.exports  = router