const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: `"LMU Timetable System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - Landmark Metropolitan University',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
                    <h2 style="color: #0052FF; text-align: center;">Email Verification</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering at Landmark Metropolitan University Timetable System. Please use the following code to verify your email address:</p>
                    <div style="background: #f4f7fe; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                        <h1 style="font-size: 32px; letter-spacing: 5px; color: #0052FF; margin: 0;">${otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6a737d; text-align: center;">&copy; 2024 Landmark Metropolitan University Timetable System</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // For demonstration purposes, if mail fails (e.g. no credentials), we still return true
        // but log the OTP so it can be found in terminal
        console.log(`[DEMO FALLBACK] OTP for ${email}: ${otp}`);
        return false;
    }
};
