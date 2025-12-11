"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Section {
  name: string;
  questionCount: number;
}

interface FormSidebarProps {
  sections: Section[];
  currentPage: number;
  onSectionClick: (page: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarNav({
  sections,
  currentPage,
  onSectionClick
}: {
  sections: Section[];
  currentPage: number;
  onSectionClick: (index: number) => void;
}) {
  return (
    <nav className="space-y-1">
      {sections.map((section, index) => (
        <button
          key={index}
          onClick={() => onSectionClick(index)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
            currentPage === index
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span className="flex justify-between items-center w-full">
            <span>{section.name}</span>
            <span className="text-xs opacity-70">
              ({section.questionCount})
            </span>
          </span>
        </button>
      ))}
    </nav>
  );
}

export default function FormSidebar({
  sections,
  currentPage,
  onSectionClick,
  open,
  onOpenChange
}: FormSidebarProps) {

  const handleSectionClick = (index: number) => {
    onSectionClick(index);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] sm:w-80 pt-10">
        <SheetHeader className="px-1 border-b pb-4 mb-4">
          <SheetTitle>Form Sections</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <SidebarNav
            sections={sections}
            currentPage={currentPage}
            onSectionClick={handleSectionClick}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}