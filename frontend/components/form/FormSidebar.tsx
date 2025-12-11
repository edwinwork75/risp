"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Section {
  name: string;
  questionCount: number;
}

interface FormSidebarProps {
  sections: Section[];
  currentPage: number;
  onSectionClick: (page: number) => void;
}

export default function FormSidebar({
  sections,
  currentPage,
  onSectionClick,
}: FormSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionClick = (index: number) => {
    onSectionClick(index);
    setIsOpen(false); // Close sidebar on section click
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed top-32 left-4 z-40 rounded-md px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm shadow-lg border hover:bg-white dark:hover:bg-black"
          aria-label="Open form sections"
        >
          <PanelLeft className="h-5 w-5 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Sections</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-80 pt-10">
        <SheetHeader className="px-1">
          <SheetTitle>Form Sections</SheetTitle>
        </SheetHeader>
        <div className="mt-4 h-[calc(100vh-8rem)] overflow-y-auto">
          <nav className="space-y-1">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => handleSectionClick(index)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  currentPage === index
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="flex justify-between items-center">
                  <span>{section.name}</span>
                  <span className="text-xs opacity-70">
                    {section.questionCount} Qs
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}