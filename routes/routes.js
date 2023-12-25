const express = require("express")
const jwt = require("jsonwebtoken")
const SignupController = require("../controllers/signUpController")
const LoginController = require("../controllers/loginController")
const EmployeeDetailsController = require("../controllers/employeeDetailsController")

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

    console.log(token,"token")

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing token',status : false });
    }

    const decodedToken = verifyToken(token, secret);

    if (!decodedToken) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token',status : false });
    }

    // You can access the decoded token's information in subsequent middleware or routes
    req.user = decodedToken;
    next();
};



router.post("/api/signUp", SignupController.post)
router.post("/api/login", LoginController.post)
router.get("/api/getEmployeeDetails", authenticateMiddleware, EmployeeDetailsController.get)





module.exports = router