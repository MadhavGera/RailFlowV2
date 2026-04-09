import nodemailer from 'nodemailer';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const sendBookingConfirmation = async (
    userEmail: string,
    userName: string,
    bookingDetails: any
) => {
    try {
        const mailOptions = {
            from: `"RailFlow" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🎟️ Your RailFlow Ticket is Confirmed!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">Booking Confirmed!</h2>
          <p>Hi ${userName}, your train ticket has been successfully booked.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Train:</strong> ${bookingDetails.trainName} (${bookingDetails.trainNumber})</p>
            <p><strong>Route:</strong> ${bookingDetails.fromStationId} to ${bookingDetails.toStationId}</p>
            <p><strong>Date:</strong> ${new Date(bookingDetails.journeyDate).toDateString()}</p>
            <p><strong>Seats:</strong> ${bookingDetails.seatIds.join(', ')}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">Thank you for traveling with RailFlow!</p>
        </div>
      `,
        };

        await getTransporter().sendMail(mailOptions);
        console.log('Confirmation email sent to', userEmail);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};