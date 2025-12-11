"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isExpanded) {
    return (
      <div className="fixed top-32 left-4 z-50"> {/* Position changed to top-32 */}
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          className="rounded-md px-4 py-2 bg-background/80 backdrop-blur-sm shadow-lg"
          aria-label="Open form sections"
        >
          <PanelLeft className="h-5 w-5 mr-2" />
          Sections
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-32 left-4 z-50"> {/* Position changed to top-32 */}
      <Card className="w-72 shadow-2xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-lg">Form Sections</CardTitle>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="icon"
            aria-label="Close form sections"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
            <nav className="p-2 space-y-1 max-h-[55vh] overflow-y-auto">
                {sections.map((section, index) => (
                <button
                    key={index}
                    onClick={() => {
                        onSectionClick(index);
                    }}
                    className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    currentPage === index
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent"
                    )}
                >
                    <div className="flex justify-between items-center">
                        <span>{section.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {section.questionCount} Qs
                        </span>
                    </div>
                </button>
                ))}
            </nav>
        </CardContent>
      </Card>
    </div>
  );
}