import nodemailer from "nodemailer";
import { env } from "../config/environment.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_SYSTEM,
    pass: env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendOtp(to, otp) {
    const mailOptions = {
      from: `"Shop Game" <${env.EMAIL_SYSTEM}>`,
      to,
      subject: "Mã xác thực quên mật khẩu",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; text-align: center; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .logo { margin-bottom: 30px; }
            .logo img { width: auto; height: 80px; max-width: 250px; object-fit: contain; }
            .title { color: #4366fa; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            .message { color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 30px; text-align: left; }
            .otp-code { font-size: 48px; font-weight: bold; color: #000; letter-spacing: 2px; margin: 40px 0; }
            .footer { border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px; color: #888; font-size: 12px; line-height: 1.4; }
            .link { color: #4366fa; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <!-- Thay thế src bằng link logo của shop -->
              <img src="https://res.cloudinary.com/dttk9z8xc/image/upload/v1767416727/logo_e5yaly.png" alt="Logo">
            </div>
            
            <div class="title">Xác minh danh tính của bạn</div>
            
            <div class="message">
              Xin chào,<br><br>
              Bạn vừa gửi yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Shop Game</strong>. 
              Vui lòng nhập mã bên dưới để tiếp tục. <br>
              Mã này sẽ hết hạn trong <strong>10 phút</strong>.
            </div>

            <div style="text-align: left; font-size: 16px; color: #333;">
              Mã xác minh của bạn:
            </div>
            
            <div class="otp-code">${otp}</div>
            
            <div class="footer">
              Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ.<br>
              <a href="mailto:support@shopgame.com" class="link">support@shopgame.com</a>
              <br><br>
              Copyright © 2024 SHOP GAME. All rights reserved.<br>
              Vietnam
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(`Không thể gửi email xác thực: ${error.message}`);
    }
  },
};
