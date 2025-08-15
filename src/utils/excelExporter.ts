import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Transaction } from "../types/interface";

// Export transactions to Excel file
export const exportTransactionsToExcel = (
  transactions: Transaction[],
  getPlanNameById: (id: string) => string = (id: string) => id
): void => {
  if (!transactions || transactions.length === 0) {
    console.warn("No transactions available for export");
    return;
  }

  try {
    const exportData = transactions.map((tx) => ({
      id: tx.id,
      transaction_type: tx.transaction_type,
      quantity: tx.quantity,
      created_at: tx.created_at,
      subscription: getPlanNameById(tx.id_subscription),
      payment_method: tx.payment_method,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    const fileName = `transactions_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    saveAs(file, fileName);
  } catch (error) {
    console.error("Error exporting transactions:", error);
  }
};
