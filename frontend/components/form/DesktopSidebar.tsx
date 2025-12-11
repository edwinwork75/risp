"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { SidebarNav } from "./FormSidebar";

interface Section {
    name: string;
    questionCount: number;
}

interface DesktopSidebarProps {
    sections: Section[];
    currentPage: number;
    onSectionClick: (page: number) => void;
}

export default function DesktopSidebar({
    sections,
    currentPage,
    onSectionClick
}: DesktopSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "hidden lg:flex flex-col border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out shrink-0 sticky top-24 h-fit max-h-[calc(100vh-8rem)]",
                isCollapsed ? "w-16 items-center py-4" : "w-64 p-4"
            )}
        >
            <div className={cn("flex items-center mb-4", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <h3 className="font-semibold px-2">Sections</h3>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="h-8 w-8"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {!isCollapsed ? (
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                    <SidebarNav
                        sections={sections}
                        currentPage={currentPage}
                        onSectionClick={onSectionClick}
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-2 w-full px-2">
                    {sections.map((section, index) => (
                        <Button
                            key={index}
                            variant={currentPage === index ? "default" : "ghost"}
                            size="icon"
                            className={cn("w-full h-10 rounded-md", currentPage === index && "shadow-sm")}
                            onClick={() => onSectionClick(index)}
                            title={section.name}
                        >
                            <span className="font-bold text-xs">{index + 1}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
