"use client";

import AccessBanner from "@/components/demo/AccessBanner";
import WriteGuard from "@/components/demo/WriteGuard";
import { useDemoAccess } from "@/components/demo/useDemoAccess";
import RoleGuard from "@/components/demo/RoleGuard";
import StatCard from "@/components/demo/StatCard";
import BarcodeDialog from "@/components/demo/BarcodeDialog";
import ProductFormDialog, { type ProductDraft } from "@/components/demo/catalog/ProductFormDialog";
import { CategoryDialog, BrandDialog } from "@/components/demo/catalog/CategoryBrandDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    BRANDS,
    CATEGORIES,
    PRODUCTS,
    type Brand,
    type Category,
    type Product,
} from "@/lib/demo/eliseData";
import { formatNumber, formatVnd } from "@/lib/demo/format";
import Pagination from "@/components/demo/Pagination";
import { usePagination } from "@/lib/demo/usePagination";
import { useCrudCollection } from "@/lib/demo/useCrudCollection";
import {
    Barcode as BarcodeIcon,
    Layers,
    Package,
    Pencil,
    Plus,
    Shirt,
    Tag,
    Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

function newId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}`;
}

export default function CatalogPage() {
    const { toast } = useToast();
    const productAccess = useDemoAccess("products");

    const products = useCrudCollection<Product>("elise-demo-products", PRODUCTS);
    const categories = useCrudCollection<Category>("elise-demo-categories", CATEGORIES);
    const brands = useCrudCollection<Brand>("elise-demo-brands", BRANDS);

    const categoryName = (id: string) => categories.items.find((c) => c.id === id)?.name ?? "-";
    const brandName = (id: string) => brands.items.find((b) => b.id === id)?.name ?? "-";

    /* ---------------- Product dialog ---------------- */
    const [productOpen, setProductOpen] = useState(false);
    const [draft, setDraft] = useState<ProductDraft | null>(null);

    const openNewProduct = () => {
        setDraft({
            id: "",
            sku: "",
            name: "",
            categoryId: categories.items[0]?.id ?? "",
            brandId: brands.items[0]?.id ?? "",
            costPrice: 0,
            salePrice: 0,
            sizes: "S, M, L, XL",
            colors: "Đen, Trắng",
            unit: "Cái",
            barcode: "",
            description: "",
            vatPercent: 10,
            status: "active",
            weightGram: 0,
        });
        setProductOpen(true);
    };

    const openEditProduct = (p: Product) => {
        setDraft({
            id: p.id,
            sku: p.sku,
            name: p.name,
            categoryId: p.categoryId,
            brandId: p.brandId,
            costPrice: p.costPrice,
            salePrice: p.salePrice,
            sizes: p.sizes.join(", "),
            colors: p.colors.join(", "),
            unit: p.unit ?? "Cái",
            barcode: p.barcode ?? "",
            description: p.description ?? "",
            vatPercent: p.vatPercent ?? 10,
            status: p.status ?? "active",
            weightGram: p.weightGram ?? 0,
        });
        setProductOpen(true);
    };

    const saveProduct = () => {
        if (!draft) return;
        if (!draft.name.trim() || !draft.sku.trim()) {
            toast({ title: "Thiếu tên hoặc SKU", variant: "destructive" });
            return;
        }
        const parsed = {
            sku: draft.sku.trim().toUpperCase(),
            name: draft.name.trim(),
            categoryId: draft.categoryId,
            brandId: draft.brandId,
            costPrice: Number(draft.costPrice) || 0,
            salePrice: Number(draft.salePrice) || 0,
            sizes: draft.sizes.split(",").map((s) => s.trim()).filter(Boolean),
            colors: draft.colors.split(",").map((s) => s.trim()).filter(Boolean),
            unit: draft.unit || "Cái",
            barcode: draft.barcode.trim(),
            description: draft.description.trim(),
            vatPercent: Number(draft.vatPercent) || 0,
            status: draft.status,
            weightGram: Number(draft.weightGram) || 0,
        };
        if (draft.id) {
            products.update(draft.id, parsed);
            toast({ title: "Đã cập nhật sản phẩm", description: parsed.name, variant: "success" });
        } else {
            products.add({ id: newId("p"), ...parsed });
            toast({ title: "Đã thêm sản phẩm", description: parsed.name, variant: "success" });
        }
        setProductOpen(false);
    };

    const deleteProduct = (p: Product) => {
        products.remove(p.id);
        toast({ title: "Đã xóa sản phẩm", description: p.name });
    };

    /* ---------------- Barcode dialog ---------------- */
    const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

    /* ---------------- Category dialog ---------------- */
    const [catOpen, setCatOpen] = useState(false);
    const [catDraft, setCatDraft] = useState<{ id: string; name: string }>({ id: "", name: "" });

    const saveCategory = () => {
        if (!catDraft.name.trim()) {
            toast({ title: "Thiếu tên danh mục", variant: "destructive" });
            return;
        }
        if (catDraft.id) {
            categories.update(catDraft.id, { name: catDraft.name.trim() });
        } else {
            categories.add({ id: newId("cat"), name: catDraft.name.trim() });
        }
        setCatOpen(false);
    };

    /* ---------------- Brand dialog ---------------- */
    const [brandOpen, setBrandOpen] = useState(false);
    const [brandDraft, setBrandDraft] = useState<Brand>({ id: "", name: "", note: "" });

    const saveBrand = () => {
        if (!brandDraft.name.trim()) {
            toast({ title: "Thiếu tên thương hiệu", variant: "destructive" });
            return;
        }
        if (brandDraft.id) {
            brands.update(brandDraft.id, { name: brandDraft.name.trim(), note: brandDraft.note.trim() });
        } else {
            brands.add({ id: newId("br"), name: brandDraft.name.trim(), note: brandDraft.note.trim() });
        }
        setBrandOpen(false);
    };

    const totalVariants = useMemo(
        () => products.items.reduce((s, p) => s + p.sizes.length * p.colors.length, 0),
        [products.items]
    );

    const productPage = usePagination(products.items, 10);

    return (
        <RoleGuard permission="products">
            <div className="w-full space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h1>
                        <p className="text-sm text-slate-500">
                            Danh mục, thương hiệu, sản phẩm, biến thể (size/màu), SKU & barcode
                        </p>
                    </div>
                </div>

                <AccessBanner access={productAccess} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Sản phẩm" value={formatNumber(products.items.length)} icon={Package} accent="primary" />
                    <StatCard label="Danh mục" value={formatNumber(categories.items.length)} icon={Layers} accent="blue" />
                    <StatCard label="Thương hiệu" value={formatNumber(brands.items.length)} icon={Tag} accent="amber" />
                    <StatCard label="Biến thể (SKU x size x màu)" value={formatNumber(totalVariants)} icon={Shirt} accent="green" />
                </div>

                <Tabs defaultValue="products">
                    <TabsList>
                        <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                        <TabsTrigger value="categories">Danh mục</TabsTrigger>
                        <TabsTrigger value="brands">Thương hiệu</TabsTrigger>
                    </TabsList>

                    {/* Products */}
                    <TabsContent value="products" className="space-y-3">
                        <WriteGuard permission="products">
                            <div className="flex justify-end">
                                <Button className="bg-custom text-white hover:bg-custom-hover" onClick={openNewProduct}>
                                    <Plus size={16} className="mr-1.5" /> Thêm sản phẩm
                                </Button>
                            </div>
                        </WriteGuard>
                        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                                        <th className="px-4 py-3 font-medium">SKU</th>
                                        <th className="px-4 py-3 font-medium">Thương hiệu</th>
                                        <th className="px-4 py-3 font-medium">Danh mục</th>
                                        <th className="px-4 py-3 text-right font-medium">Giá vốn</th>
                                        <th className="px-4 py-3 text-right font-medium">Giá bán</th>
                                        <th className="px-4 py-3 text-center font-medium">Biến thể</th>
                                        <th className="px-4 py-3 text-center font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {productPage.pageItems.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-slate-100 text-custom">
                                                        <Shirt size={18} />
                                                    </span>
                                                    <span className="font-medium text-slate-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                                            <td className="px-4 py-3 text-slate-600">{brandName(p.brandId)}</td>
                                            <td className="px-4 py-3 text-slate-600">{categoryName(p.categoryId)}</td>
                                            <td className="px-4 py-3 text-right text-slate-500">{formatVnd(p.costPrice)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatVnd(p.salePrice)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                                                    {p.sizes.length} size · {p.colors.length} màu
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setBarcodeProduct(p)}
                                                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                                                        title="Xem barcode"
                                                    >
                                                        <BarcodeIcon size={16} />
                                                    </button>
                                                    {productAccess.canWrite && (
                                                        <>
                                                            <button
                                                                onClick={() => openEditProduct(p)}
                                                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                                                title="Sửa"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteProduct(p)}
                                                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination
                                page={productPage.page}
                                totalPages={productPage.totalPages}
                                total={productPage.total}
                                start={productPage.start}
                                end={productPage.end}
                                onPageChange={productPage.setPage}
                                unit="sản phẩm"
                            />
                        </div>
                    </TabsContent>

                    {/* Categories */}
                    <TabsContent value="categories" className="space-y-3">
                        <div className="flex justify-end">
                            <Button
                                className="bg-custom text-white hover:bg-custom-hover"
                                onClick={() => {
                                    setCatDraft({ id: "", name: "" });
                                    setCatOpen(true);
                                }}
                            >
                                <Plus size={16} className="mr-1.5" /> Thêm danh mục
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {categories.items.map((c) => {
                                const count = products.items.filter((p) => p.categoryId === c.id).length;
                                return (
                                    <div key={c.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800">{c.name}</p>
                                            <p className="text-xs text-slate-400">{count} sản phẩm</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setCatDraft({ id: c.id, name: c.name });
                                                    setCatOpen(true);
                                                }}
                                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => categories.remove(c.id)}
                                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Brands */}
                    <TabsContent value="brands" className="space-y-3">
                        <div className="flex justify-end">
                            <Button
                                className="bg-custom text-white hover:bg-custom-hover"
                                onClick={() => {
                                    setBrandDraft({ id: "", name: "", note: "" });
                                    setBrandOpen(true);
                                }}
                            >
                                <Plus size={16} className="mr-1.5" /> Thêm thương hiệu
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {brands.items.map((b) => {
                                const count = products.items.filter((p) => p.brandId === b.id).length;
                                return (
                                    <div key={b.id} className="flex items-start justify-between rounded-xl border bg-white p-4 shadow-sm">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-800">{b.name}</p>
                                            <p className="text-xs text-slate-500">{b.note}</p>
                                            <p className="mt-1 text-xs text-slate-400">{count} sản phẩm</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setBrandDraft(b);
                                                    setBrandOpen(true);
                                                }}
                                                className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => brands.remove(b.id)}
                                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <ProductFormDialog
                open={productOpen}
                onOpenChange={setProductOpen}
                draft={draft}
                setDraft={setDraft}
                onSave={saveProduct}
                brands={brands.items}
                categories={categories.items}
            />

            <BarcodeDialog product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />

            <CategoryDialog
                open={catOpen}
                onOpenChange={setCatOpen}
                draft={catDraft}
                setDraft={setCatDraft}
                onSave={saveCategory}
            />

            <BrandDialog
                open={brandOpen}
                onOpenChange={setBrandOpen}
                draft={brandDraft}
                setDraft={setBrandDraft}
                onSave={saveBrand}
            />
        </RoleGuard>
    );
}
