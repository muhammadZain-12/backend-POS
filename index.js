const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = require('./routes/routes')


require('dotenv').config()

let app = express()
app.use(express.json())
app.use(cors())
app.use(router)

let PORT = process.env.PORT || 6000
const Base_Uri = 'mongodb+srv://pancheeapp:DWGII7iq29Y8hlG1@cluster0.uem65fx.mongodb.net/panchee'

mongoose.connect(Base_Uri).then((success)=>{
    console.log("MongoDb connected")
}).catch((error)=>{
    console.log(error)
})

app.listen(PORT, () => console.log(`App running on localhost:${PORT}`))
