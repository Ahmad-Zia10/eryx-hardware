import { SITE_CONFIG } from "@/constants";

type NotificationPayload = {
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendStoreNotification(payload: NotificationPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_EMAIL || SITE_CONFIG.email;
  const from = process.env.NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.info("Notification email skipped; RESEND_API_KEY is not configured.", payload);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: payload.subject,
      text: payload.text,
      reply_to: payload.replyTo,
    }),
  });

  if (!response.ok) {
    console.error("Notification email failed:", await response.text());
  }
}

export async function sendCustomerConfirmation(payload: NotificationPayload & { to: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.info("Customer email skipped; RESEND_API_KEY is not configured.", payload);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    console.error("Customer email failed:", await response.text());
  }
}
