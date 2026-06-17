import { resend } from "./resend";

export async function sendBookingConfirmationEmail({
  to,
  name,
  bookingId,
  checkIn,
  checkOut,
  tent,
  amount,
}: {
  to: string;
  name: string;
  bookingId: string;
  checkIn: string;
  checkOut: string;
  tent: string;
  amount: number;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: "Your Wild Earth Jungle Camp Booking is Confirmed 🌿",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Booking Confirmed ✅</h2>
          
          <p>Hi ${name},</p>
          
          <p>Your booking has been successfully confirmed.</p>
          
          <hr />
          
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Tent:</strong> ${tent}</p>
          <p><strong>Total Paid:</strong> ₹${amount}</p>
          
          <hr />
          
          <p>We look forward to hosting you! 🌄</p>
          
          <p>– Campsite Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return;
    }

    return data;
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
