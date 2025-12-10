"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface MultipleChoiceProps {
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

export default function MultipleChoice({
  question,
  options,
  onChange,
  onCommentChange,
  onFilesChange,
  value,
  comment,
  files,
  fileUrls,
  required,
}: MultipleChoiceProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <p className="text-sm font-light text-gray-800 leading-snug">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      {/* Options */}
      <RadioGroup
        value={value}
        onValueChange={handleChange}
        className="space-y-2.5"
      >
        {options.map((option) => (
          <div
            key={option}
            className="
              flex items-center gap-3 
              py-1 
              cursor-pointer 
              hover:bg-gray-50 
              rounded-md 
              transition
            "
            onClick={() => handleChange(option)}
          >
            <RadioGroupItem
              value={option}
              id={`${question}-${option}`}
              className="
                h-4 w-4 
                border-gray-400 
                text-primary 
                focus:ring-2 
                focus:ring-primary/30
              "
            />
            <Label
              htmlFor={`${question}-${option}`}
              className="text-sm font-light text-gray-700 cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Comment + File Upload */}
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
