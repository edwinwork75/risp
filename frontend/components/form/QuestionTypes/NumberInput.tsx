"use client";

import { Input } from "@/components/ui/input";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface NumberInputProps {
  question: string;
  onChange: (value: string) => void;
  onCommentChange: (comment: string) => void;
  onFilesChange: (files: File[]) => void;
  value?: string;
  comment?: string;
  files?: File[];
  fileUrls?: { name: string; url: string }[];
  required?: boolean;
}

export default function NumberInput({
  question,
  onChange,
  onCommentChange,
  onFilesChange,
  value,
  comment,
  files,
  fileUrls,
  required,
}: NumberInputProps) {
  return (
    <div className="space-y-4">
      {/* Question */}
      <p className="text-sm font-light text-gray-800 leading-snug">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {/* Number Input */}
      <div className="max-w-xs">
        <Input
          id="number-input"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter a number"
          className="
            text-sm font-light
            bg-transparent
            border-0 border-b border-gray-300
            rounded-none
            px-1 pb-1
            focus-visible:ring-0 
            focus:border-primary
            transition
          "
        />
      </div>

      {/* Comment & Upload */}
      <div className="space-y-3 pt-1">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload
          onFilesChange={onFilesChange}
          files={files || []}
          fileUrls={fileUrls}
        />
      </div>
    </div>
  );
}
