const CustomerLedgerModel = require("../models/customerLedgerSchema");
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
        customerLedger: data?.customerLedger,
        deliveryCity: data.delivery_city,
        deliveryPostalCode: data?.delivery_postal_code
    };
}



const CustomerController = {
    post: (req, res) => {

        let data = req.body


        let { customerName, businessName, accountNo, email, mobileNumber, creditLimits, creditDays } = data

        if (!customerName || !businessName || !accountNo || !mobileNumber || !creditLimits || !creditDays) {
            res.json({
                message: "Required Fields are missing",
                status: false
            })
            return
        }


        let dataToSend = {

            customer_name: data.customerName,
            business_name: data.businessName,
            accountNo: data.accountNo,
            created_at: data.created_at,
            address: data.address,
            city: data.city,
            email: data.email,
            postal_code: data.postalCode,
            telephone_no: data.telephoneNo,
            telephone_no2: data.telephoneNo2,
            mobile_number: data.mobileNumber,
            account_manager: data.accountManager,
            order_location: data.orderLocation,
            credit_limits: data.creditLimits,
            credit_days: data.creditDays,
            credit_balance: data?.creditBalance ? data?.creditBalance : 0,
            quotation_balance: data?.quotationBalance ? data?.quotationBalance : 0,
            discount: data.discount,
            price_level: data.priceLevel,
        }

        CustomerModel.create(dataToSend).then(async (data) => {

            if (!data) {
                res.json({
                    message: 'Internal Server Error',
                    status: false,
                })
                return
            }

            if (data) {



                let customerLedger = {

                    date: new Date(),
                    customerId: data?._id,
                    openingquotationBalance: data?.quotation_balance ? Number(data?.quotation_balance) : 0,
                    openinginvoiceBalance: data?.credit_balance ? Number(data?.credit_balance) : 0,
                    toPay: Number(Number(data?.quotation_balance || 0) + Number(data?.credit_balance || 0)).toFixed(2),
                    transactionType: "Opening Balance"
                }

                await CustomerLedgerModel.create(customerLedger)

                let convertedArray = [data].map(convertToObject);


                res.json({
                    message: 'Customer created successfully',
                    status: true,
                    data: convertedArray[0],
                })
                return
            }

        }).catch((error) => {

            console.log(error, "error")

            res.json({
                message: 'Internal Server Error',
                status: false,
                error: error,
            })
        })
    },

    get: (req, res) => {

        CustomerModel.find({}).then((data) => {


            console.log(data, "dataaaa")

            if (!data) {
                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }

            if (data && data.length == 0) {

                res.json({
                    message: "No Customer Found",
                    status: false
                })
                return
            }

            if (data && data.length > 0) {

                let convertedArray = data.map(convertToObject);

                console.log(convertedArray, "ARRAY")

                res.json({

                    message: "Customers Successfully Get",
                    status: true,
                    data: convertedArray

                })
                return
            }

        }).catch((error) => {

            console.log(error, "error")

            res.json({
                message: "Internal Server Error",
                error: error,
                status: false
            })

        })

    },

    put: (req, res) => {

        let data = req.body


        let dataToSend = {

            customer_name: data.customerName,
            business_name: data?.businessName,
            accountNo: data?.accountNo,
            created_at: data.created_at,
            address: data.address,
            city: data.city,
            _id: data.id,
            email: data.email,
            postal_code: data.postalCode,
            telephone_no: data.telephoneNo,
            telephone_no2: data.telephoneNo2,
            comment: data.comment,
            mobile_number: data.mobileNumber,
            account_manager: data.accountManager,
            order_location: data.orderLocation,
            credit_limits: data.creditLimits,
            credit_days: data.creditDays,
            discount: data.discount,
            delivery_address: data.deliveryAddress,
            delivery_city: data.deliveryCity,
            delivery_postal_code: data.deliveryPostalCode,
            price_level: data.priceLevel,
        }

        CustomerModel.findByIdAndUpdate(dataToSend._id, dataToSend, { new: true }).then(updatedDocument => {






            if (!updatedDocument) {
                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return
            }


            let convertedArray = [updatedDocument].map(convertToObject);

            res.json({
                message: "Customer Account has been successfully updated",
                status: true,
                data: convertedArray[0]
            })


        }).catch((error) => {

            res.json({
                message: error.message,
                status: false,
                error: error
            })

        })



    },

    delete: (req, res) => {


        const customerId = req.params.id;


        CustomerModel.findByIdAndDelete(customerId).then((data) => {


            if (!data) {

                res.json({
                    message: "Internal Server Error",
                    status: false
                })
                return

            }

            let convertedArray = [data].map(convertToObject);


            res.json({
                message: "Customer has been successfully deleted",
                status: true,
                data: convertedArray[0]
            })

        }).catch((error) => {

            res.json({
                message: error.message,
                status: false,
                error: error
            })

        })






    },

    refundBalance: async (req, res) => {


        let { amount, type, paymentMethod, transactionId, referenceId, customerDetails } = req.body

        let customerLedger = {

            date: new Date(),
            customerId: customerDetails?.id,
            paymentMethod: paymentMethod,
            referenceId: referenceId,
            transactionId: transactionId,
            refund: amount,
            transactionType: type.toLowerCase() == "invoice" ? "Refund on invoice" : "Refund on quotation"
        }

        try {

            let customer = await CustomerModel.findById(customerDetails?.id)

            if (type.toLowerCase() == "quotation") {

                customer.quotation_balance -= Number(amount)

            } else {
                customer.credit_balance -= Number(amount)
            }

            // customer.customerLedger.push(customerLedger)

            customer.save()


            await CustomerLedgerModel.create(customerLedger)


            let convertedArray = [customer].map(convertToObject)


            customerLedger.runningBalance = Number(customer?.credit_balance || 0) + Number(customer?.quotation_balance || 0)

            console.log(customer, "customer", customer?.credit_balance, "blance")

            console.log(customerLedger?.runningBalance, "running")


            res.json({
                message: "Amount Successfully Refund",
                status: true,
                data: convertedArray[0],
                customerLedger: customerLedger
            })

        } catch (error) {

            res.json({
                message: "Internal Server Error",
                status: false,
                error: error?.message
            })


        }







    },


    updateCheque: async (req, res) => {


        let { selectedCustomer, ledger, selectedLedger } = req.body


        let customer = await CustomerModel.findById(selectedCustomer?.id)



        try {

            let totalAmount = selectedLedger.toPay

            if (selectedLedger?.transactionType?.toLowerCase() == "invoice") {

                customer.credit_balance -= totalAmount


            } else {
                customer.quotation_balance -= totalAmount
            }



            let customerLedger = {

                date: new Date(),
                customerId: selectedCustomer?.id,
                paymentMethod: "Cheque Cleared",
                cheque_no: selectedLedger?.cheque_no,
                bank_name: selectedLedger?.bank_name,
                clear_date: selectedLedger?.clear_date,
                refund: selectedLedger?.toPay,
                transactionType: selectedLedger?.transactionType,
                invoiceRef: selectedLedger?.invoiceNumber
            }


            await CustomerLedgerModel.create(customerLedger)

            // customer.customerLedger.push(customerLedger)
            customer.save()

            customerLedger.runningBalance = Number(customer?.credit_balance || 0) + Number(customer?.quotation_balance || 0)

            let convertedArray = [customer].map(convertToObject)

            res.json({
                message: "Cheque status has been successfully updated",
                status: true,
                data: convertedArray[0],
                customerLedger: customerLedger
            })


        } catch (error) {

            res.json({
                message: "Internal Server Error",
                status: false,
                error: error?.message
            })

        }

    }


}

module.exports = CustomerController