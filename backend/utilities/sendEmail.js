const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, firstName, code) => {
  const mailOptions = {
    from: `"Customer Loyalty App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Customer Loyalty Account",

    html: `
        <div>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            
                <h2>Welcome to Customer Loyalty App, ${firstName}!</h2>

                <p>
                    Thank you for creating your account.
                    Please use the verification code below to verify your email address.
                </p>

            <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 30px 0;
            ">
            ${code}
            </div>

            <p>
            This code will expire in <strong>10 minutes</strong>.
            </p>

            <p>
            If you did not create this account, you can safely ignore this email.
            </p>

            <p>
            Thanks,<br>
            Customer Loyalty App Team
            </p>

            </div>
        </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;