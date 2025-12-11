"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface HistoryItem {
    id: number;
    user: string;
    role: "Sub Contractor" | "Main Contractor" | "SRE/RE" | "Admin";
    action: string;
    timestamp: string;
    details?: string;
}

const dummyHistory: HistoryItem[] = [
    {
        id: 1,
        user: "Robert Fox",
        role: "Sub Contractor",
        action: "Updated Response",
        details: "Changed to 'Yes'",
        timestamp: "Oct 26, 11:00 AM"
    },
    {
        id: 2,
        user: "Jenny Wilson",
        role: "Main Contractor",
        action: "Reviewed",
        details: "Looks good",
        timestamp: "Oct 26, 11:30 AM"
    },
];

interface QuestionHistoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionText: string;
}

export default function QuestionHistoryDrawer({ open, onOpenChange, questionText }: QuestionHistoryDrawerProps) {
    const roleColors = {
        "Sub Contractor": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        "Main Contractor": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        "SRE/RE": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        "Admin": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[85vw] sm:w-80 pt-10">
                <SheetHeader className="px-1 border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <SheetTitle>Activity History</SheetTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2" title={questionText}>
                        {questionText}
                    </p>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
                    <div className="py-2 space-y-6 relative ml-1">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800" />

                        {dummyHistory.map((item) => (
                            <div key={item.id} className="relative pl-10 group">
                                {/* Timeline dot */}
                                <div className="absolute left-3 top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-950 bg-gray-300 group-hover:bg-primary transition-colors duration-200 z-10" />

                                <div className="flex flex-col gap-1">
                                    <div className="flex items-start justify-between">
                                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-none">
                                            {item.user}
                                        </span>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {item.timestamp}
                                        </span>
                                    </div>

                                    <span className={cn(
                                        "inline-flex w-fit px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
                                        roleColors[item.role]
                                    )}>
                                        {item.role}
                                    </span>

                                    <div className="mt-1 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-md border border-gray-100 dark:border-gray-800">
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <FileEdit className="w-3 h-3 text-gray-400" />
                                            {item.action}
                                        </p>
                                        {item.details && (
                                            <p className="text-xs text-gray-500 mt-1 pl-4.5 border-l-2 border-gray-200 ml-1.5">
                                                {item.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
