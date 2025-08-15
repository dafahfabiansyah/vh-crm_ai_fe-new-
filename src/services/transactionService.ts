import axios from "./axios";
import { AuthService } from "./authService";
import CryptoJS from "crypto-js";

export interface CreateTransactionPayload {
  id_subscription: string;
  voucher?: string;
  months?: number;
  discount_percentage?: number;
  voucher_discount_percentage?: number;
  total_amount?: number;
  unit_price?: number;
  merchant_ref_no?: string;
}

export async function createTransaction({ id_subscription, voucher, months, discount_percentage, voucher_discount_percentage, total_amount, unit_price }: CreateTransactionPayload) {
  // Generate merchant reference number
  const merchant_ref_no = generateRandomString(16);
  
  const body = {
    transaction_type: "sub_purchase",
    id_subscription,
    quantity: 1,
    payment_method: "prisma",
    payment_gateway: "prisma",
    voucher: voucher || undefined,
    months: months || 1,
    discount_percentage: discount_percentage || null,
    voucher_discount_percentage: voucher_discount_percentage || null,
    total_amount: total_amount || 0,
    unit_price: unit_price || 0,
    merchant_ref_no: merchant_ref_no,
    prisma_invoice_id: "INV-123",
    prisma_payment_id: "PAY-456",
  };
  
  console.log('Transaction Service - Sending payload:', body);
  console.log('Transaction Service - Input params:', { id_subscription, voucher, months, discount_percentage, voucher_discount_percentage, total_amount, unit_price });
  
  // Call the new endpoint
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/v1/transactions/create-without-subscription`, body);
  
  // After successful transaction creation, call Plink API
  try {
    const plinkResponse = await submitToPlinkAPI({
      merchant_ref_no,
      total_amount: total_amount || 0,
      id_subscription,
      months: months || 1
    });
    
    // If Plink API returns a payment page URL, redirect the user
    if (plinkResponse && plinkResponse.payment_page_url) {
      window.location.href = plinkResponse.payment_page_url;
    }
    
    return { ...response, plinkResponse };
  } catch (plinkError) {
    console.error('Plink API submission failed:', plinkError);
    // Continue with the original response even if Plink fails
    return response;
  }
}

export async function getUsageTracking() {
  return axios.get("/v1/usage-tracking");
}

export async function getCurrentSubscription() {
  return axios.get("/v1/current-subscription");
}

export async function getTransactionHistory() {
  return axios.get("/v1/transactions");
}

export interface VoucherValidationPayload {
  code: string;
  id_subscription: string;
  months: number;
}

export interface VoucherValidationResponse {
  valid: boolean;
  message: string;
  discount_amount: number;
  final_price: number;
  discount_type: string;
  trial_duration_days?: number;
}

export async function validateVoucher({ code, id_subscription, months }: VoucherValidationPayload): Promise<VoucherValidationResponse> {
  const response = await axios.post("/v1/vouchers/validate", {
    code,
    id_subscription,
    months
  });
  return response.data;
}

// Helper function to generate random string
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate random numbers
function generateRandomNumbers(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// Helper function to format current date
function getCurrentFormattedDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} +0700`;
}

// Plink API submission interface
interface PlinkSubmissionData {
  merchant_ref_no: string;
  total_amount: number;
  id_subscription: string;
  months: number;
}

interface PlinkResponse {
  response_code: string;
  response_message: string;
  response_description: string;
  plink_ref_no: string;
  va_number_list: string;
  payment_page_url: string;
  transaction_status: string;
  timestamp: string;
  validity: string;
}

// Function to submit transaction to Plink API
async function submitToPlinkAPI(data: PlinkSubmissionData): Promise<PlinkResponse> {
  const user = AuthService.getStoredUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const currentDate = getCurrentFormattedDate();
  const invoiceNumber = `INV${generateRandomNumbers(6)}`;
  const userDeviceId = generateRandomNumbers(13);
  
  // Plink API constants
  const merchantKeyId = 'e8339f7d872347f48325e3c5a857a8c2';
  const merchantId = '001750938574287';
  const secretKey = 'bace1d9bf907c01321364d87';
  const backendCallback = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/v1/transactions/payment-callback`;
  const frontendCallback = `${import.meta.env.VITE_BASE_URL || 'http://localhost:5173'}/billing`;
  
  // Create product details for subscription
  const productDetails = [{
    item_code: 8768,
    item_title: `Subscription - ${data.months} month(s)`,
    quantity: 1,
    total: data.total_amount.toString(),
    currency: 'IDR'
  }];
  
  const requestBody = {
    merchant_ref_no: data.merchant_ref_no,
    backend_callback_url: backendCallback,
    frontend_callback_url: frontendCallback,
    transaction_date_time: currentDate,
    transmission_date_time: currentDate,
    transaction_currency: 'IDR',
    transaction_amount: data.total_amount,
    validity: '',
    product_details: JSON.stringify(productDetails),
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    user_phone_number: user.phone_number || '+6285342805673',
    user_device_id: userDeviceId,
    payment_method: '',
    invoice_number: invoiceNumber,
    integration_type: '03',
    bank_id: '53678'
  };
  
  // Generate MAC for authentication
  let requestData = JSON.stringify(requestBody);
  requestData = requestData
    .replace(/"{{TSdate}}"/g, `"${currentDate}"`)
    .replace(/"{{merchKeyid}}"/g, `"${merchantKeyId}"`)
    .replace(/"{{merchId}}"/g, `"${merchantId}"`)
    .replace(/"{{frontendCallback}}"/g, `"${frontendCallback}"`)
    .replace(/"{{backendCallback}}"/g, `"${backendCallback}"`)
    .replace(/"{{merchRefNo}}"/g, `"${data.merchant_ref_no}"`);
  
  const mac = CryptoJS.HmacSHA256(requestData, secretKey).toString();
  
  // Submit to Plink API via backend
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/v1/transactions/prismalink-payment`, {
    ...requestBody,
    mac: mac
  });
  
  console.log('Plink API response:', response.data);
  return response.data;
}