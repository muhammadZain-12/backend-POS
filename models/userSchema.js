const mongoose = require("mongoose")



const userSchema = mongoose.Schema({

    full_name : String,
    email_address : String,
    country_code : String,
    country : String,
    phone_number : Number,
    calling_code : Number

})

const userModel = mongoose.model("user",userSchema)

module.exports = userModel











