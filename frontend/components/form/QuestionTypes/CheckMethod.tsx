"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface CheckMethodProps {
  question: string;
  options: string[];
  onChange: (value: string) => void;
  onCommentChange: (comment: string) => void;
  onFilesChange: (files: File[]) => void;
  value?: string;
  comment?: string;
  files?: File[];
  fileUrls?: { name: string; url: string }[];
  required?: boolean;
}

export default function CheckMethod({ question, options, onChange, onCommentChange, onFilesChange, value, comment, files, fileUrls, required }: CheckMethodProps) {
  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
        <RadioGroup
        value={value}
        onValueChange={onChange}
        className="space-y-1"
      >
        {options.map((option) => (
          <div
            key={option}
            className="flex items-center space-x-3"
            onClick={() => onChange(option)}
          >
            <RadioGroupItem value={option} id={`${question}-${option}`} />
            <Label htmlFor={`${question}-${option}`} className="text-base font-light cursor-pointer flex-1">{option}</Label>
          </div>
        ))}
      </RadioGroup>
      <div className="pt-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </div>
  );
}
