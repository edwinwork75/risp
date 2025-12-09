"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "@/components/ui/motion";
import CommentBox from "./CommentBox";

interface ShortAnswerProps {
  question: string;
  onChange: (value: string) => void;
  onCommentChange: (comment: string) => void;
  value?: string;
  comment?: string;
}

export default function ShortAnswer({ question, onChange, onCommentChange, value, comment }: ShortAnswerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-medium tracking-tight">{question}</h2>
      
      <div className="space-y-2">
        <Label htmlFor="short-answer">Your answer</Label>
        <Input
          id="short-answer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg"
        />
      </div>
      <CommentBox onChange={onCommentChange} comment={comment} />
    </motion.div>
  );
}