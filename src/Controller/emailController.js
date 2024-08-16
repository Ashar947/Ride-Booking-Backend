const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "mail.ticb.ae",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "wat.app@ticb.ae",
        pass: "gm3h#5#%#7Z3",
    },
});


exports.sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: '"WAT-App (Dev) 👻" <wat.app@ticb.ae>', // sender address
            to, // list of receivers
            subject, // Subject line
            text,
            html,
        });
        console.log("Email Send Successfully", info.messageId)
        return { success: true, message: info.messageId }
    } catch (error) {
        console.log("Unable To Send Email", error)
        return { success: false, message: error?.message ?? "Error Ocurred While Sending Email ." }
    }
}
