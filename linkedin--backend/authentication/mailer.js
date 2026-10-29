/**
 * ============================================================================
 * DESIGN PATTERN USAGE: ADAPTER PATTERN (Structural Pattern)
 * ============================================================================
 * 
 * WHAT IS THIS PATTERN?
 * --------------------
 * The Adapter Pattern acts as a bridge between two incompatible interfaces. It
 * wraps an existing class with a new interface so that classes with different
 * interfaces can work together seamlessly.
 * 
 * WHY ARE WE USING THIS PATTERN?
 * ------------------------------
 * Third-party mailer libraries (such as Nodemailer, SendGrid, Amazon SES)
 * use distinct, incompatible APIs and transports. By using the Adapter Pattern,
 * our application interacts with a uniform `EmailClientInterface`. The adapter 
 * handles library-specific transport instantiation, configuration, and method 
 * invocation behind a standard interface.
 * 
 * WHERE ARE WE USING THIS PATTERN?
 * --------------------------------
 * Here in `mailer.js`. We obtain an adapter through `EmailServiceAdapterFactory`,
 * providing a seamless `.send({ to, subject, html })` implementation for all 
 * authentication and user notification emails without altering controller caller code.
 * ============================================================================
 */

const { EmailServiceAdapterFactory } = require("../patterns/structural/EmailServiceAdapter");

module.exports = async (to, subject, html) => {
  try {
    const adapter = EmailServiceAdapterFactory.getAdapter();
    return await adapter.send({ to, subject, html });
  } catch (err) {
    console.warn("[MAILER NOTICE] Failed to send email via adapter, error:", err.message);
    return { error: err.message };
  }
};
