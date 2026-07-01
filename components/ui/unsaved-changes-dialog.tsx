"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  title: string;
  message: string;
  discardText: string;
  saveText: string;
  processingText: string;
  onDiscard: () => void;
  onSave: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function UnsavedChangesDialog({
  open,
  title,
  message,
  discardText,
  saveText,
  processingText,
  onDiscard,
  onSave,
  onCancel,
  isProcessing = false,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => !open && !isProcessing && onCancel()}
    >
      <AlertDialogContent className="max-w-md">
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{processingText}</p>
            </div>
          </div>
        )}

        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-lg font-semibold">
              {title}
            </AlertDialogTitle>
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-30"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={onDiscard} disabled={isProcessing}>
            {discardText}
          </Button>
          <Button onClick={onSave} disabled={isProcessing}>
            {saveText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
