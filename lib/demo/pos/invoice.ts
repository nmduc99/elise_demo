import { getStore } from "@/lib/demo/eliseData";
import { formatVnd } from "@/lib/demo/format";

export interface CartLine {
    productId: string;
    size: string;
    color: string;
    qty: number;
}

export interface SaleLine {
    name: string;
    size: string;
    color: string;
    qty: number;
    price: number;
}

export interface Sale {
    id: string;
    code: string;
    createdAt: string;
    storeId: string;
    customerName: string;
    subtotal: number;
    discount: number;
    total: number;
    itemCount: number;
    lines: SaleLine[];
}

/** Opens a printable invoice for a sale in a new window. */
export function printInvoice(sale: Sale): void {
    const store = getStore(sale.storeId);
    const rows = sale.lines
        .map(
            (l) =>
                `<tr><td>${l.name} <small>(${l.size}/${l.color})</small></td><td style="text-align:center">${l.qty}</td><td style="text-align:right">${formatVnd(
                    l.price,
                )}</td><td style="text-align:right">${formatVnd(l.price * l.qty)}</td></tr>`,
        )
        .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${sale.code}</title>
<style>body{font-family:Arial,sans-serif;max-width:420px;margin:24px auto;color:#111}h2{text-align:center;margin:0;color:#FF6B35}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}td,th{padding:6px 4px;border-bottom:1px solid #eee}th{text-align:left;font-size:11px;text-transform:uppercase;color:#888}.tot{display:flex;justify-content:space-between;margin-top:6px;font-size:14px}.grand{font-weight:bold;font-size:18px;color:#FF6B35}small{color:#888}</style>
</head><body onload="window.print()">
<h2>ELISE</h2>
<p style="text-align:center;margin:4px 0;font-size:12px">${store?.name ?? ""}<br>${store?.address ?? ""}</p>
<hr>
<p style="font-size:12px">Hóa đơn: <b>${sale.code}</b><br>Ngày: ${new Date(sale.createdAt).toLocaleString("vi-VN")}<br>Khách hàng: ${sale.customerName}</p>
<table><thead><tr><th>Sản phẩm</th><th style="text-align:center">SL</th><th style="text-align:right">Đơn giá</th><th style="text-align:right">T.Tiền</th></tr></thead><tbody>${rows}</tbody></table>
<div class="tot"><span>Tạm tính</span><span>${formatVnd(sale.subtotal)}</span></div>
<div class="tot"><span>Giảm giá</span><span>-${formatVnd(sale.discount)}</span></div>
<div class="tot grand"><span>TỔNG CỘNG</span><span>${formatVnd(sale.total)}</span></div>
<p style="text-align:center;margin-top:20px;font-size:12px">Cảm ơn quý khách!</p>
</body></html>`;
    const w = window.open("", "_blank", "width=480,height=640");
    if (w) {
        w.document.write(html);
        w.document.close();
    }
}
