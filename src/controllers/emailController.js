const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
const emailModel = require("../models/emailsSchema")

dotenv.config()

let appPassword = process.env.appPassword

console.log(appPassword, "APP")


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

                    _id: id,
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


    }


}

module.exports = EmailController