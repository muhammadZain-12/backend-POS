const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const emailModel = require("../models/emailsSchema")
// const pdf = require('html-pdf');
const fs = require('fs');
const path = require("path");
const vatModel = require("../models/VATSchema");
const puppeteer = require('puppeteer');



dotenv.config()
let appPassword = process.env.appPassword






const generatePdf = async (printInvoiceData) => {
  return new Promise(async (resolve, reject) => {

    try {
      let vat = await vatModel.find({})

      vat = vat?.[0]


      const barcodeImagePath = path.join(__dirname, `../products/${printInvoiceData?.barcodeImagePath}`);
      const imageSrc = `data:image/jpeg;base64,${fs.readFileSync(barcodeImagePath, { encoding: 'base64' })}`;

      const content = `
        <div
        class="container"
        style="
          width: 900px;
          margin-right: 10px; /* Added margin to the right */
        "
    >


    <table>
        
    <tr style="width:900px;" >
    <td style="width:450px;" >
    ${printInvoiceData?.vatAmount
          ? `
  <div style="width:450px;display:inline;margin-top:0px" >
    <h1>${vat?.companyName}</h1>
    <p>${vat?.companyAddress}
    </p>

    <div>
    <p>Tel: ${vat?.mobileNumber} </br>
    Email: ${vat?.companyEmail}
    </p>
    
  </div>

    ${printInvoiceData?.vatAmount &&
          `<div >
        ${vat?.vatNumber
            ? `<p>Vat Number: ${vat?.vatNumber}
            </br>
            Company Number: ${vat?.companyNumber}
            </p>`
            : ""
          }
        
      </div>`
          }

  </div>


  
  `
          : ""
        }
    
    
    
    </td>
    <td style="width:450px;margin-right:10px" >
    
            
    <div style="text-align: right;width:450px;margin-right:10px;" >
    
    <div>

    <img style="height:35px;" src="${imageSrc}" />
    
        <p style="font-size: 32px; font-weight: bold;margin-top:0px">
            ${(printInvoiceData?.vatAmount && printInvoiceData?.saleReturnDate) ? "Return Invoice" : printInvoiceData?.vatAmount ? "Invoice" : (!printInvoiceData?.vatAmount && printInvoiceData?.saleReturnDate) ? "Return Quotation" : "Quotation"}
        </p>

        <div style="margin-bottom: 5px;">
            
        ${printInvoiceData?.vatAmount ? `<p>Invoice #: ${printInvoiceData?.invoiceNumber}` : ""}
        </br>
            Date: ${printInvoiceData.saleDate ? new Date(
          printInvoiceData.saleDate
        ).toLocaleDateString() : printInvoiceData.saleReturnDate ? new Date(
          printInvoiceData.saleReturnDate
        ).toLocaleDateString() : new Date(
          printInvoiceData.exchangeDate
        ).toLocaleDateString()}</br>
            Time: ${printInvoiceData.saleDate ? new Date(
          printInvoiceData.saleDate
        ).toLocaleTimeString() : printInvoiceData.saleReturnDate ? new Date(
          printInvoiceData.saleReturnDate
        ).toLocaleTimeString() : new Date(
          printInvoiceData.exchangeDate).toLocaleTimeString()}</p>
        </div>

              ${printInvoiceData?.vatAmount ? `
              <p style="margin-bottom: 5px; font-weight: bold; font-size: 16px;">`  : ""} 
            Bill to:
        </br>
        Account Number: ${printInvoiceData?.customerDetails[0]?.accountNo}</br>

              ${printInvoiceData?.vatAmount ?

          `Business Name: ${printInvoiceData?.customerDetails[0]?.businessName}</br>
          Customer Email: ${printInvoiceData?.customerDetails[0]?.email}
          </p>` : ""
        }

  
  ${printInvoiceData?.vatAmount ? `Payment Method: ${printInvoiceData?.paymentMethod}` : ""}


    </div>

    ${printInvoiceData.status
          ? `<p>Status: ${printInvoiceData?.status}</p>`
          : ""
        }

    ${printInvoiceData.referenceId
          ? `<p>Reference Id: ${printInvoiceData.referenceId}</p>`
          : ""
        }
    ${printInvoiceData.transactionId
          ? `<p>Transaction Id: ${printInvoiceData.transactionId}</p>`
          : ""
        }
    ${printInvoiceData?.paymentMethod?.toLowerCase() == "cheque"
          ? `<p>Cheque No: ${printInvoiceData.cheque_no}</br>
          Bank Name: ${printInvoiceData.bank_name}</br>
          Cheque Date: ${new Date(
            printInvoiceData.clear_date
          ).toLocaleDateString()}</p>
          `
          : ""
        }
</div>


    </div>
    
    </td>
    </tr>
    
    </table>
          
    <table style="margin-top:10px;border-collapse: collapse;margin-right:10px;" >
                  <thead style="background-color:lightGray;" >
                  <tr style="background-color:lightGray;" >
                 <th
                  style="
                    font-size: 16px;  
                    font-weight: bold;
                    margin:0px;
                    font-family: Arial, Helvetica, sans-serif;
                    border: 1px solid black;
                    margin-bottom: 10px;
                    width:50px;
                    "
                >
                  Item
                </th>
                  <th
                  style="
                    font-size: 16px;  
                    font-weight: bold;
                    margin:0px;
                    font-family: Arial, Helvetica, sans-serif;
                    border: 1px solid black;
                    margin-bottom: 10px;
                    "
                >
                  Barcode 
                </th>
    
                  <th
                      style="
                        font-size: 16px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                      "
                    >
                      Description
                    </th>
        
                    <th
                      style="
                        font-size: 16px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                      "
                    >
                      Quantity
                    </th>
        
                    <th
                      style="
                        font-size: 16px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                      "
                    >
                      Price
                    </th>
        
                    <th
                      style="
                        font-size: 16px;
                        font-weight: bold;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                      "
                    >
                      Discount
                    </th>
                    <th
                      style="
                        font-size: 16px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                      "
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
            
                    ${printInvoiceData.productDetails &&
        printInvoiceData.productDetails.length > 0 &&
        printInvoiceData.productDetails.map(
          (e, i) =>
            `<tbody>
                      <tr>
                      
                      
                      <td
                      style="
                      font-size: 16px;  
                      font-weight: bold;
                      margin:0px;
                      width:50px;
                      font-family: Arial, Helvetica, sans-serif;
                      border: 1px solid black;
                      margin-bottom: 10px;
                      "
                        >
                        ${printInvoiceData?.saleReturnDate ? "-" : ""} 1
                        </td>
    
                      <td
                      style="
                      font-size: 16px;  
                      font-weight: bold;
                      margin:0px;
                      width:150px;
                      font-family: Arial, Helvetica, sans-serif;
                      border: 1px solid black;
                      margin-bottom: 10px;
                      "
                        >
                          ${e.barcode}
                        </td>
    
                      
                      <td
                      style="
                      font-size: 16px;  
                      font-weight: bold;
                      width:350px;
                      margin:0px;
                      font-family: Arial, Helvetica, sans-serif;
                      border: 1px solid black;
                      margin-bottom: 10px;
                      "
                        >
                          ${e.productName}
                        </td>
            
                        <td
                        style="
                        font-size: 16px;  
                        width:100px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                        >
                        ${printInvoiceData?.saleReturnDate ? "-" : ""}${e?.DamageQty ? e?.DamageQty : e.saleQty}
                        </td>
            
        
                        <td
                        style="
                        font-size: 16px; 
                        width:100px; 
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                        >
                        £${printInvoiceData?.saleReturnDate ? "-" : ""}${printInvoiceData?.customerDetails[0]?.priceLevel[0]?.id == 1
              ? e.trade_price
              : printInvoiceData?.customerDetails[0]?.priceLevel[0]?.id ==
                2
                ? e.warehouse_price
                : e.retail_price
            }
                        </td>
            
                        <td
                        style="
                        font-size: 16px;  
                        font-weight: bold;
                        width:100px;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                        >
                        £${e.discountPrice
              ? (printInvoiceData?.customerDetails[0]?.priceLevel[0]
                ?.id == 1
                ? e.trade_price
                : printInvoiceData?.customerDetails[0]?.priceLevel[0]
                  ?.id == 2
                  ? e.warehouse_price
                  : e.retail_price) - e.discountPrice
              : 0
            }
                        </td>
            
                        <td
                        style="
                        font-size: 16px;  
                        width:100px;
                        font-weight: bold;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                        >
                        £${printInvoiceData?.saleReturnDate ? "-" : ""}${e.discountPrice
              ? e.discountPrice * (e?.DamageQty ? e?.DamageQty : e.saleQty)
              : (printInvoiceData?.customerDetails[0]?.priceLevel[0]
                ?.id == 1
                ? e.trade_price
                : printInvoiceData?.customerDetails[0]?.priceLevel[0]
                  ?.id == 2
                  ? e.warehouse_price
                  : e.retail_price) * (e?.DamageQty ? e?.DamageQty : e.saleQty)
            }
                        </td>
                      </tr>
                    </tbody>`
        )}
    
    
          ${printInvoiceData.returnProductDetails &&
        printInvoiceData.returnProductDetails.length > 0 &&
        printInvoiceData.returnProductDetails.map(
          (e, i) =>
            `<tbody>
                        <tr>
                        
                        
                        <td
                        style="
                        font-size: 16px;  
                        font-weight: bold;
                        margin:0px;
                        width:150px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                          >
                          ${printInvoiceData?.exchangeDate ? "-" : ""} 1
                          </td>
      
                        <td
                        style="
                        font-size: 16px;  
                        font-weight: bold;
                        margin:0px;
                        width:150px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                          >
                            ${e.barcode}
                          </td>
      
                        
                        <td
                        style="
                        font-size: 16px;  
                        font-weight: bold;
                        width:250px;
                        margin:0px;
                        font-family: Arial, Helvetica, sans-serif;
                        border: 1px solid black;
                        margin-bottom: 10px;
                        "
                          >
                            ${e.productName}
                          </td>
              
                          <td
                          style="
                          font-size: 16px;  
                          width:100px;
                          font-weight: bold;
                          margin:0px;
                          font-family: Arial, Helvetica, sans-serif;
                          border: 1px solid black;
                          margin-bottom: 10px;
                          "
                          >
                          ${printInvoiceData?.exchangeDate ? "-" : ""}${e?.DamageQty ? e?.DamageQty : e.saleQty}
                          </td>
              
          
                          <td
                          style="
                          font-size: 16px; 
                          width:100px; 
                          font-weight: bold;
                          margin:0px;
                          font-family: Arial, Helvetica, sans-serif;
                          border: 1px solid black;
                          margin-bottom: 10px;
                          "
                          >
                          £${printInvoiceData?.exchangeDate ? "-" : ""}${printInvoiceData?.customerDetails[0]?.priceLevel[0]?.id == 1
              ? e.trade_price
              : printInvoiceData?.customerDetails[0]?.priceLevel[0]?.id ==
                2
                ? e.warehouse_price
                : e.retail_price
            }
                          </td>
              
                          <td
                          style="
                          font-size: 16px;  
                          font-weight: bold;
                          width:100px;
                          margin:0px;
                          font-family: Arial, Helvetica, sans-serif;
                          border: 1px solid black;
                          margin-bottom: 10px;
                          "
                          >
                          £${e.discountPrice
              ? (printInvoiceData?.customerDetails[0]?.priceLevel[0]
                ?.id == 1
                ? e.trade_price
                : printInvoiceData?.customerDetails[0]?.priceLevel[0]
                  ?.id == 2
                  ? e.warehouse_price
                  : e.retail_price) - e.discountPrice
              : 0
            }
                          </td>
              
                          <td
                          style="
                          font-size: 16px;  
                          width:100px;
                          font-weight: bold;
                          margin:0px;
                          font-family: Arial, Helvetica, sans-serif;
                          border: 1px solid black;
                          margin-bottom: 10px;
                          "
                          >
                          £${printInvoiceData?.exchangeDate ? "-" : ""}${e.discountPrice
              ? e.discountPrice * (e?.DamageQty ? e?.DamageQty : e.saleQty)
              : (printInvoiceData?.customerDetails[0]?.priceLevel[0]
                ?.id == 1
                ? e.trade_price
                : printInvoiceData?.customerDetails[0]?.priceLevel[0]
                  ?.id == 2
                  ? e.warehouse_price
                  : e.retail_price) * (e?.DamageQty ? e?.DamageQty : e.saleQty)
            }
                          </td>
                        </tr>
                      </tbody>`
        )}
                    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
                    <tfoot>
                      <tr>
    
                      <td
                      style="
                      font-size: 20px;
                      font-weight: bold;
                      text-align : center;
                      border: 1px solid black;
                      font-family: Arial, Helvetica, sans-serif;
                    "
                      
                    >
                     ${printInvoiceData?.saleReturnDate ? "-" : ""} ${printInvoiceData?.totalItems}
                    </td>
    
                        <td
                          colSpan = "2"
                          style="
                          font-size: 20px;
                          font-weight: bold;
                          text-align : center;
                          border: 1px solid black;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                          
                        >
                          Subtotal
                        </td>
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                        >
                        ${printInvoiceData?.saleReturnDate ? "-" : ""} ${printInvoiceData?.totalQty}
                        </td>
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                        ></td>
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                        >
                        £${printInvoiceData.discount ?? 0}
                        
                        </td>
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                        >
                        £${printInvoiceData?.saleReturnDate ? "-" : ""}${printInvoiceData.vatAmount
          ? printInvoiceData.total - printInvoiceData.discount
          : printInvoiceData.subtotal
        }
                        </td>
                      </tr>
            
                      ${printInvoiceData.vatAmount
          ? `
                      <tr>
                        <td
                          colspan="6"
                          style="
                          font-size: 20px;
                          font-weight: bold;
                          text-align : center;
                          border: 1px solid black;
                          font-family: Arial, Helvetica, sans-serif;
                        "
                        >
                          Vat
                        </td>
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                        >
                        £${printInvoiceData?.saleReturnDate ? "-" : ""}${printInvoiceData.vatAmount}
                        </td>
                      </tr>`
          : ""
        }
            
                      <tr>
                        <td
                          colspan="6"
    
                          style="
                            font-size: 20px;
                            font-weight: bold;
                            color: red;
                            text-align : center;
                            font-family: Arial, Helvetica, sans-serif;
                            border: 1px solid black;
                          "
                        >
                          Total
                        </td>
    
                        <td
                        style="
                        font-size: 20px;
                        font-weight: bold;
                        text-align : center;
                        border: 1px solid black;
                        font-family: Arial, Helvetica, sans-serif;
                        color: red;
                      "
                        >
                         £${printInvoiceData?.saleReturnDate ? "-" : ""}${printInvoiceData.subtotal}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
            `;


      const pdfPath = path.join(__dirname, '../PDF/') + `invoice#${printInvoiceData.invoiceNumber}.pdf`
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(content);
      await page.pdf({ path: pdfPath, format: 'A4' });
      await browser.close();
      resolve(pdfPath);

    } catch (error) {

      reject(error)
    }

    // const options = {
    //   format: 'A4',
    //   orientation: 'portrait',
    //   border: {
    //     top: '1cm',
    //     right: '1cm',
    //     bottom: '1cm',
    //     left: '1cm'
    //   }
    // };

    // const pdfPath = path.join(__dirname, '../PDF/') + `invoice#${printInvoiceData.invoiceNumber}.pdf`

    // pdf.create(content, options).toFile(pdfPath, (err, res) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     console.log("PDF generated successfully:", res.filename);
    //     resolve(res.filename);
    //   }
    // });
  });
};




const sendEmailWithAttachment = (printInvoiceData, pdfPath, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "zainshakeel65@gmail.com",
      pass: appPassword,
    },
  });

  const mailOptions = {
    from: "zainshakeel65@gmail.com",
    to: printInvoiceData.customerDetails[0].email, // Assuming customer email is stored here
    subject: "Your Invoice",
    html: "Please find attached your invoice.",
    attachments: [{ filename: 'invoice.pdf', path: pdfPath }]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error.message);
      res.status(500).json({ message: "Error sending email", error: error });
    } else {
      console.log("Email sent successfully");
      res.json({
        message: "Email sent successfully",
        status: true,
        info: info,
        subject: mailOptions.subject,
        date: new Date(),
      });
    }
  });



}



const EmailController = {

  post: (req, res) => {


    console.log(req.body, "body")


    let { body, to, html, subject, id, name } = req.body;



    if (((!body && !html) || !to || !subject)) {
      res.json({
        status: "false",
        message: "Required field are missing"
      });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "zainshakeel65@gmail.com",
        pass: appPassword,
      },
    });

    let mailOptions;

    if (body) {
      mailOptions = {
        from: "zainshakeel65@gmail.com",
        to: to,
        subject: subject,
        text: body,
      };
    }
    if (html) {

      mailOptions = {
        from: "zainshakeel65@gmail.com",
        to: to,
        subject: subject,
        html: html,
      };

    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error.message);
        res.json({
          message: error.message,
          status: false,
        });
      } else {
        let emailDate = new Date();

        let dataToSend = {

          id: id,
          name: name,
          subject: subject,
          body: body,
          to: to,
          info: info,
          created_at: emailDate

        }

        emailModel.create(dataToSend).then((data) => {

          if (!data) {

            res.json({
              message: "Internal Sever Error",
              status: false
            })
            return
          }

          res.json({
            message: "Email send successfully",
            status: true,
            info: info,
            subject: subject,
            date: emailDate,
            body: body,
          });

        }).catch((error) => {

          res.json({
            message: error.message,
            status: false,
            error: error
          })

        })

      }
    });


  },
  sendPdf: async (req, res) => {
    let { printInvoiceData } = req.body;

    console.log(printInvoiceData, "printInvoiceData")

    // Generate PDF
    generatePdf(printInvoiceData).then((pdfPath) => {
      // Send email with PDF attachment
      console.log(pdfPath, "dfPath")

      sendEmailWithAttachment(printInvoiceData, pdfPath, res);
    }).catch((error) => {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Error generating PDF", error: error });
    });
  }



}

module.exports = EmailController