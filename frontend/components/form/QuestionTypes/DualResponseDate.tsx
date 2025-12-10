"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DualResponse {
  response?: string;
  date?: string;
  comment?: string;
  files?: File[];
}

interface DualResponseDateProps {
  question: string;
  onChange: (value: { main_contractor?: DualResponse; sub_contractor?: DualResponse }) => void;
  value?: { main_contractor?: DualResponse; sub_contractor?: DualResponse };
  files?: {
    main: File[];
    sub: File[];
  };
  fileUrls?: {
    main?: { name: string; url: string }[];
    sub?: { name: string; url: string }[];
  };
  onMainFilesChange?: (files: File[]) => void;
  onSubFilesChange?: (files: File[]) => void;
  required?: boolean;
}

export default function DualResponseDate({
  question,
  onChange,
  value = {},
  files = { main: [], sub: [] },
  fileUrls,
  onMainFilesChange,
  onSubFilesChange,
  required,
}: DualResponseDateProps) {
  const handlePartyChange = (party: 'main_contractor' | 'sub_contractor', field: keyof DualResponse, fieldValue: any) => {
    onChange({
      ...value,
      [party]: { ...value?.[party], [field]: fieldValue },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>

      <Tabs defaultValue="main_contractor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="main_contractor">Main Contractor</TabsTrigger>
          <TabsTrigger value="sub_contractor">Subcontractor</TabsTrigger>
        </TabsList>

        <TabsContent value="main_contractor" className="mt-4">
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold">Main Contractor</h3>
            <RadioGroup
              value={value.main_contractor?.response}
              onValueChange={(response) => handlePartyChange('main_contractor', 'response', response)}
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
              onChange={(date) => handlePartyChange('main_contractor', 'date', date)}
              placeholder="Select date"
            />
            <div className="pt-2">
              <CommentBox
                onChange={(comment) => handlePartyChange('main_contractor', 'comment', comment)}
                comment={value.main_contractor?.comment}
              />
              <FileUpload
                onFilesChange={(files) => onMainFilesChange?.(files)}
                files={files.main}
                fileUrls={fileUrls?.main}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sub_contractor" className="mt-4">
          <div className="space-y-3 p-4 border rounded-lg">
            <h3 className="font-semibold">Subcontractor</h3>
            <RadioGroup
              value={value.sub_contractor?.response}
              onValueChange={(response) => handlePartyChange('sub_contractor', 'response', response)}
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
              onChange={(date) => handlePartyChange('sub_contractor', 'date', date)}
              placeholder="Select date"
            />
            <div className="pt-2">
              <CommentBox
                onChange={(comment) => handlePartyChange('sub_contractor', 'comment', comment)}
                comment={value.sub_contractor?.comment}
              />
              <FileUpload
                onFilesChange={(files) => onSubFilesChange?.(files)}
                files={files.sub}
                fileUrls={fileUrls?.sub}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
