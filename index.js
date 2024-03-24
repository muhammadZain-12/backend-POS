const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = require('./src/routes/routes')
const bodyParser = require("body-parser")
const path = require("path")

require('dotenv').config()

let app = express()

app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(router)

app.use('/src/products', express.static(path.join(__dirname, 'src/products')));

let PORT = process.env.PORT || 6000
const Base_Uri = process.env.MONGO_URL

app.listen(PORT, () => console.log(`App running on localhost:${PORT}`))

mongoose.connect(Base_Uri).then((success) => {
    console.log("MongoDb connected")

}).catch((error) => {
    console.log(error)
})

