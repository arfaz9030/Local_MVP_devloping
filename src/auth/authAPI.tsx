/**
 * CrickHeroes Frontend Auth Service integration file
 * Conforming to backend Spring Boot endpoints (e.g. REST API structure)
 */
import { getToken, saveToken } from './tokenService';

export const BASE_URL = 'http://192.168.29.120:2020';
// export interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data?: T;
// }
export interface RequestOtpResponse {
  message: string;
  mobileNumber: string;
  verified: boolean;
  expiresAt: string;
  otp: string;
  userId: number;
}
export interface VerifyOtpResponse {
  message: string;
  mobileNumber: string;
  token: string;
  userId: number;
  refreshToken: string | null;
}
export const authApi = {
  /**
   * Triggers OTP or Quick Mobile Verification
   * @param phoneNumber Player's mobile number
   */
  async verifyMobile(phoneNumber: string): Promise<RequestOtpResponse> {
    try {
      console.log("POST:", `${BASE_URL}/api/auth/request-otp`);
      console.log("Phone:", phoneNumber);
      const response = await fetch(`${BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ phoneNumber })
        body: JSON.stringify({
          mobileNumber: phoneNumber
        }),
      });
      console.log("Status:", response.status);
      const body = await response.clone().text();
      console.log("Status:", response.status);
      console.log("Raw Body:", body);
      if (!response.ok) {
        throw new Error('Verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in verifyMobile api:', error);
      // Fallback for local simulation
      // return { success: true, message: 'Simulated success' };
      throw error;
    }
  },

  /**
   * Verifies the OTP entered by the user
   * @param phoneNumber Mobile number
   * @param code 4-digit code
   */
  async verifyOTP(phoneNumber: string, code: string): Promise<VerifyOtpResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ phoneNumber, code })
        body: JSON.stringify({
          mobileNumber: phoneNumber,
          otp: code
        }),
      });

      if (!response.ok) {
        throw new Error('OTP verification failed');
      }
      const data = await response.json();
      // console.log("JWT Received:", data.token);
      console.log('JWT Received:', Boolean(data.token));
      // Save JWT securely
      await saveToken(data.token);

      // // 🔒 Save refresh token
      // if (data.refreshToken) {
      //   await saveRefreshToken(data.refreshToken);
      // }
      const storedToken = await getToken();

      // console.log("Stored Token:", storedToken);
      console.log('Stored Token:', Boolean(storedToken));

      return data;
    }
    catch (error) {
      console.error('Error in verifyOTP api:', error);
      // Fallback for local simulation
      throw error;

    }
  }
};
