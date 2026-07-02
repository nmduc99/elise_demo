"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCTS,
  REGIONAL_WAREHOUSES,
  SUPPLIERS,
  getProduct,
} from "@/lib/demo/eliseData";
import StockMoveFields from "./StockMoveFields";
import type { WarehousePageState } from "./useWarehousePage";
import { ArrowRightLeft, PackageMinus, RotateCcw } from "lucide-react";

export function useWarehouseActionDialogs(state: WarehousePageState) {
  const {
    lockedStoreId,
    stockOutAccess,
    transferAccess,
    storeOptions,
    transferOpen,
    setTransferOpen,
    transferForm,
    setTransferForm,
    transferProduct,
    transferAvailable,
    submitTransfer,
    transferLabel,
    canTransfer,
    outOpen,
    setOutOpen,
    returnOpen,
    handleReturnOpenChange,
    moveForm,
    setMoveForm,
    regionalMoveAvailable,
    returnMoveAvailable,
    submitStockOut,
    submitReturnSupplier,
    activeTab,
    storeId,
    handleStoreIdChange,
  } = state;

  const stockOutDialog = stockOutAccess.canWrite ? (
    <Dialog open={outOpen} onOpenChange={setOutOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackageMinus size={16} className="mr-1.5" /> Xuất kho
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Xuất kho khu vực</DialogTitle>
        </DialogHeader>
        <StockMoveFields
          form={moveForm}
          setForm={setMoveForm}
          available={regionalMoveAvailable}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOutOpen(false)}>
            Hủy
          </Button>
          <Button
            className="bg-custom text-white hover:bg-custom-hover"
            onClick={submitStockOut}
          >
            Xác nhận xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  const returnSupplierDialog = stockOutAccess.canWrite ? (
    <Dialog open={returnOpen} onOpenChange={handleReturnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RotateCcw size={16} className="mr-1.5" /> Trả hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trả hàng cho nhà cung cấp</DialogTitle>
        </DialogHeader>
        <StockMoveFields
          form={moveForm}
          setForm={setMoveForm}
          available={returnMoveAvailable}
          showSupplier
          suppliers={SUPPLIERS}
          returnMode={activeTab === "store" ? "store" : "regional"}
          storeId={storeId}
          storeOptions={storeOptions}
          lockedStoreId={lockedStoreId}
          onStoreIdChange={handleStoreIdChange}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleReturnOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-custom text-white hover:bg-custom-hover"
            onClick={submitReturnSupplier}
          >
            Xác nhận trả hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  const transferDialog = canTransfer ? (
    <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
      <DialogTrigger asChild>
        <Button className="bg-custom text-white hover:bg-custom-hover">
          <ArrowRightLeft size={16} className="mr-1.5" /> {transferLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Điều chuyển: Kho khu vực → Kho cửa hàng</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Kho khu vực (nguồn)
            </label>
            <Select
              value={transferForm.regionId}
              onValueChange={(value) =>
                setTransferForm((current) => ({ ...current, regionId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONAL_WAREHOUSES.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.regionId}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Cửa hàng nhận
            </label>
            <Select
              value={transferForm.destStoreId}
              onValueChange={(value) =>
                setTransferForm((current) => ({
                  ...current,
                  destStoreId: value,
                }))
              }
              disabled={!!lockedStoreId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {storeOptions.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Sản phẩm
            </label>
            <Select
              value={transferForm.productId}
              onValueChange={(value) => {
                const product = getProduct(value)!;
                setTransferForm((current) => ({
                  ...current,
                  productId: value,
                  size: product.sizes[0],
                  color: product.colors[0],
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Size
            </label>
            <Select
              value={transferForm.size}
              onValueChange={(value) =>
                setTransferForm((current) => ({ ...current, size: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transferProduct.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Màu
            </label>
            <Select
              value={transferForm.color}
              onValueChange={(value) =>
                setTransferForm((current) => ({ ...current, color: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transferProduct.colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Số lượng (tồn nguồn: {transferAvailable})
            </label>
            <input
              type="number"
              min={1}
              value={transferForm.qty}
              onChange={(event) =>
                setTransferForm((current) => ({
                  ...current,
                  qty: Number(event.target.value),
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setTransferOpen(false)}>
            Hủy
          </Button>
          <Button
            className="bg-custom text-white hover:bg-custom-hover"
            onClick={submitTransfer}
          >
            {transferAccess.isProposeOnly
              ? "Gửi đề nghị"
              : "Xác nhận điều chuyển"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return { stockOutDialog, returnSupplierDialog, transferDialog };
}
