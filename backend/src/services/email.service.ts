import axios from 'axios';

const EMAIL_LAMBDA_API_URL = "https://5m47dbkqzqpoetlggjmyrw3gje0lzwvy.lambda-url.ap-south-1.on.aws/";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

/**
 * @desc Send an email by invoking an AWS Lambda function via API Gateway
 */
export const sendEmail = async (to: string, subject: string, text: string) => {
    if (!EMAIL_LAMBDA_API_URL) {
        console.error("❌ EMAIL_LAMBDA_API_URL is not configured. Email cannot be sent.");
        return; 
    }
    try {
        const payload = { to, subject, text };
        await axios.post(EMAIL_LAMBDA_API_URL, payload);
    } catch (error) {
        console.error("❌ Failed to call the email Lambda API:", error);
        throw new Error("The email service is currently unavailable.");
    }
};

/**
 * @desc Send Email Verification Link
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
    await sendEmail(email, "Verify Your Email", `Click this link to verify your email: ${verificationLink}`);
};

/**
 * @desc Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    const emailBody = `
Hello,

We received a request to reset the password for your NallaHealth account.

Please click the link below to set a new password. This link is only valid for one hour.
${resetLink}

For your security, if you did not request a password reset, please ignore this email. Your account will remain secure.

Thanks,
The NallaHealth Team
    `;
    await sendEmail(email, "Reset Your NallaHealth Password", emailBody);
};
