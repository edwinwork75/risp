"use client";

import { Input } from "@/components/ui/input";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface ShortAnswerProps {
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

export default function ShortAnswer({ question, onChange, onCommentChange, onFilesChange, value, comment, files, fileUrls, required }: ShortAnswerProps) {
  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      
      <div className="max-w-md">
        <Input
          id="short-answer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          className="text-base font-light border-0 border-b-2 rounded-none px-1 focus-visible:ring-0 focus:border-primary"
        />
      </div>

      <div className="pt-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </div>
  );
}