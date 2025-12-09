"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquarePlus } from "lucide-react";

interface CommentBoxProps {
  onChange: (comment: string) => void;
  comment?: string;
  className?: string;
}

export default function CommentBox({ onChange, comment, className }: CommentBoxProps) {
  const [open, setOpen] = useState(!!comment);

  const handleToggle = () => {
    if (open) {
      onChange(""); // reset comment
    }
    setOpen(!open);
  };

  return (
    <div className={cn("mt-4 space-y-3", className)}>
      {/* Add Comment Button */}
      {!open && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/40 transition"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Add a comment
        </Button>
      )}

      {/* Comment Area */}
      {open && (
        <div className="space-y-3 p-4 border rounded-xl bg-muted/20 shadow-sm transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Comment 
            </Label>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-100/40 rounded-md px-2"
            >
              Cancel
            </Button>
          </div>

          <Textarea
            value={comment}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write something..."
            className="h-28 resize-none text-sm bg-white rounded-lg border focus:ring-2 focus:ring-primary/40 shadow-sm transition"
          />

          {/* Optional: Save button for explicit UX */}
          {/* <div className="flex justify-end">
            <Button size="sm" className="px-4">
              Save
            </Button>
          </div> */}
        </div>
      )}
    </div>
  );
}
