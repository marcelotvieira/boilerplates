/**
 * Email Sending Status
 */
export enum EmailStatus {
  PENDING = 'pending',    // Email queued for sending
  SENT = 'sent',          // Email sent successfully
  FAILED = 'failed'       // Email failed to send
}
