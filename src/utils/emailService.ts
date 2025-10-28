import EmailJS from "@emailjs/nodejs";

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Initialize EmailJS
EmailJS.init({
  publicKey: EMAILJS_PUBLIC_KEY || "",
  privateKey: EMAILJS_PRIVATE_KEY || "",
});

export interface PriceAlertEmailData {
  userEmail: string;
  userName: string;
  productName: string;
  productUrl: string;
  oldPrice: number;
  newPrice: number;
  priceChange: string; // 'dropped', 'increased', 'same'
  savings?: number;
  storeName: string;
  productImage?: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
}

export interface PasswordResetEmailData {
  userEmail: string;
  userName: string;
  otp: string;
}

class EmailService {
  /**
   * Send price drop alert email
   */
  static async sendPriceAlertEmail(
    data: PriceAlertEmailData
  ): Promise<boolean> {
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        console.error("EmailJS configuration missing");
        return false;
      }

      const templateParams = {
        to_email: data.userEmail,
        user_name: data.userName,
        product_name: data.productName,
        product_url: data.productUrl,
        old_price: data.oldPrice,
        new_price: data.newPrice,
        price_change: data.priceChange,
        savings: data.savings || 0,
        store_name: data.storeName,
        product_image: data.productImage || "",
        current_date: new Date().toLocaleDateString(),
      };

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log("Price alert email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Error sending price alert email:", error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        console.error("EmailJS configuration missing");
        return false;
      }

      const templateParams = {
        to_email: "zaidikhadija462@gmail.com",
        to_name: "Zaidi",
        button_url: "https://www.google.com",
        message: "Welcome to the platform",

        // current_date: new Date().toLocaleDateString(),
      };

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log("Welcome email sent successfully:", response);
      return response?.status === 200;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    data: PasswordResetEmailData
  ): Promise<boolean> {
    try {
      const templateId = process.env.EMAILJS_PASSWORD_RESET_EMAIL;
      const templateParams = {
        user_email: data.userEmail,
        user_name: data.userName,
        otp: data.otp,
      };

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        templateId, // You'll need to create this template in EmailJS
        templateParams
      );

      console.log("Password reset email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }

  /**
   * Send general notification email
   */
  static async sendNotificationEmail(
    toEmail: string,
    message: string,
    userName?: string,
    directLink?: string,
    productTitle?: string
  ): Promise<boolean> {
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
        console.error("EmailJS configuration missing");
        return false;
      }
      const name = userName || "User";

      const templateParams = {
        to_email: toEmail,
        to_name: `${name}, Price Dropped on your tracked product ${productTitle}`,
        button_url: directLink,
        message: message,
      };

      const response = await EmailJS.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID, // You'll need to create this template in EmailJS
        templateParams
      );

      console.log("Notification email sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Error sending notification email:", error);
      return false;
    }
  }
}

export default EmailService;
