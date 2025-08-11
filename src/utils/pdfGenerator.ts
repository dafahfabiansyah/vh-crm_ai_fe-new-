import jsPDF from "jspdf";
import type { Transaction } from "../types/interface";

// Format date in Indonesian locale
const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long", 
    year: "numeric",
  });
};

// Generate invoice PDF for a specific transaction
export const generateInvoicePDF = (
  transaction: Transaction,
  getPlanNameById: (id: string) => string = (id: string) => id
): void => {
  try {
    const doc = new jsPDF();
    let currentY = 20;
    
    // Header with company name and invoice number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 0); // Green color for company name
    doc.text("Tumbuhin", 20, currentY);
    
    // Invoice number on the right
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 150, currentY);
    currentY += 5;
    
    // Invoice ID on the right (smaller font)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const invoiceIdText = `${transaction.id}`;
    doc.text(invoiceIdText, 150, currentY);
    
    currentY += 25;
    
    // Two column layout - start both columns at same Y position
    const startY = currentY;
    
    // Left column - Company info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DITERBITKAN ATAS NAMA", 20, startY);
    let leftY = startY + 8;
    
    doc.setFont("helvetica", "normal");
    // doc.text("Penyedia Layanan", 20, leftY);
    // doc.text(": Tumbuhin", 80, leftY);
    // leftY += 5;
    
    doc.text("Alamat : ", 20, leftY);
    leftY += 5;
    // Company address with wrapping
    const companyAddress = "Ruko City Square Business Park Blok B-61\nJl Peta Selatan, RT.010/RW.001\nKalideres - Jakarta Barat, DKI Jakarta 11840";
    const addressLines = companyAddress.split('\n');
    addressLines.forEach(line => {
      doc.text(line, 20, leftY);
      leftY += 5;
    });
    
    // doc.text("Email", 20, leftY);
    // doc.text(": care@tumbuhin.com", 80, leftY);
    // leftY += 15;
    
    // Right column - Transaction info (start at same Y as left column)
    let rightY = startY;
    doc.setFont("helvetica", "bold");
    doc.text("DETAIL TRANSAKSI", 120, rightY);
    rightY += 8;
    
    doc.setFont("helvetica", "normal");
    // doc.text("Transaction ID", 120, rightY);
    // doc.text(`: ${transaction.id}`, 160, rightY);
    // rightY += 5;
    
    doc.text("Tanggal Transaksi", 120, rightY);
    doc.text(`: ${formatDate(transaction.created_at)}`, 160, rightY);
    rightY += 5;
    
    doc.text("Metode Pembayaran", 120, rightY);
    const paymentMethod = transaction.payment_method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    doc.text(`: ${paymentMethod}`, 160, rightY);
    rightY += 5;
    
    doc.text("Status", 120, rightY);
    doc.setTextColor(0, 150, 0);
    doc.text(": PAID", 160, rightY);
    doc.setTextColor(0, 0, 0);
    
    // Use the higher Y position from both columns for continuation
    currentY = Math.max(leftY, rightY) + 15;
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY, 190, currentY);
    currentY += 15;
    
    // Transaction table header
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("DETAIL PEMBELIAN", 20, currentY);
    doc.text("TIPE", 80, currentY);
    doc.text("JUMLAH", 120, currentY);
    doc.text("SUBSCRIPTION", 150, currentY);
    currentY += 8;
    
    // Table separator
    doc.setLineWidth(0.3);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    
    // Transaction data
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const planName = getPlanNameById(transaction.id_subscription);
    doc.text(planName, 20, currentY);
    
    const transactionType = transaction.transaction_type === "sub_purchase" 
      ? "Purchase" 
      : transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1);
    
    doc.text(transactionType, 80, currentY);
    doc.text(transaction.quantity.toString(), 120, currentY);
    doc.text(planName, 150, currentY);
    
    currentY += 5;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Subscription Plan", 20, currentY);
    
    currentY += 20;
    
    // Footer section
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 150, 0);
    doc.text("✓ TRANSAKSI BERHASIL", 20, currentY);
    currentY += 15;
    
    // Footer info
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice ini sah dan diproses oleh sistem otomatis.", 20, currentY);
    currentY += 5;
    doc.text("Silakan hubungi care@tumbuhin.com apabila membutuhkan bantuan.", 20, currentY);
    
    // Date stamp on right
    const now = new Date();
    const dateStamp = `Dibuat pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')} WIB`;
    doc.text(dateStamp, 120, currentY);
    
    // Save the PDF
    const fileName = `invoice_${transaction.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
  }
};
