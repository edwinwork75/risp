"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "@/components/ui/motion";
import CommentBox from "./CommentBox";

interface DropdownProps {
  question: string;
  options: string[];
  onChange: (value: string) => void;
  onCommentChange: (comment: string) => void;
  value?: string;
  comment?: string;
}

export default function Dropdown({ question, options, onChange, onCommentChange, value, comment }: DropdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-medium tracking-tight">{question}</h2>
      
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="w-full text-lg">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CommentBox onChange={onCommentChange} comment={comment} />
    </motion.div>
  );
}
