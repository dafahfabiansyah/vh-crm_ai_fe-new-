import axios from "./axios";

export interface CreateTransactionPayload {
  id_subscription: string;
  voucher?: string;
}

export async function createTransaction({ id_subscription, voucher }: CreateTransactionPayload) {
  const body = {
    transaction_type: "sub_purchase",
    id_subscription,
    quantity: 1,
    payment_method: "credit_card",
    payment_gateway: "manual",
    voucher: voucher || undefined,
    prisma_invoice_id: "INV-123",
    prisma_payment_id: "PAY-456",
    prisma_external_id: "EXT-789",
  };
  return axios.post("/v1/transactions", body);
} 