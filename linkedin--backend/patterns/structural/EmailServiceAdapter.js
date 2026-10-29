/**
 * ============================================================================
 * DESIGN PATTERN: ADAPTER PATTERN (Structural Pattern)
 * ============================================================================
 * 
 * OVERVIEW:
 * ---------
 * 1. Intent: Convert the interface of a class into another interface that clients 
 *    expect, allowing classes with incompatible interfaces to work together.
 * 2. Why We Use It: In our LinkPro backend, email notifications are needed for 
 *    registrations and password resets. Different email tools (Nodemailer, SendGrid, 
 *    Console loggers) have completely different method signatures and rules. 
 *    Hardcoding them makes switching providers difficult.
 * 3. How It Works: 
 *    - `EmailClientInterface` establishes a uniform contract (`.send({ to, subject, html })`).
 *    - `NodemailerAdapter` and `DevConsoleEmailAdapter` translate the standard 
 *      call to fit each specific underlying service.
 * 
 * FILE LOCATION:
 * --------------
 * - Pattern: `linkedin--backend/patterns/structural/EmailServiceAdapter.js`
 * - Usage: `linkedin--backend/authentication/mailer.js` (supplied to `controller/user.js`)
 * ============================================================================
 */

const nodemailer = require("nodemailer");

/**
 * Target Interface (Expected by client code).
 */
class EmailClientInterface {
    async send({ to, subject, html }) {
        throw new Error("Method send() must be implemented by concrete Email Adapter.");
    }
}

/**
 * Concrete Adaptee & Adapter: Nodemailer SMTP Adapter
 * Adapts third-party Nodemailer Transporter to EmailClientInterface.
 */
class NodemailerAdapter extends EmailClientInterface {
    constructor(transporter) {
        super();
        this.transporter = transporter;
        this.fromAddress = process.env.EMAIL_USER
            ? `"LinkPro" <${process.env.EMAIL_USER}>`
            : '"LinkPro" <test@gmail.com>';
    }

    async send({ to, subject, html }) {
        try {
            const info = await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                html
            });
            console.log(`✅ [EMAIL SENT VIA ADAPTER] Successfully sent to ${to} (${info.messageId})`);
            return info;
        } catch (err) {
            console.warn(`⚠️ [MAILER ADAPTER WARNING] Could not send email to ${to}: ${err.message}`);
            console.log(`\n======================================================`);
            console.log(`📧 [LOCAL CONSOLE FALLBACK FOR: ${to}]`);
            console.log(`Subject: ${subject}`);
            console.log(`======================================================\n`);
            return { error: err.message, mock: true };
        }
    }
}

/**
 * Concrete Adapter: Development / Mock Logger Adapter
 * Adapts local console logging to EmailClientInterface when SMTP credentials
 * are not configured or when running in local development mode.
 */
class DevConsoleEmailAdapter extends EmailClientInterface {
    async send({ to, subject, html }) {
        console.log(`\n======================================================`);
        console.log(`📧 [LOCAL CONSOLE FALLBACK - NO REAL SMTP CONFIGURED]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`======================================================\n`);
        return { messageId: `dev-mock-${Date.now()}`, mock: true };
    }
}

/**
 * Factory helper for selecting the appropriate Email Adapter based on environment.
 */
class EmailServiceAdapterFactory {
    static getAdapter() {
        const isDevOrMissingConfig =
            !process.env.EMAIL_USER ||
            process.env.EMAIL_USER === 'test@gmail.com' ||
            !process.env.EMAIL_PASS ||
            process.env.EMAIL_PASS === 'mockpass';

        if (isDevOrMissingConfig) {
            return new DevConsoleEmailAdapter();
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        return new NodemailerAdapter(transporter);
    }
}

module.exports = {
    EmailClientInterface,
    NodemailerAdapter,
    DevConsoleEmailAdapter,
    EmailServiceAdapterFactory
};
