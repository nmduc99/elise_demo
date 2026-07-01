"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TimeRangeSliderProps {
    startTime: string; // "HH:mm"
    endTime: string;   // "HH:mm"
    onChange: (start: string, end: string) => void;
    step?: number; // minutes per step, default 15
}

export function TimeRangeSlider({
    startTime,
    endTime,
    onChange,
    step = 15,
}: TimeRangeSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

    // Helpers to convert time <-> total minutes
    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const minutesToTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const [localStart, setLocalStart] = useState(timeToMinutes(startTime));
    const [localEnd, setLocalEnd] = useState(timeToMinutes(endTime));

    useEffect(() => {
        setLocalStart(timeToMinutes(startTime));
        setLocalEnd(timeToMinutes(endTime));
    }, [startTime, endTime]);

    const getPercentage = (minutes: number) => (minutes / 1440) * 100;

    const handlePointerDown = (type: "start" | "end") => (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDragging(type);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
        const percentage = x / rect.width;
        let minutes = Math.round((percentage * 1440) / step) * step;
        minutes = Math.max(0, Math.min(1440 - step, minutes));

        if (isDragging === "start") {
            // Allow crossing to support overnight
            if (minutes === localEnd) {
                // Prevent exact overlap if desired, or allow. 
                // Let's allow but maybe nudging makes it weird?
                // Let's just update.
            }
            setLocalStart(minutes);
            onChange(minutesToTime(minutes), minutesToTime(localEnd));
        } else {
            setLocalEnd(minutes);
            onChange(minutesToTime(localStart), minutesToTime(minutes));
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isDragging) {
            setIsDragging(null);
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    const isOvernight = localStart > localEnd;

    return (
        <div className="w-full py-6 select-none touch-none">
            {/* Time Display */}
            <div className="flex justify-between text-sm font-medium mb-2 text-gray-700">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Bắt đầu</span>
                    <span>{minutesToTime(localStart)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">Kết thúc</span>
                    <span className="flex items-center gap-1">
                        {minutesToTime(localEnd)}
                        {isOvernight && <span className="text-orange-600 text-[10px] font-bold">(+1 ngày)</span>}
                    </span>
                </div>
            </div>

            <div className="relative h-6 flex items-center" ref={trackRef}>
                {/* Track Background */}
                <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    {/* Hour markers */}
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "absolute top-0 bottom-0 w-px bg-white/50",
                                i % 6 === 0 ? "h-full bg-gray-400/50" : "h-1/2 mt-0.5"
                            )}
                            style={{ left: `${(i / 24) * 100}%` }}
                        />
                    ))}
                </div>

                {/* Active Range Bar */}
                {isOvernight ? (
                    <>
                        {/* Start to End of Day */}
                        <div
                            className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-l-full"
                            style={{
                                left: `${getPercentage(localStart)}%`,
                                right: 0,
                            }}
                        />
                        {/* Start of Day to End */}
                        <div
                            className="absolute h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-r-full"
                            style={{
                                left: 0,
                                width: `${getPercentage(localEnd)}%`,
                            }}
                        />
                    </>
                ) : (
                    <div
                        className="absolute h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                        style={{
                            left: `${getPercentage(localStart)}%`,
                            width: `${getPercentage(localEnd) - getPercentage(localStart)}%`,
                        }}
                    />
                )}

                {/* Start Thumb */}
                <div
                    className="absolute w-6 h-6 bg-white border-2 border-orange-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center z-20 hover:scale-110 transition-transform"
                    style={{ left: `calc(${getPercentage(localStart)}% - 12px)` }}
                    onPointerDown={handlePointerDown("start")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    title="Giờ bắt đầu"
                >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                </div>

                {/* End Thumb */}
                <div
                    className="absolute w-6 h-6 bg-white border-2 border-orange-500 rounded-full shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center z-20 hover:scale-110 transition-transform"
                    style={{ left: `calc(${getPercentage(localEnd)}% - 12px)` }}
                    onPointerDown={handlePointerDown("end")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    title="Giờ kết thúc"
                >
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                </div>
            </div>

            {/* Time Labels for scale */}
            <div className="relative h-4 mt-1 text-[10px] text-gray-400 font-medium select-none">
                <span className="absolute left-0 -translate-x-1/2">00:00</span>
                <span className="absolute left-1/4 -translate-x-1/2">06:00</span>
                <span className="absolute left-1/2 -translate-x-1/2">12:00</span>
                <span className="absolute left-3/4 -translate-x-1/2">18:00</span>
                <span className="absolute right-0 translate-x-1/2">24:00</span>
            </div>
        </div>
    );
}
