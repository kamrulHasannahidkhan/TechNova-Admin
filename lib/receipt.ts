import jsPDF from "jspdf";

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  _id: string;
  items: OrderItem[];
  customer?: { fullName?: string; phone?: string; email?: string; address?: string; district?: string };
  shippingOption?: string;
  shippingCost?: number;
  subtotal?: number;
  total?: number;
  orderStatus?: string;
  createdAt: string;
};

export function generateReceiptPDF(order: Order) {
  const doc = new jsPDF({ unit: "mm", format: [80, 150 + order.items.length * 6] });
  const width = 80;
  const centerX = width / 2;
  let y = 10;

  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text("RECEIPT", centerX, y, { align: "center" });
  y += 6;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text("*".repeat(30), centerX, y, { align: "center" });
  y += 6;

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("TECHNOVA", centerX, y, { align: "center" });
  y += 5;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.text("Farmview SuperMarket, Farmgate", centerX, y, { align: "center" });
  y += 4;
  doc.text("Dhaka 1215, Bangladesh", centerX, y, { align: "center" });
  y += 4;
  doc.text("01813335789", centerX, y, { align: "center" });
  y += 6;

  doc.text("-".repeat(38), centerX, y, { align: "center" });
  y += 6;

  doc.setFontSize(7.5);
  doc.text(`Order: ${order._id.slice(-8).toUpperCase()}`, 5, y);
  y += 4;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 5, y);
  y += 4;
  if (order.customer?.fullName) {
    doc.text(`Customer: ${order.customer.fullName}`, 5, y);
    y += 4;
  }
  if (order.customer?.phone) {
    doc.text(`Phone: ${order.customer.phone}`, 5, y);
    y += 4;
  }
  y += 2;

  doc.text("-".repeat(38), centerX, y, { align: "center" });
  y += 6;

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text("ITEM", 5, y);
  doc.text("AMOUNT", width - 5, y, { align: "right" });
  y += 5;
  doc.setFont("courier", "normal");

  order.items.forEach((item) => {
    const lineTotal = (item.price * item.quantity).toLocaleString();
    const label = `${item.quantity}x ${item.name}`;
    const truncated = label.length > 26 ? label.slice(0, 24) + "…" : label;
    doc.text(truncated, 5, y);
    doc.text(`${lineTotal}`, width - 5, y, { align: "right" });
    y += 5;
  });

  y += 1;
  doc.text("-".repeat(38), centerX, y, { align: "center" });
  y += 7;

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  if (order.subtotal !== undefined) {
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text("Subtotal", 5, y);
    doc.text(`${order.subtotal.toLocaleString()}`, width - 5, y, { align: "right" });
    y += 5;
  }
  if (order.shippingCost !== undefined) {
    doc.text("Shipping", 5, y);
    doc.text(`${order.shippingCost.toLocaleString()}`, width - 5, y, { align: "right" });
    y += 6;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", 5, y);
  doc.text(`TK ${(order.total || 0).toLocaleString()}`, width - 5, y, { align: "right" });
  y += 8;

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.text("-".repeat(38), centerX, y, { align: "center" });
  y += 6;

  if (order.orderStatus) {
    doc.text(`Status: ${order.orderStatus.toUpperCase()}`, centerX, y, { align: "center" });
    y += 6;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("THANK YOU", centerX, y, { align: "center" });
  y += 5;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Please visit again!", centerX, y, { align: "center" });

  doc.save(`receipt-${order._id.slice(-8)}.pdf`);
}
