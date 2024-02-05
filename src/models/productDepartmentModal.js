const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  subcategoryName: {
    type: String,
    required: true
  }
});

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true
  },
  subcategories: [subcategorySchema]
});

const departmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true
  },
  categories: [categorySchema]
});

const DepartmentModel = mongoose.model('Department', departmentSchema);

module.exports = DepartmentModel;


