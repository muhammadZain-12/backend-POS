



const UploadProductImageController = {
    post: (req, res) => {
        let file = req.file

        console.log(file,"filee")

        res.json({
            message: "File has been successfully uploaded",
            status: true,
            data: file
        })

    }
}

module.exports = UploadProductImageController