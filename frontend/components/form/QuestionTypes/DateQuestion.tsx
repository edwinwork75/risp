"use client";

import { DatePicker } from "@/components/ui/date-picker";
import FileUpload from "./FileUpload";

interface DateQuestionProps {
  question: string;
  onChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  value?: string;
  files?: File[];
  fileUrls?: { name: string; url: string }[];
  required?: boolean;
}

export default function DateQuestion({
  question,
  onChange,
  onFilesChange,
  value,
  files,
  fileUrls,
  required,
}: DateQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      
      <div className="max-w-md">
        <DatePicker
          value={value}
          onChange={onChange}
        />
      </div>

      <div className="pt-2">
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </div>
  );
}
