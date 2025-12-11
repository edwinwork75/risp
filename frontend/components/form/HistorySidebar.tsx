"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, X, ChevronLeft, Clock, User, FileEdit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
        action: "Started Assessment",
        timestamp: "Oct 26, 09:00 AM"
    },
    {
        id: 2,
        user: "Robert Fox",
        role: "Sub Contractor",
        action: "Completed Section",
        details: "Project Information",
        timestamp: "Oct 26, 09:15 AM"
    },
    {
        id: 3,
        user: "Jenny Wilson",
        role: "Main Contractor",
        action: "Reviewed",
        details: "Added comment on Q12",
        timestamp: "Oct 26, 10:30 AM"
    },
    {
        id: 4,
        user: "Robert Fox",
        role: "Sub Contractor",
        action: "Updated Response",
        details: "Changed answer for Q12",
        timestamp: "Oct 26, 11:00 AM"
    },
    {
        id: 5,
        user: "Guy Hawkins",
        role: "SRE/RE",
        action: "Flagged Issue",
        details: "Pending verification on site",
        timestamp: "Oct 26, 02:45 PM"
    },
];

export default function HistorySidebar() {
    const [isOpen, setIsOpen] = useState(false);

    // Role badge colors
    const roleColors = {
        "Sub Contractor": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        "Main Contractor": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        "SRE/RE": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        "Admin": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };

    if (!isOpen) {
        return (
            <div className="fixed top-32 right-4 z-50">
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="outline"
                    className="rounded-full h-12 w-12 p-0 bg-background/80 backdrop-blur-sm shadow-lg border-l-4 border-l-primary hover:w-auto hover:px-4 group transition-all duration-300 ease-in-out overflow-hidden"
                    aria-label="View Edit History"
                >
                    <History className="h-5 w-5 shrink-0" />
                    <span className="w-0 overflow-hidden group-hover:w-auto group-hover:ml-2 transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
                        History
                    </span>
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed top-32 right-4 z-50 h-[calc(100vh-9rem)]">
            <Card className="w-80 h-full shadow-2xl bg-background/95 backdrop-blur-sm flex flex-col border-l-4 border-l-primary animate-in slide-in-from-right-10 duration-200">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-4 border-b shrink-0">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base font-semibold">Activity History</CardTitle>
                    </div>
                    <Button
                        onClick={() => setIsOpen(false)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100 rounded-full"
                        aria-label="Close history"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <ScrollArea className="flex-1 px-4">
                    <div className="py-4 space-y-6 relative">
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

                        <div className="relative pl-10 opacity-50">
                            <div className="absolute left-3 top-1.5 h-4 w-4 rounded-full border-2 border-white dark:border-gray-950 bg-gray-200 z-10" />
                            <p className="text-xs text-gray-400 italic">Start of timeline</p>
                        </div>
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}
