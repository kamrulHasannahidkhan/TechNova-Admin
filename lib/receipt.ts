import jsPDF from "jspdf";

// Shown in the footer of the receipt. Change to your real website.
const WEBSITE = "technovabd.vercel.app";
const SHOP_ADDRESS = "New Eskaton Road - 1217, Dhaka, Bangladesh";
const SHOP_PHONE = "+8801606586207";

type RGB = [number, number, number];
const ORANGE: RGB = [249, 115, 22];
const DARK: RGB = [20, 24, 36];
const GREY: RGB = [100, 110, 125];
const LINE: RGB = [226, 232, 240];
const MINT: RGB = [232, 245, 240];
const GREEN: RGB = [34, 170, 110];
const PANEL: RGB = [244, 246, 250];
const BLUE: RGB = [238, 244, 251];
const PEACH: RGB = [253, 240, 230];
const WHITE: RGB = [255, 255, 255];

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  orderNumber?: string;
  _id: string;
  items: OrderItem[];
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    district?: string;
    thana?: string;
  };
  paymentMethod?: string;
  shippingOption?: string;
  shippingCost?: number;
  subtotal?: number;
  total?: number;
  createdAt: string;
};

const tk = (n = 0) =>
  `Tk ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generateReceiptPDF(order: Order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 14;
  const INNER = W - M * 2;
  const c = order.customer || {};

  const fill = (col: RGB) => doc.setFillColor(col[0], col[1], col[2]);
  const ink = (col: RGB) => doc.setTextColor(col[0], col[1], col[2]);
  const stroke = (col: RGB) => doc.setDrawColor(col[0], col[1], col[2]);

  const created = new Date(order.createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const orderNo = order.orderNumber || order._id.slice(-8).toUpperCase();
  const dateText = created
    .toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(/\b(am|pm)\b/, (s) => s.toUpperCase());

  const logo = (x: number, y: number, size: number, onDark = false) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    ink(onDark ? WHITE : DARK);
    doc.text("Tech", x, y);
    const w = doc.getTextWidth("Tech");
    ink(ORANGE);
    doc.text(".Nova", x + w, y);
  };

  let y = 0;
  const ensure = (h: number) => {
    if (y + h > 272) {
      doc.addPage();
      y = 18;
    }
  };

  // ---------- Header ----------
  fill(ORANGE);
  doc.triangle(0, 0, 24, 0, 0, 20, "F");

  logo(M, 28, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ink(GREY);
  doc.text("Mobile Accessories  |  Gadgets  |  Smart Living", M, 35);
  doc.setFontSize(8);
  doc.text(`${SHOP_ADDRESS}  |  ${SHOP_PHONE}`, M, 40.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  ink(GREY);
  doc.text("BETTER TECH", W - M, 24, { align: "right" });
  doc.text("BRIGHTER DAYS", W - M, 29, { align: "right" });
  stroke(ORANGE);
  doc.setLineWidth(0.8);
  doc.line(W - M - 16, 33, W - M, 33);

  // ---------- Confirmed banner ----------
  fill(MINT);
  doc.roundedRect(M, 44, INNER, 40, 4, 4, "F");

  fill(GREEN);
  doc.circle(M + 16, 64, 9, "F");
  stroke(WHITE);
  doc.setLineWidth(1.6);
  doc.line(M + 11.5, 64.5, M + 14.5, 67.5);
  doc.line(M + 14.5, 67.5, M + 20.5, 60.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  ink(GREY);
  doc.text("ORDER", M + 31, 56);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  ink(DARK);
  doc.text("Confirmed", M + 31, 67);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ink(GREY);
  doc.text(doc.splitTextToSize("Your order has been received and is now being processed.", 70), M + 31, 74);

  stroke(LINE);
  doc.setLineWidth(0.3);
  doc.line(120, 50, 120, 78);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ink(GREY);
  doc.text("Order ID", 128, 56);
  doc.text("Order Date", 128, 72);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  ink(DARK);
  doc.text(orderNo, 128, 63);
  doc.setFontSize(11);
  doc.text(dateText, 128, 79);

  // ---------- Items table ----------
  fill(PANEL);
  doc.roundedRect(M, 92, INNER, 10, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  ink(GREY);
  doc.text("PRODUCT", M + 5, 98.5);
  doc.text("QTY", 130, 98.5, { align: "center" });
  doc.text("UNIT PRICE", 160, 98.5, { align: "right" });
  doc.text("TOTAL", W - M - 5, 98.5, { align: "right" });

  y = 104;
  order.items.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const nameLines: string[] = doc.splitTextToSize(item.name, 90).slice(0, 3);
    const rowH = Math.max(12, nameLines.length * 5 + 6);
    ensure(rowH);

    ink(DARK);
    doc.text(nameLines, M + 5, y + 6);
    doc.setFont("helvetica", "normal");
    doc.text(String(item.quantity), 130, y + 6, { align: "center" });
    doc.text(tk(item.price), 160, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(tk(item.price * item.quantity), W - M - 5, y + 6, { align: "right" });

    y += rowH;
    stroke(LINE);
    doc.setLineWidth(0.2);
    doc.line(M, y, W - M, y);
  });

  // ---------- Delivery charge ----------
  y += 5;
  ensure(16);
  fill(BLUE);
  doc.roundedRect(M, y, INNER, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  ink(DARK);
  doc.text("Delivery Charge", M + 6, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  ink(GREY);
  if (order.shippingOption) doc.text(`(${order.shippingOption})`, M + 6, y + 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  ink(DARK);
  doc.text(tk(order.shippingCost), W - M - 6, y + 9, { align: "right" });
  y += 18;

  // ---------- Total ----------
  ensure(15);
  fill(PEACH);
  doc.roundedRect(M, y, INNER, 13, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  ink(DARK);
  doc.text("Total Payable", M + 6, y + 8.5);
  doc.setFontSize(16);
  ink(ORANGE);
  doc.text(tk(order.total), W - M - 6, y + 9, { align: "right" });
  y += 19;

  // ---------- Payment + delivery address ----------
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const lines: string[] = [];
  if (c.fullName) lines.push(c.fullName);
  if (c.phone) lines.push(`Phone: ${c.phone}`);
  if (c.address) lines.push(...doc.splitTextToSize(c.address, 62));
  const area = [c.thana, c.district].filter(Boolean).join(", ");
  if (area) lines.push(area);

  const boxH = Math.max(28, 14 + lines.length * 4.6);
  const boxW = (INNER - 6) / 2;
  ensure(boxH + 4);

  const box = (bx: number, title: string, body: string[]) => {
    fill(BLUE);
    doc.roundedRect(bx, y, boxW, boxH, 3, 3, "F");
    stroke(ORANGE);
    doc.setLineWidth(0.8);
    doc.circle(bx + 9, y + 11, 3.5, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    ink(DARK);
    doc.text(title, bx + 17, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    ink(GREY);
    doc.text(body, bx + 17, y + 15);
  };

  box(M, "Payment Method", [order.paymentMethod === "bkash" ? "bKash" : "Cash on Delivery (COD)"]);
  box(M + boxW + 6, "Delivery Address", lines.length ? lines : ["-"]);
  y += boxH + 10;

  // ---------- Thank you ----------
  ensure(62);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  ink(DARK);
  const tyW = doc.getTextWidth("Thank You!");
  doc.text("Thank You!", W / 2 - 4, y + 10, { align: "center" });
  const hx = W / 2 - 4 + tyW / 2 + 7;
  const hy = y + 5;
  fill(ORANGE);
  doc.circle(hx - 1.4, hy, 1.5, "F");
  doc.circle(hx + 1.4, hy, 1.5, "F");
  doc.triangle(hx - 2.8, hy + 0.6, hx + 2.8, hy + 0.6, hx, hy + 3.8, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ink(GREY);
  doc.text("For choosing Tech.Nova.", W / 2, y + 19, { align: "center" });
  doc.text("We're always here to bring you the best tech & accessories.", W / 2, y + 24, { align: "center" });
  y += 32;

  stroke(LINE);
  doc.setLineWidth(0.2);
  doc.line(M, y, W - M, y);
  y += 8;

  // ---------- Feature row ----------
  const feats = [
    ["100%", "Original Products"],
    ["Dedicated", "Support"],
    ["Fast & Reliable", "Delivery"],
  ];
  const colW = INNER / 3;
  feats.forEach((f, i) => {
    const cx = M + colW * i + colW / 2;
    stroke(ORANGE);
    doc.setLineWidth(0.7);
    doc.circle(cx, y + 4, 4, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    ink(GREY);
    doc.text(f[0], cx, y + 13, { align: "center" });
    doc.text(f[1], cx, y + 17, { align: "center" });
    if (i > 0) {
      stroke(LINE);
      doc.setLineWidth(0.2);
      doc.line(M + colW * i, y, M + colW * i, y + 18);
    }
  });

  // ---------- Footer ----------
  fill(ORANGE);
  doc.triangle(W - 26, 281, W, 281, W, 256, "F");
  fill(DARK);
  doc.rect(0, 281, W, 16, "F");
  logo(M, 292, 13, true);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ink(WHITE);
  doc.text(WEBSITE, W - M, 291.5, { align: "right" });

  doc.save(`receipt-${orderNo}.pdf`);
}
