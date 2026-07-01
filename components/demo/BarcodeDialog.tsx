"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { productBarcode, type Product } from "@/lib/demo/eliseData";

interface BarcodeDialogProps {
    product: Product | null;
    onClose: () => void;
}

/** Read-only dialog listing a cosmetic barcode + SKU per product variant. */
export default function BarcodeDialog({ product, onClose }: BarcodeDialogProps) {
    return (
        <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Barcode / SKU theo biến thể</DialogTitle>
                </DialogHeader>
                {product && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">{product.name}</p>
                        <div className="max-h-80 space-y-2 overflow-y-auto">
                            {product.sizes.flatMap((size) =>
                                product.colors.map((color) => {
                                    const code = productBarcode(product.sku, size, color);
                                    return (
                                        <div key={`${size}-${color}`} className="rounded-lg border p-2.5">
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>{product.sku}-{size}-{color}</span>
                                                <span>{size} / {color}</span>
                                            </div>
                                            <div
                                                className="mt-1.5 h-9 w-full rounded"
                                                style={{
                                                    backgroundImage:
                                                        "repeating-linear-gradient(90deg, #111 0, #111 2px, #fff 2px, #fff 4px)",
                                                }}
                                            />
                                            <p className="mt-1 text-center font-mono text-xs tracking-widest text-slate-700">{code}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
