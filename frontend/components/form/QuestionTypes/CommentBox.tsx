"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface CommentBoxProps {
  onChange: (comment: string) => void;
  comment?: string;
  className?: string;
}

export default function CommentBox({ onChange, comment = "", className }: CommentBoxProps) {
  const [open, setOpen] = useState(Boolean(comment));
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-open when comment exists externally (edit mode)
  useEffect(() => {
    if (comment) setOpen(true);
  }, [comment]);

  const handleBlur = () => {
    // Collapse only if no text
    if (!comment) {
      setOpen(false);
    }
  };

  return (
    <div className={cn("w-full pb-4", className)}>
      
      {/* Collapsed state — fake input */}
      {!open && (
        <div
          onClick={() => {
            setOpen(true);
            setTimeout(() => textareaRef.current?.focus(), 10);
          }}
          className="
            text-xs text-gray-500
            px-3 py-2 
            border rounded-md 
            bg-white 
            cursor-text
            hover:bg-gray-50
          "
        >
          Add a comment…
        </div>
      )}

      {/* Expanded textarea */}
      {open && (
        <div className="space-y-1 animate-in fade-in duration-150">
          <Textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Write a comment…"
            className="
              text-sm
              min-h-[70px]
              resize-none
              border border-gray-300 rounded-md
              focus:border-primary
              focus:ring-primary/30 focus:ring-1
            "
          />

          {/* Show cancel only when comment is empty */}
          {!comment && (
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
