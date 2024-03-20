const CustomerLedgerModel = require("../models/customerLedgerSchema")
const CustomerModel = require("../models/customerSchema")




function convertToObject(data) {

    let date;

    if (data?.created_at) {
        date = data.created_at

        const day = date.getDate(); // 15
        const month = date.getMonth() + 1; // Months are zero-based, so January is 0
        const year = date.getFullYear(); // 2024


        date = `${day}/${month}/${year}`
    }
    return {
        customerName: data.customer_name,
        businessName: data?.business_name,
        accountNo: data?.accountNo,
        id: data._id,
        created_at: date,
        address: data.address,
        city: data.city,
        email: data.email,
        postalCode: data.postal_code,
        telephoneNo: data.telephone_no,
        telephoneNo2: data.telephone_no2,
        comment: data.comment,
        mobileNumber: data.mobile_number,
        accountManager: data.account_manager,
        orderLocation: data.order_location,
        creditLimits: data.credit_limits,
        creditDays: data.credit_days,
        discount: data.discount,
        priceLevel: data.price_level,
        deliveryAddress: data.delivery_address,
        creditBalance: data?.credit_balance,
        quotationBalance: data?.quotation_balance,
        deliveryCity: data.delivery_city,
        deliveryPostalCode: data?.delivery_postal_code
    };
}




const CustomerLedgerController = {

    getCustomerLedger: async (req, res) => {


        console.log(req.params, "params")

        let id = req?.params?.id


        CustomerLedgerModel.find({ customerId: id }).then((data) => {


                CustomerModel.findById(id).then((customer)=>{

                    if(!customer){
                        res.json({
                            message : "Internal Server Error",
                            status : false
                        })
                        return
                    }

                    let convertedArray = [customer].map(convertToObject);


            res.json({
                message: data && data.length > 0 ? "Successfull Found Data" : "No Data Found",
                status: true,
                data: data,
                customerData : convertedArray[0]
            })



                })



        }).catch((error) => {
            res.json({
                message: "Internal Server Error",
                status: false,
                error: error?.message
            })





        })




    }


}


module.exports = CustomerLedgerController