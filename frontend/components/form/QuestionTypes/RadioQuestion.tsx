"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "@/components/ui/motion";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface RadioQuestionProps {
  question: string;
  options: string[];
  onChange: (value: string) => void;
  onCommentChange: (comment: string) => void;
  onFilesChange: (files: File[]) => void;
  value?: string;
  comment?: string;
  files?: File[];
  fileUrls?: { name: string; url: string }[];
}

export default function RadioQuestion({ question, options, onChange, onCommentChange, onFilesChange, value, comment, files, fileUrls }: RadioQuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-medium tracking-tight">{question}</h2>
        <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="space-y-2"
      >
        {options.map((option) => (
          <div 
            key={option} 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
            onClick={() => onChange(option)}
          >
            <RadioGroupItem value={option} id={option} />
            <Label htmlFor={option} className="text-base cursor-pointer flex-1">{option}</Label>
          </div>
        ))}
      </RadioGroup>
      <div className="space-y-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </motion.div>
  );
}