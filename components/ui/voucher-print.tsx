"use client";

import React from "react";

export interface VoucherPrintData {
    // Branch info
    branchName?: string;
    branchPhone?: string;
    branchAddress?: string;
    
    // Voucher info
    voucherCode: string;
    voucherDate: string;
    voucherType: "receipt" | "payment"; // "receipt" = thu, "payment" = chi
    
    // Payer/Recipient info
    payerName?: string;
    payerPhone?: string;
    payerAddress?: string;
    reason?: string;
    
    // Amount
    amount: number;
    
    // Signatures
    creatorName?: string;
    payerSignatureName?: string;
    cashierName?: string;
    
    // Additional info (optional, for customization)
    additionalInfo?: Record<string, any>;
}

interface VoucherPrintProps {
    data: VoucherPrintData;
    className?: string;
}

// Convert number to Vietnamese words
const numberToVietnameseWords = (num: number): string => {
    const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
    const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];
    
    if (num === 0) return 'không đồng chẵn';
    if (num < 0) return 'âm ' + numberToVietnameseWords(-num);
    
    const readThreeDigits = (n: number): string => {
        if (n === 0) return '';
        
        let result = '';
        const h = Math.floor(n / 100);
        const remainder = n % 100;
        
        if (h > 0) {
            result += hundreds[h] + ' ';
        }
        
        if (remainder >= 10 && remainder < 20) {
            if (remainder === 10) result += 'mười ';
            else if (remainder === 11) result += 'mười một ';
            else result += 'mười ' + ones[remainder % 10] + ' ';
        } else if (remainder >= 20) {
            const t = Math.floor(remainder / 10);
            const o = remainder % 10;
            result += tens[t] + ' ';
            if (o > 0) {
                if (o === 1) result += 'mốt ';
                else if (o === 5) result += 'lăm ';
                else result += ones[o] + ' ';
            }
        } else if (remainder > 0) {
            if (h > 0) result += 'lẻ ';
            result += ones[remainder] + ' ';
        }
        
        return result.trim();
    };
    
    let result = '';
    const billions = Math.floor(num / 1000000000);
    if (billions > 0) {
        result += readThreeDigits(billions) + ' tỷ ';
        num %= 1000000000;
    }
    
    const millions = Math.floor(num / 1000000);
    if (millions > 0) {
        result += readThreeDigits(millions) + ' triệu ';
        num %= 1000000;
    }
    
    const thousands = Math.floor(num / 1000);
    if (thousands > 0) {
        result += readThreeDigits(thousands) + ' nghìn ';
        num %= 1000;
    }
    
    if (num > 0) {
        result += readThreeDigits(num) + ' ';
    }
    
    return result.trim() + ' đồng chẵn';
};

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " đồng";

export default function VoucherPrint({ data, className = "" }: VoucherPrintProps) {
    const isReceipt = data.voucherType === "receipt";
    const voucherTitle = isReceipt ? "PHIẾU THU" : "PHIẾU CHI";
    const voucherCodeLabel = isReceipt ? "Mã phiếu thu" : "Mã phiếu chi";
    const payerLabel = isReceipt ? "Họ tên người nộp tiền:" : "Họ tên người nhận tiền:";
    const reasonLabel = isReceipt ? "Lý do nộp:" : "Lý do chi:";
    const signatureLabel = isReceipt ? "Người nộp" : "Người nhận";

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .voucher-print-content {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 210mm;
                        min-height: 297mm;
                        padding: 20px;
                        background: white;
                        font-size: 14px;
                        font-family: Arial, sans-serif;
                        visibility: hidden;
                        pointer-events: none;
                    }
                    @media print {
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            height: auto !important;
                        }
                        body > *:not(.voucher-print-content) {
                            display: none !important;
                            visibility: hidden !important;
                        }
                        .voucher-print-content {
                            position: relative !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            min-height: 100vh !important;
                            padding: 20px !important;
                            background: white !important;
                            visibility: visible !important;
                            display: block !important;
                            z-index: 9999 !important;
                            page-break-after: avoid;
                        }
                        .voucher-print-content * {
                            visibility: visible !important;
                            color: black !important;
                        }
                    }
                `
            }} />
            <div className={`voucher-print-content ${className}`}>
                <div className="p-6 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Header with date/time and branch info */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="text-xs text-gray-600 mb-2">
                            {new Date().toLocaleString("vi-VN", {
                                month: '2-digit',
                                day: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                        <div className="mb-1">
                            <p className="font-semibold text-base">{data.branchName || "Chi nhánh trung tâm"}</p>
                        </div>
                        <div className="mb-1">
                            <span className="text-sm">SĐT: </span>
                            <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[150px]">
                                {data.branchPhone || ""}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm">Địa chỉ: </span>
                            <span className="text-sm border-b border-dotted border-gray-400 inline-block min-w-[200px]">
                                {data.branchAddress || ""}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold">KiotViet - Sổ quỹ</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold mb-3">
                        {voucherTitle}
                    </h1>
                </div>

                {/* Voucher Code and Date (Right-aligned, below title) */}
                <div className="text-right mb-4">
                    <p className="text-base mb-1">
                        {voucherCodeLabel}: <span className="font-semibold">{data.voucherCode || "—"}</span>
                    </p>
                    <p className="text-base">
                        Ngày: <span className="font-semibold">{data.voucherDate}</span>
                    </p>
                </div>

                {/* Payer/Recipient Info */}
                <div className="mb-4 space-y-2">
                    <div>
                        <span className="text-sm">{payerLabel}</span>
                        <span className="text-sm font-semibold ml-2 border-b border-dotted border-gray-400 inline-block min-w-[200px]">
                            {data.payerName || ""}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm">Số điện thoại:</span>
                        <span className="text-sm border-b border-dotted border-gray-400 inline-block ml-2 min-w-[200px]">
                            {data.payerPhone || ""}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm">Địa chỉ:</span>
                        <span className="text-sm border-b border-dotted border-gray-400 inline-block ml-2 min-w-[300px]">
                            {data.payerAddress || ""}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm">{reasonLabel}</span>
                        <span className="text-sm border-b border-dotted border-gray-400 inline-block ml-2 min-w-[300px]">
                            {data.reason || ""}
                        </span>
                    </div>
                </div>

                {/* Amount Section */}
                <div className="mb-4">
                    <div className="mb-2">
                        <span className="text-base font-semibold">Số tiền: </span>
                        <span className="text-base font-bold">{formatCurrency(data.amount)}</span>
                    </div>
                    <div>
                        <span className="text-base font-semibold">Bằng chữ: </span>
                        <span className="text-base font-semibold italic">{numberToVietnameseWords(data.amount)}</span>
                    </div>
                </div>

                {/* Signatures Footer */}
                <div className="mt-8 pt-4">
                    <div className="text-right mb-4">
                        <p className="text-sm">Ngày ........... Tháng ........... Năm ...........</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm mb-8">Người lập phiếu</p>
                            <p className="text-sm font-semibold border-t pt-2">{data.creatorName || "—"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm mb-8">{signatureLabel}</p>
                            <p className="text-sm font-semibold border-t pt-2">{data.payerSignatureName || data.payerName || "—"}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm mb-8">Thủ quỹ</p>
                            <p className="text-sm font-semibold border-t pt-2">{data.cashierName || "—"}</p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}

