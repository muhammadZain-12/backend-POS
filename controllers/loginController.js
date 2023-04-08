require('dotenv').config()
const userModel = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const secretKey = process.env.SECRET_KEY

let LoginController = {
  post: (req, res) => {
    let { phoneNumber, callingCode, emailAddress, id } = req.body

    if (!phoneNumber || !callingCode || !emailAddress || !phoneNumber) {
      res.json({
        message: 'Required Fields are missing',
        status: false,
      })
      return
    } else {
      const payload = {
        phoneNumber: `${callingCode}${phoneNumber}`,
        id: id,
        email: emailAddress,
      }

      const token = jwt.sign(payload, secretKey)

      let data = req.body

      data.token = token

      res.json({
        message: 'User login successfully',
        status: true,
        data: data,
      })
    }
    // let {callingCode,phoneNumber} = req.body

    // console.log(req.body,"body")

    // userModel.findOne({phone_number : phoneNumber}).then((data)=>{

    //         if(!data){
    //             res.json({
    //                 message : "Phone number doesn't exists",
    //                 status : false
    //             })
    //             return
    //         }
    //         if(data){

    //             console.log(data,"data")

    //             if(data.calling_code !== callingCode){

    //                 res.json({
    //                     message : "Phone number doesn't exists",
    //                     status : false
    //                 })
    //                 return
    //             }

    // const payload = {phoneNumber : `${data.calling_code}${data.phone_number}`,id:data._id}

    // const token = jwt.sign(payload, secretKey);

    // console.log(token,"token")

    //         }

    // }).catch((error)=>{

    //     res.json({
    //         message : "Internal Server Error",
    //         status : false,
    //         error : error
    //     })

    // })
  },
}

module.exports = LoginController
