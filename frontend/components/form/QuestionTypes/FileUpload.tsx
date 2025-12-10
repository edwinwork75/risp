"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, X, File as FileIcon } from "lucide-react";

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  files: File[];
  className?: string;
  fileUrls?: { name: string; url: string }[];
}

export default function FileUpload({
  onFilesChange,
  files = [],
  className,
  fileUrls,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    onFilesChange([...files, ...newFiles]);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    onFilesChange(files.filter((file) => file !== fileToRemove));
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="
          flex items-center gap-2 
          h-auto py-1.5 px-3 
          text-xs font-normal 
          text-gray-600 
          border-gray-300
          hover:bg-gray-100
          hover:text-gray-700
          rounded-md
          transition
        "
      >
        <Paperclip className="h-4 w-4" />
        Add attachments
      </Button>

      {/* Hidden input */}
      <Input
        id="file-upload"
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File list */}
      <div className="space-y-2">
        {files.map((file, index) => {
          const fileUrl = fileUrls?.find((f) => f.name === file.name)?.url;

          return (
            <div
              key={index}
              className="
                flex items-center justify-between 
                px-3 py-2 
                rounded-md 
                border border-gray-300 
                bg-gray-50 
                text-xs font-normal
                shadow-sm
                transition
              "
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <FileIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />

                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline text-gray-700"
                  >
                    {file.name}
                  </a>
                ) : (
                  <span className="truncate text-gray-700">{file.name}</span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(file)}
                className="
                  h-6 w-6 flex-shrink-0 
                  text-gray-500 hover:text-red-600 
                  hover:bg-red-100/40 rounded-md
                "
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
