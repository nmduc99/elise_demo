"use client";

import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

type DrawerV2Props = React.ComponentProps<typeof DrawerPrimitive.Root> & {
    direction?: "left" | "right" | "top" | "bottom";
    shouldScaleBackground?: boolean;
};

const DrawerV2 = ({
    shouldScaleBackground = false,
    direction = "left",
    ...props
}: DrawerV2Props) => (
    <DrawerPrimitive.Root
        shouldScaleBackground={shouldScaleBackground}
        direction={direction}
        {...props}
    />
);
DrawerV2.displayName = "DrawerV2";

const DrawerV2Trigger = DrawerPrimitive.Trigger;
const DrawerV2Close = DrawerPrimitive.Close;
const DrawerV2Portal = DrawerPrimitive.Portal;

const DrawerV2Overlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm", className)}
        {...props}
    />
));
DrawerV2Overlay.displayName = "DrawerV2Overlay";

const DrawerV2Content = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
        direction?: "left" | "right" | "top" | "bottom";
    }
>(({ className, children, direction = "left", ...props }, ref) => {
    // Animation direction động
    const slideAnimation = {
        left: "animate-in slide-in-from-left",
        right: "animate-in slide-in-from-right",
        top: "animate-in slide-in-from-top",
        bottom: "animate-in slide-in-from-bottom",
    }[direction];

    return (
        <DrawerV2Portal>
            <DrawerV2Overlay />
            <DrawerPrimitive.Content
                ref={ref}
                className={cn(
                    // ✅ Không cố định width/height cứng, chỉ giới hạn theo viewport
                    "fixed z-[999] bg-white flex flex-col",
                    "max-w-[100vw] max-h-[100vh] w-auto h-auto",
                    "overflow-y-auto overflow-x-hidden",
                    // ✅ Animation trượt mượt mà
                    `${slideAnimation} duration-300`,
                    // ✅ Căn vị trí theo hướng mở
                    direction === "left" && "top-0 left-0 bottom-0",
                    direction === "right" && "top-0 right-0 bottom-0",
                    direction === "top" && "top-0 left-0 right-0",
                    direction === "bottom" && "bottom-0 left-0 right-0",
                    className
                )}
                {...props}
            >
                {/* Hidden accessible content (theo spec của Dialog) */}
                <VisuallyHidden>
                    <DrawerPrimitive.Title>Menu</DrawerPrimitive.Title>
                    <DrawerPrimitive.Description>
                        Mobile navigation drawer
                    </DrawerPrimitive.Description>
                </VisuallyHidden>

                {children}
            </DrawerPrimitive.Content>
        </DrawerV2Portal>
    );
});
DrawerV2Content.displayName = "DrawerV2Content";

export {
    DrawerV2,
    DrawerV2Close,
    DrawerV2Content,
    DrawerV2Overlay,
    DrawerV2Portal,
    DrawerV2Trigger
};

