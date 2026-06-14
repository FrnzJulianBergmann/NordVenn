import { db } from "../db"

export async function getUserInvoices(userId: string) {
  return db.invoices.findByUser(userId)
}

export async function getInvoiceById(invoiceId: string, userId: string) {
  const invoice = await db.invoices.findById(invoiceId)
  if (!invoice || invoice.userId !== userId) throw new Error("Invoice not found")
  return invoice
}
