const express = require("express")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const SignupController = require("../controllers/signUpController")
const LoginController = require("../controllers/loginController")
const EmployeeDetailsController = require("../controllers/employeeDetailsController")
const AddProductController = require("../controllers/addProductController")
const AddMultipleProductsController = require("../controllers/addMultipleProductsController")
const UploadProductImageController = require("../controllers/uploadProductImageController")
const productImages = require("../utils/productImages")
const CustomerController = require("../controllers/customerController")
const EmailController = require("../controllers/emailController")
const InvoiceController = require("../controllers/invoiceController")
const vatController = require("../controllers/vatController")
const DemandedProductController = require("../controllers/DemandedProductController")
const SaleReturnController = require("../controllers/saleReturnController")


require("dotenv").config()
let router = express.Router()
let secret_key = process.env.SECRET_KEY



const verifyToken = (token, secret) => {



    try {
        const decoded = jwt.verify(token, secret);
        // Check additional conditions if needed (e.g., permissions, token revocation)
        return decoded;
    } catch (error) {
        // Token verification failed
        return null;
    }
};

// Example usage in an Express middleware
const authenticateMiddleware = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const secret = secret_key; // Replace with your actual secret key


    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing token', status: false });
    }

    const decodedToken = verifyToken(token, secret);

    if (!decodedToken) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token', status: false });
    }

    // You can access the decoded token's information in subsequent middleware or routes
    req.user = decodedToken;




    next();
};


const checkRole = (req, res, next) => {

    let data = req.user

    if (data.role == "employee" || data.role == "admin") {

        next()

    } else {

        res.json({
            message: "You are not authorized",
            status: false
        })

    }



}


router.post("/api/signUp", SignupController.post)
router.post("/api/login", LoginController.post)
router.get("/api/getEmployeeDetails", authenticateMiddleware, EmployeeDetailsController.get)
router.post("/api/addProduct", authenticateMiddleware, checkRole, AddProductController.post)
router.post("/api/addMultipleProducts", authenticateMiddleware, checkRole, AddMultipleProductsController.post)
router.get("/api/getProducts", authenticateMiddleware, checkRole, AddProductController.get)
router.post("/api/uploadProductImage", authenticateMiddleware, checkRole, productImages.single('productImages'), UploadProductImageController.post)
router.post("/api/createCustomer", authenticateMiddleware, CustomerController.post)
router.get("/api/getCustomers", authenticateMiddleware, CustomerController.get)
router.put("/api/updateCustomer", authenticateMiddleware, checkRole, CustomerController.put)
router.delete("/api/deleteCustomer/:id", authenticateMiddleware, checkRole, CustomerController.delete)
router.post("/api/sendEmailToCustomer", authenticateMiddleware, checkRole, EmailController.post)
router.post("/api/createInvoice", authenticateMiddleware, InvoiceController.post)
router.get("/api/getInvoices/:id", authenticateMiddleware, InvoiceController.get)
router.get("/api/getDayAllInvoices", authenticateMiddleware, InvoiceController.getDayAll)
router.get("/api/getAllInvoices", authenticateMiddleware, InvoiceController.getAll)
router.get("/api/getVat", authenticateMiddleware, vatController.get)
router.put("/api/changeVat", authenticateMiddleware, vatController.put)
router.post("/api/AddDemandedProduct", authenticateMiddleware, DemandedProductController.post)
router.post("/api/SaleReturnDamage", authenticateMiddleware, SaleReturnController.post)




module.exports = router