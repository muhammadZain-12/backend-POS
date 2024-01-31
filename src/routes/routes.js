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
const ClaimInvoiceController = require("../controllers/claimInvoiceController")
const SupplierController = require("../controllers/supplierController")
const ArrangeProductController = require("../controllers/arrangeProductController")
const TrashProductController = require("../controllers/trashProductController")


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
router.delete("/api/deleteproducts", authenticateMiddleware, checkRole, AddProductController.delete)
router.put("/api/changeProductStatus", authenticateMiddleware, checkRole, AddProductController.changeStatus)



router.post("/api/uploadProductImage", authenticateMiddleware, checkRole, productImages.single('productImages'), UploadProductImageController.post)
router.post("/api/createCustomer", authenticateMiddleware, CustomerController.post)
router.get("/api/getCustomers", authenticateMiddleware, CustomerController.get)
router.put("/api/updateCustomer", authenticateMiddleware, checkRole, CustomerController.put)
router.delete("/api/deleteCustomer/:id", authenticateMiddleware, checkRole, CustomerController.delete)
router.post("/api/sendEmailToCustomer", authenticateMiddleware, EmailController.post)
router.post("/api/createInvoice", authenticateMiddleware, InvoiceController.post)
router.get("/api/getInvoices/:id", authenticateMiddleware, InvoiceController.get)
router.get("/api/getDayAllInvoices", authenticateMiddleware, InvoiceController.getDayAll)
router.get("/api/getAllInvoices", authenticateMiddleware, InvoiceController.getAll)
router.get("/api/getVat", authenticateMiddleware, vatController.get)
router.put("/api/changeVat", authenticateMiddleware, vatController.put)
router.post("/api/AddDemandedProduct", authenticateMiddleware, DemandedProductController.post)
router.post("/api/SaleReturnDamage", authenticateMiddleware, SaleReturnController.post)
router.get("/api/getReturnInvoices/:id", authenticateMiddleware, SaleReturnController.getEmployeeDayInvoices)
router.get("/api/getDayAllReturnInvoices", authenticateMiddleware, SaleReturnController.getDayAllInvoices)
router.get("/api/getAllReturnInvoices", authenticateMiddleware, SaleReturnController.getAllInvoices)
router.post("/api/createClaimInvoice", authenticateMiddleware, ClaimInvoiceController.post)
router.post("/api/addWarrantyProduct", authenticateMiddleware, ClaimInvoiceController.addWarrantyProducts)


router.get("/api/getClaimInvoices/:id", authenticateMiddleware, ClaimInvoiceController.getEmployeeDayClaimInvoices)
router.get("/api/getDayAllClaimInvoices", authenticateMiddleware, ClaimInvoiceController.getDayAllClaimInvoices)
router.get("/api/getAllClaimInvoices", authenticateMiddleware, ClaimInvoiceController.getAllClaimInvoices)



router.get("/api/getWarrantyInvoices/:id", authenticateMiddleware, ClaimInvoiceController.getEmployeeDayWarrantyInvoices)
router.get("/api/getDayAllWarrantyInvoices", authenticateMiddleware, ClaimInvoiceController.getDayAllWarrantyInvoices)
router.get("/api/getAllWarrantyInvoices", authenticateMiddleware, ClaimInvoiceController.getAllWarrantyInvoices)

router.post("/api/addSupplier", authenticateMiddleware, SupplierController.post)

router.get("/api/getSuppliers", authenticateMiddleware, SupplierController.get)

router.post("/api/addArrangeProduct", authenticateMiddleware, ArrangeProductController.post)


router.get("/api/getTrashProducts", authenticateMiddleware, checkRole, TrashProductController.get)



module.exports = router