"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCTS, getProduct } from "@/lib/demo/eliseData";
import { formatNumber, formatVnd } from "@/lib/demo/format";
import { inputClass, labelClass } from "@/lib/demo/formClasses";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { emptyPoLine, type PoLineDraft } from "./purchaseOrderUtils";

interface PoLineItemsEditorProps {
    lines: PoLineDraft[];
    onChange: (lines: PoLineDraft[]) => void;
    readOnly?: boolean;
}

export default function PoLineItemsEditor({
    lines,
    onChange,
    readOnly = false,
}: PoLineItemsEditorProps) {
  const [picker, setPicker] = useState<PoLineDraft>(emptyPoLine());

  const addLine = () => {
    if (!picker.productId || picker.quantity < 1) {
      return;
    }
    const existingIndex = lines.findIndex(
      (line) => line.productId === picker.productId,
    );
    if (existingIndex >= 0) {
      const next = [...lines];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + picker.quantity,
        unitCost: picker.unitCost,
      };
      onChange(next);
    } else {
      onChange([...lines, { ...picker }]);
    }
    setPicker(emptyPoLine());
  };

  const updateLine = (index: number, patch: Partial<PoLineDraft>) => {
    const next = [...lines];
    next[index] = { ...next[index], ...patch };
    if (patch.productId) {
      const product = getProduct(patch.productId);
      if (product) {
        next[index].unitCost = product.costPrice;
      }
    }
    onChange(next);
  };

  const removeLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Sản phẩm nhập
      </p>

      {!readOnly && (
      <div className="rounded-lg border bg-slate-50/60 p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-5">
            <label className={labelClass}>Sản phẩm</label>
            <Select
              value={picker.productId}
              onValueChange={(productId) => {
                const product = getProduct(productId);
                setPicker({
                  productId,
                  quantity: picker.quantity,
                  unitCost: product?.costPrice ?? 0,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.filter((p) => p.status === "active").map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.sku} · {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Số lượng</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={picker.quantity}
              onChange={(e) =>
                setPicker({ ...picker, quantity: Number(e.target.value) })
              }
            />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Đơn giá (vnđ)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={picker.unitCost}
              onChange={(e) =>
                setPicker({ ...picker, unitCost: Number(e.target.value) })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full"
              onClick={addLine}
            >
              <Plus size={14} className="mr-1" /> Thêm
            </Button>
          </div>
        </div>
      </div>
      )}

      {lines.length > 0 ? (
        <div className="h-64 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase text-slate-500 shadow-[0_1px_0_0_rgb(226_232_240)]">
              <tr>
                <th className="px-3 py-2 font-medium">Sản phẩm</th>
                <th className="px-3 py-2 text-right font-medium">SL</th>
                <th className="px-3 py-2 text-right font-medium">Đơn giá</th>
                <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
                {!readOnly && (
                  <th className="px-3 py-2 text-center font-medium">Xóa</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {lines.map((line, index) => {
                const product = getProduct(line.productId);
                const lineTotal = line.quantity * line.unitCost;
                return (
                  <tr
                    key={`${line.productId}-${index}`}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">
                        {product?.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-400">{product?.sku}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {readOnly ? (
                        <span className="text-slate-700">{formatNumber(line.quantity)}</span>
                      ) : (
                      <input
                        type="number"
                        min={1}
                        className={`${inputClass} h-8 w-20 text-right`}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(index, {
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {readOnly ? (
                        <span className="text-slate-700">{formatVnd(line.unitCost)}</span>
                      ) : (
                      <input
                        type="number"
                        min={0}
                        className={`${inputClass} h-8 w-28 text-right`}
                        value={line.unitCost}
                        onChange={(e) =>
                          updateLine(index, {
                            unitCost: Number(e.target.value),
                          })
                        }
                      />
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-700">
                      {formatVnd(lineTotal)}
                    </td>
                    {!readOnly && (
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center rounded-lg border border-dashed px-4 text-center text-sm text-slate-400">
          {readOnly ? "Không có sản phẩm trong đơn." : "Chưa có sản phẩm. Chọn sản phẩm và bấm Thêm."}
        </div>
      )}

      {lines.length > 0 && (
        <p className="text-right text-xs text-slate-500">
          {formatNumber(lines.length)} mặt hàng ·{" "}
          {formatNumber(lines.reduce((s, l) => s + l.quantity, 0))} sản phẩm
        </p>
      )}
    </div>
  );
}
