import jsPDF from "jspdf";

type Item = { name: string; price: number; quantity: number };
type AdminOrder = {
  _id: string;
  orderNumber?: string;
  items: Item[];
  customer?: { fullName?: string; phone?: string; address?: string; district?: string; thana?: string };
  shippingCost?: number;
  total?: number;
  createdAt: string;
};

const tk = (n = 0) =>
  `Tk ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generateAdminReceiptPDF(order: AdminOrder, discount: number) {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = 148;
  const M = 10;
  const R = W - M;
  const c = order.customer || {};

  const itemsSum = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = order.shippingCost || 0;
  const total = order.total ?? itemsSum + shipping;
  const off = Math.min(Math.max(discount || 0, 0), total);
  const payable = total - off;

  const orderNo = order.orderNumber || order._id.slice(-8).toUpperCase();
  const when = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const rule = (yy: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(M, yy, R, yy);
  };

  let y = 16;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 24, 36);
  doc.text("Tech", M, y);
  const techW = doc.getTextWidth("Tech");
  doc.setTextColor(249, 115, 22);
  doc.text(".Nova", M + techW, y);

  doc.setFontSize(9);
  doc.setTextColor(100, 110, 125);
  doc.text("ADMIN COPY", R, y - 4, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Internal use only", R, y, { align: "right" });

  y += 7;
  rule(y);
  y += 7;

  // Order info
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 24, 36);
  doc.text(`Order ${orderNo}`, M, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 110, 125);
  doc.text(when, R, y, { align: "right" });
  y += 7;

  // Customer
  if (c.fullName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 24, 36);
    doc.text(c.fullName, M, y);
    y += 5;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 110, 125);
  if (c.phone) {
    doc.text(`Phone: ${c.phone}`, M, y);
    y += 4.5;
  }
  const addr = [c.address, c.thana, c.district].filter(Boolean).join(", ");
  if (addr) {
    const addrLines: string[] = doc.splitTextToSize(addr, W - M * 2);
    doc.text(addrLines, M, y);
    y += addrLines.length * 4.5;
  }
  y += 2;
  rule(y);
  y += 6;

  // Items header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 110, 125);
  doc.text("ITEM", M, y);
  doc.text("QTY", 88, y, { align: "center" });
  doc.text("PRICE", 114, y, { align: "right" });
  doc.text("AMOUNT", R, y, { align: "right" });
  y += 3;
  rule(y);
  y += 5;

  // Items
  doc.setFontSize(8.5);
  order.items.forEach((item) => {
    const nameLines: string[] = doc.splitTextToSize(item.name, 62).slice(0, 3);
    const rowH = nameLines.length * 4.2 + 3;
    if (y + rowH > 180) {
      doc.addPage();
      y = 16;
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 24, 36);
    doc.text(nameLines, M, y);
    doc.text(String(item.quantity), 88, y, { align: "center" });
    doc.text(tk(item.price), 114, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(tk(item.price * item.quantity), R, y, { align: "right" });
    y += rowH;
  });

  rule(y - 1);
  y += 6;
  if (y > 150) {
    doc.addPage();
    y = 16;
  }

  // Totals
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    if (bold) doc.setTextColor(20, 24, 36);
    else doc.setTextColor(100, 110, 125);
    doc.text(label, M, y);
    doc.text(value, R, y, { align: "right" });
    y += bold ? 7 : 5.5;
  };
  row("Items subtotal", tk(itemsSum));
  row("Delivery charge", tk(shipping));
  row("Original price", tk(total), true);
  if (off > 0) row("Deducted", `- ${tk(off)}`);

  // Payable
  y += 2;
  doc.setFillColor(249, 115, 22);
  doc.roundedRect(M, y, W - M * 2, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Discounted Price", M + 5, y + 9);
  doc.setFontSize(15);
  doc.text(tk(payable), R - 5, y + 9.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 125);
  doc.text("For admin records only - not a customer receipt", W / 2, y + 22, { align: "center" });

  doc.save(`admin-receipt-${orderNo}.pdf`);
}
