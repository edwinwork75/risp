"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X, File as FileIcon } from "lucide-react";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  className?: string;
}

export default function FileUpload({ onFilesChange, files = [], className }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    onFilesChange([...files, ...newFiles]);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    onFilesChange(files.filter(file => file !== fileToRemove));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`mt-4 space-y-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={handleButtonClick} className="flex items-center gap-2 h-auto py-1.5 text-muted-foreground">
        <Paperclip className="h-4 w-4" />
        Add attachments
      </Button>
      <Input
        id="file-upload"
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-md border text-sm">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="font-medium truncate">{file.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleRemoveFile(file)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}