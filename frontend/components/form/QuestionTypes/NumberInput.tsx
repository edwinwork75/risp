"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "@/components/ui/motion";
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
}

export default function NumberInput({ question, onChange, onCommentChange, onFilesChange, value, comment, files }: NumberInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-medium tracking-tight">{question}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="number-input">Enter a number</Label>
        <Input
          id="number-input"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      </div>
      <div className="space-y-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} />
      </div>
    </motion.div>
  );
}