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
const DepartmentController = require("../controllers/departmentController")
const DamageProductController = require("../controllers/damageProductController")
const exchangeController = require("../controllers/exchangeController")
const CashController = require("../controllers/cashController")
const EmployeeController = require("../controllers/EmployeeController")
const PurchaseOrderController = require("../controllers/purchaseOrderController")
const makeController = require("../models/makeController")
const CustomerLedgerController = require("../controllers/customerLedgerController")


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

    console.log(data, "dataa")

    if (data?.role == "Manager" || data?.role == "admin") {

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
router.put("/api/RestockProduct", authenticateMiddleware, checkRole, AddProductController.put)




router.post("/api/addMultipleProducts", authenticateMiddleware, checkRole, AddMultipleProductsController.post)
router.get("/api/getProducts", authenticateMiddleware, AddProductController.get)
router.delete("/api/deleteproducts", authenticateMiddleware, checkRole, AddProductController.delete)
router.put("/api/changeProductStatus", authenticateMiddleware, checkRole, AddProductController.changeStatus)



router.post("/api/uploadProductImage", authenticateMiddleware, checkRole, productImages.single('productImages'), UploadProductImageController.post)
router.post("/api/createCustomer", authenticateMiddleware, CustomerController.post)
router.get("/api/getCustomers", authenticateMiddleware, CustomerController.get)
router.put("/api/updateCustomer", authenticateMiddleware, checkRole, CustomerController.put)
router.delete("/api/deleteCustomer/:id", authenticateMiddleware, checkRole, CustomerController.delete)
router.post("/api/sendEmailToCustomer", authenticateMiddleware, EmailController.post)
router.post("/api/createInvoice", authenticateMiddleware, InvoiceController.post)
router.post("/api/pdfSendToCustomer", authenticateMiddleware, EmailController.sendPdf)


router.get("/api/getInvoices/:id", authenticateMiddleware, InvoiceController.get)
router.get("/api/getDayAllInvoices", authenticateMiddleware, InvoiceController.getDayAll)
router.get("/api/getAllInvoices", authenticateMiddleware, InvoiceController.getAll)
router.get("/api/getVat", authenticateMiddleware, vatController.get)
router.put("/api/changeVat", authenticateMiddleware, vatController.put)

router.post("/api/AddDemandedProduct", authenticateMiddleware, DemandedProductController.post)
router.get("/api/getDemandedProduct", authenticateMiddleware, DemandedProductController.get)
router.delete("/api/deleteDemandedProducts", authenticateMiddleware, DemandedProductController.delete)



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
router.post("/api/addTrashProductsInDamages", authenticateMiddleware, checkRole, TrashProductController.addTrashProductInDamage)
router.post("/api/addTrashProductsInInventory", authenticateMiddleware, checkRole, TrashProductController.addTrashProductInInventory)



router.get("/api/getDamageProducts", authenticateMiddleware, checkRole, DamageProductController.get)
router.post("/api/addDamageProducts", authenticateMiddleware, checkRole, DamageProductController.addProduct)
router.post("/api/addDamageProductsInInventory", authenticateMiddleware, checkRole, DamageProductController.addDamageProductInInventory)
router.post("/api/addDamageProductsInTrash", authenticateMiddleware, checkRole, DamageProductController.addDamageProductInTrash)



router.post("/api/addProductDepartment", authenticateMiddleware, checkRole, DepartmentController.addDepartment)
router.get("/api/getProductDepartment", authenticateMiddleware, checkRole, DepartmentController.getDepartment)
router.post("/api/addProductCategory", DepartmentController.addCategory)
router.post("/api/addProductSubcategory", authenticateMiddleware, checkRole, DepartmentController.addSubcategory)
router.post("/api/addProductMake", authenticateMiddleware, checkRole, makeController.addMake)
router.get("/api/getProductMake", authenticateMiddleware, checkRole, makeController.getMake)
router.post("/api/addProductModel", authenticateMiddleware, checkRole, makeController.addModel)


router.post("/api/createExchangeInvoice", authenticateMiddleware, exchangeController.post)
router.get("/api/getExchangeInvoices/:id", authenticateMiddleware, exchangeController.get)
router.get("/api/getDayAllExchangeInvoices", authenticateMiddleware, exchangeController.getDayAll)
router.get("/api/getAllExchangeInvoices", authenticateMiddleware, exchangeController.getAll)



router.get("/api/getCashBalance", authenticateMiddleware, CashController.getAll)
router.get("/api/getDayCashBalance", authenticateMiddleware, CashController.getDay)



router.get("/api/getAllEmployees", authenticateMiddleware, checkRole, EmployeeController.get)
router.delete("/api/deleteEmployee/:id", authenticateMiddleware, checkRole, EmployeeController.delete)
router.put("/api/changeEmployeeStatus", authenticateMiddleware, checkRole, EmployeeController.changeStatus)
router.put("/api/changeEmployeeShowPriceStatus", authenticateMiddleware, checkRole, EmployeeController.changePriceShowStatus)
router.put("/api/changeEmployeeRole", authenticateMiddleware, checkRole, EmployeeController.changeRole)


router.get("/api/getAllPurchaseOrders", authenticateMiddleware, checkRole, PurchaseOrderController.get)
router.post("/api/createPurchaseOrder", authenticateMiddleware, checkRole, PurchaseOrderController.post)
router.put("/api/updateArriveQtyInPurchaseOrder", authenticateMiddleware, checkRole, PurchaseOrderController.updateQtyArrived)
router.put("/api/updateLeftQtyInPurchaseOrder", authenticateMiddleware, checkRole, PurchaseOrderController.updateQtyLeft)
router.put("/api/editPO", authenticateMiddleware, checkRole, PurchaseOrderController.editPO)



router.delete("/api/deleteSupplier/:id", authenticateMiddleware, checkRole, SupplierController.delete)
router.put("/api/editSupplier", authenticateMiddleware, checkRole, SupplierController.put)
router.put("/api/payToSupplier", authenticateMiddleware, checkRole, SupplierController.payAmount)


router.put("/api/updateChequeStatus", authenticateMiddleware, checkRole, CustomerController.updateCheque)

router.put("/api/refundBalance", authenticateMiddleware, checkRole, CustomerController.refundBalance)


router.get("/api/getCustomerLedger/:id",CustomerLedgerController.getCustomerLedger)





module.exports = router