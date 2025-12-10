import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CommentBox from "./CommentBox";
import FileUpload from "./FileUpload";

interface DropdownProps {
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

export default function Dropdown({ question, options, onChange, onCommentChange, onFilesChange, value, comment, files, fileUrls, required }: DropdownProps) {
  return (
    <div className="space-y-4">
      <p className="text-base font-light">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="w-full md:w-1/2">
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

      <div className="pt-2">
        <CommentBox onChange={onCommentChange} comment={comment} />
        <FileUpload onFilesChange={onFilesChange} files={files || []} fileUrls={fileUrls} />
      </div>
    </div>
  );
}
