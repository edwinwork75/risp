"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface DualResponse {
  response: string;
  date: string;
}

interface DualResponseDateProps {
  question: string;
  onChange: (value: { main_contractor?: DualResponse; sub_contractor?: DualResponse }) => void;
  onCommentChange: (comment: string) => void;
  onFilesChange: (files: File[]) => void;
  value?: { main_contractor?: DualResponse; sub_contractor?: DualResponse };
  comment?: string;
  files?: File[];
  fileUrls?: { name: string; url: string }[];
  required?: boolean;
}

export default function DualResponseDate({
  question,
  onChange,
  onCommentChange,
  onFilesChange,
  value = {},
  comment,
  files,
  fileUrls,
  required,
}: DualResponseDateProps) {
  const handleResponseChange = (party: 'main_contractor' | 'sub_contractor', response: string) => {
    onChange({
      ...value,
      [party]: { ...value?.[party], response },
    });
  };

  const handleDateChange = (party: 'main_contractor' | 'sub_contractor', date: string) => {
    onChange({
      ...value,
      [party]: { ...value?.[party], date },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Contractor */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold">Main Contractor</h3>
          <RadioGroup
            value={value.main_contractor?.response}
            onValueChange={(response) => handleResponseChange('main_contractor', response)}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id={`${question}-main-yes`} />
              <Label htmlFor={`${question}-main-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id={`${question}-main-no`} />
              <Label htmlFor={`${question}-main-no`}>No</Label>
            </div>
          </RadioGroup>
          <DatePicker
            value={value.main_contractor?.date}
            onChange={(date) => handleDateChange('main_contractor', date)}
            placeholder="Select date"
          />
        </div>

        {/* Subcontractor */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h3 className="font-semibold">Subcontractor</h3>
          <RadioGroup
            value={value.sub_contractor?.response}
            onValueChange={(response) => handleResponseChange('sub_contractor', response)}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id={`${question}-sub-yes`} />
              <Label htmlFor={`${question}-sub-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id={`${question}-sub-no`} />
              <Label htmlFor={`${question}-sub-no`}>No</Label>
            </div>
          </RadioGroup>
          <DatePicker
            value={value.sub_contractor?.date}
            onChange={(date) => handleDateChange('sub_contractor', date)}
            placeholder="Select date"
          />
        </div>
      </div>

      <div className="pt-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </div>
  );
}
