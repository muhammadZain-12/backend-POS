const MakeModel = require("./makeSchema")



const makeController = {

    addMake: async (req, res) => {

        let { make } = req.body

        console.log(make, "make")

        if (!make) {

            res.json({
                message: "Product make is missing",
                status: false
            })
            return
        }

        MakeModel.create({ make: make }).then((data) => {

            if (!data) {

                res.json({
                    message: "There is a server error in adding product make",
                    status: false
                })

                return
            }

            res.json({
                message: "Make successfully added",
                status: true,
                data: data
            })


        }).catch((error) => {
            res.json({
                message: error.message,
                status: "false",
                error: error
            })

        })

    },
    getMake: async (req, res) => {



        MakeModel.find({}).then((data) => {

            if (data && data.length == 0) {
                res.json({
                    message: "No Data available",
                    status: true,
                    data: []
                })
            }

            res.json({
                message: "Make Successfully Get",
                status: true,
                data: data
            })



        }).catch((error) => {

            res.json({
                message: error.message,
                status: false,
                error: error
            })

        })



    },
    addModel: async (req, res) => {

        const { make, model } = req.body;

        if (!make || !model) {
            res.json({
                message: "Make or model is missing",
                status: false
            });
            return;
        }

        try {
            // Find the department by name
            const selectedMake = await MakeModel.findOne({ make });

            if (!selectedMake) {
                res.json({
                    message: "Make not found",
                    status: false
                });
                return;
            }

            // Add the category to the department
            selectedMake.model.push({model});

            // Save the updated department
            const updatedMake = await selectedMake.save();

            res.json({
                message: "Model successfully added to the make",
                status: true,
                data: updatedMake
            });

        } catch (error) {
            res.json({
                message: error.message,
                status: false,
                error: error
            });
        }
    },

}


module.exports = makeController