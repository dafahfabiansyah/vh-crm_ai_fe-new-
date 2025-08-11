import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { BanknoteArrowDown, FileText } from "lucide-react";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { exportTransactionsToExcel } from "../utils/excelExporter";
import type {  TransactionHistoryProps } from "../types/transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = [],
  isLoading = false,
  error = null,
  getPlanNameById = (id: string) => id, // Default implementation
}) => {
  // Format date in Indonesian locale
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get status badge color based on transaction type
  const getTransactionTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "sub_purchase":
      case "purchase":
        return "bg-emerald-100 text-emerald-800";
      case "renewal":
        return "bg-blue-100 text-blue-800";
      case "upgrade":
        return "bg-purple-100 text-purple-800";
      case "refund":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string): string => {
    switch (method.toLowerCase()) {
      case "credit_card":
      case "credit card":
        return "bg-indigo-100 text-indigo-800";
      case "bank_transfer":
      case "bank transfer":
        return "bg-teal-100 text-teal-800";
      case "paypal":
        return "bg-amber-100 text-amber-800";
      case "e_wallet":
      case "e-wallet":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };
  
  const handleExportTransactions = (): void => {
    exportTransactionsToExcel(transactions, getPlanNameById);
  };

  // Render table content based on state
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="px-6 py-16 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-sm font-medium">
                Memuat transaksi...
              </span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="px-6 py-16 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <span className="text-red-600 text-sm font-medium block">
                  {error}
                </span>
                <span className="text-gray-500 text-xs mt-1">
                  Silakan coba lagi dalam beberapa saat
                </span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="px-6 py-16 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <span className="text-gray-600 text-sm font-medium block">
                  Belum ada transaksi
                </span>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Transaksi Anda akan muncul di sini setelah melakukan pembelian
                  atau berlangganan.
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return transactions.map((transaction) => (
      <TableRow
        key={transaction.id}
        className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
      >
        <TableCell className="px-6 py-5 text-sm font-medium text-gray-900">
          {formatDate(transaction.created_at)}
        </TableCell>
        <TableCell className="px-6 py-5">
          <code
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200"
            title={transaction.id}
          >
            {/* {transaction.id.length > 16 ? `${transaction.id.slice(0, 16)}...` : transaction.id} */}
            {transaction.id}
          </code>
        </TableCell>
        <TableCell className="px-6 py-5">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getTransactionTypeColor(
              transaction.transaction_type
            )}`}
          >
            {transaction.transaction_type === "sub_purchase"
              ? "Purchase"
              : transaction.transaction_type.charAt(0).toUpperCase() +
                transaction.transaction_type.slice(1)}
          </span>
        </TableCell>
        <TableCell className="px-6 py-5 text-center">
          <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
            {transaction.quantity}
          </span>
        </TableCell>
        <TableCell className="px-6 py-5">
          <span
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            title={transaction.id_subscription}
          >
            {getPlanNameById(transaction.id_subscription)}
          </span>
        </TableCell>
        <TableCell className="px-6 py-5">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentMethodColor(
              transaction.payment_method
            )}`}
          >
            {transaction.payment_method === "credit_card"
              ? "Credit Card"
              : transaction.payment_method
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </TableCell>
        <TableCell className="px-6 py-5">
          <Button
            onClick={() => generateInvoicePDF(transaction, getPlanNameById)}
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 hover:border-blue-300"
            title="Download Invoice PDF"
          >
            <BanknoteArrowDown className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <div className="mt-6 sm:mt-8">
      <Card className="shadow-sm border border-gray-200 overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Riwayat pembayaran dan transaksi Anda
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300 text-gray-700 shadow-sm font-medium"
              onClick={handleExportTransactions}
              disabled={isLoading || transactions.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Transaction ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Tipe
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-center">
                    Qty
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Subscription
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Metode
                  </TableHead>
                  <TableHead className="font-semibold text-gray-800 px-6 py-4 text-left">
                    Invoice
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory;
