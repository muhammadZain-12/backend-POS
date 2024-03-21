const DepartmentModel = require("../models/productDepartmentModal")




const DepartmentController = {

    addDepartment: async (req, res) => {

        let { departmentName } = req.body

        console.log(departmentName, "department")

        if (!departmentName) {

            res.json({
                message: "Department name is missing",
                status: false
            })
            return
        }

        DepartmentModel.create({ departmentName: departmentName }).then((data) => {

            console.log(data, "dataaaa")

            if (!data) {

                res.json({
                    message: "There is a server error in adding product department",
                    status: "false"
                })

                return
            }

            res.json({
                message: "Deparment successfully added",
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

    getDepartment: async (req, res) => {



        DepartmentModel.find({}).then((data) => {

            if (data && data.length == 0) {
                res.json({
                    message: "No Data available",
                    status: true,
                    data: []
                })
            }

            res.json({
                message: "Department Successfully Get",
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
    addCategory: async (req, res) => {

        const { departmentName, categoryName, categoryPer } = req.body;

        console.log(departmentName, categoryName, "department and category");

        if (!departmentName || !categoryName) {
            res.json({
                message: "Department name or category name is missing",
                status: false
            });
            return;
        }


        try {
            // Find the department by name
            const department = await DepartmentModel.findOne({ departmentName });

            if (!department) {
                res.json({
                    message: "Department not found",
                    status: false
                });
                return;
            }

            // Add the category to the department
            department.categories.push({
                categoryName,
                categoryPer: {
                    a: Number(categoryPer.a),
                    b: Number(categoryPer.b),
                    c: Number(categoryPer.c)
                }
            });

            // Save the updated department
            const updatedDepartment = await department.save();

            res.json({
                message: "Category successfully added to the department",
                status: true,
                data: updatedDepartment
            });

        } catch (error) {
            res.json({
                message: error.message,
                status: false,
                error: error
            });
        }
    },
    addSubcategory: async (req, res) => {
        const { departmentName, categoryName, subcategoryName } = req.body;

        console.log(departmentName, categoryName, subcategoryName, "department, category, and subcategory");

        if (!departmentName || !categoryName || !subcategoryName) {
            res.json({
                message: "Department name, category name, or subcategory name is missing",
                status: false
            });
            return;
        }

        try {
            // Find the department by name
            const department = await DepartmentModel.findOne({ departmentName });

            if (!department) {
                res.json({
                    message: "Department not found",
                    status: false
                });
                return;
            }

            // Find the category by name within the department
            const category = department.categories.find((c) => c.categoryName === categoryName);

            if (!category) {
                res.json({
                    message: "Category not found within the department",
                    status: false
                });
                return;
            }

            // Add the subcategory to the category
            category.subcategories.push({ subcategoryName });

            // Save the updated department
            const updatedDepartment = await department.save();

            res.json({
                message: "Subcategory successfully added to the category",
                status: true,
                data: updatedDepartment
            });

        } catch (error) {
            res.json({
                message: error.message,
                status: false,
                error: error
            });
        }
    },
    editDepartment: async (req, res) => {

        let { editedName, department } = req.body

        if (!editedName || !department) {
            res.json({
                message: "Required Fields are missing",
                status: false
            })
            return
        }

        let newDepartment = { ...department }

        newDepartment.departmentName = editedName


        DepartmentModel.findByIdAndUpdate(department?._id, newDepartment).then((data) => {

            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            res.json({
                message: "Department Successfully Edited",
                status: true,
                data: newDepartment
            })

        }).catch((error) => {

            res.json({
                message: "Internal Server Error",
                status: false,
                data: error?.message
            })

        })



    },
    editCategory: async (req, res) => {

        let departmentToEdit = req.body

        DepartmentModel.findByIdAndUpdate(departmentToEdit?._id, departmentToEdit).then((data) => {

            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            res.json({
                message: "Category Successfully Edited",
                status: true,
                data: departmentToEdit
            })

        }).catch((error) => {

            res.json({
                message: "Internal Server Error",
                status: false,
                data: error?.message
            })

        })



    }


}


module.exports = DepartmentController
