import React, { useState } from 'react';
import { ChecklistConfig, checklistPayload, ChecklistCellData } from '@/types/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Paperclip, ChevronDown, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

interface ChecklistRendererProps {
    config?: ChecklistConfig;
    value?: Record<string, Record<string, ChecklistCellData>>; // rowId -> columnId -> data
    onChange?: (value: Record<string, Record<string, ChecklistCellData>>) => void;
    readOnly?: boolean;
}

export const ChecklistRenderer: React.FC<ChecklistRendererProps> = ({ config, value = {}, onChange, readOnly = false }) => {
    // If no config, render nothing or placeholder
    if (!config || !config.columns || config.columns.length === 0) {
        return <div className="p-4 text-center text-gray-400 border rounded-md bg-gray-50 italic">Checklist not configured</div>;
    }

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
        config.sections.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
    );

    const toggleSection = (secId: string) => {
        setExpandedSections(prev => ({ ...prev, [secId]: !prev[secId] }));
    };

    const handleCellChange = (rowId: string, colId: string, inputId: string, val: any) => {
        if (readOnly || !onChange) return;

        const currentRowData = value[rowId] || {};
        const currentCellData = currentRowData[colId] || { values: {} };

        const newCellData = {
            ...currentCellData,
            values: { ...currentCellData.values, [inputId]: val }
        };

        onChange({
            ...value,
            [rowId]: { ...currentRowData, [colId]: newCellData }
        });
    };

    const handleCommentChange = (rowId: string, colId: string, comment: string) => {
        if (readOnly || !onChange) return;
        const currentRowData = value[rowId] || {};
        const currentCellData = currentRowData[colId] || { values: {} };
        const newCellData = { ...currentCellData, comment };
        onChange({ ...value, [rowId]: { ...currentRowData, [colId]: newCellData } });
    }

    return (
        <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="w-[300px] min-w-[200px]">Item</TableHead>
                            {config.columns.map(col => (
                                <TableHead key={col.id} className="min-w-[200px] text-center border-l">
                                    {col.name}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {config.sections.map(section => {
                            const sectionRows = config.rows.filter(r => r.sectionId === section.id);
                            if (sectionRows.length === 0) return null;

                            return (
                                <React.Fragment key={section.id}>
                                    {/* Section Header */}
                                    <TableRow className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleSection(section.id)}>
                                        <TableCell colSpan={config.columns.length + 1} className="font-semibold py-2">
                                            <div className="flex items-center gap-2">
                                                {expandedSections[section.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                {section.title}
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Rows */}
                                    {expandedSections[section.id] && sectionRows.map(row => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium align-top py-4">
                                                {row.text}
                                            </TableCell>
                                            {config.columns.map(col => {

                                                // Handle 'Info' (Static) Columns
                                                if (col.type === 'info') {
                                                    return (
                                                        <TableCell key={col.id} className="border-l align-top py-4 bg-gray-50/50">
                                                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                                {row.info?.[col.id] || ''}
                                                            </div>
                                                        </TableCell>
                                                    );
                                                }

                                                // Handle 'Input' Columns
                                                const cellData = value[row.id]?.[col.id] || { values: {} };

                                                return (
                                                    <TableCell key={col.id} className="border-l align-top py-4">
                                                        <div className="space-y-3">

                                                            {/* Inputs */}
                                                            <div className="flex flex-col gap-2">
                                                                {col.inputs.map(input => (
                                                                    <div key={input.id} className={cn("flex flex-col gap-1", input.type === 'checkbox' ? 'flex-row items-center' : '')}>
                                                                        {input.label && <span className="text-xs text-muted-foreground">{input.label}</span>}

                                                                        {input.type === 'checkbox' && (
                                                                            <Checkbox
                                                                                checked={!!cellData.values[input.id]}
                                                                                onCheckedChange={(c) => handleCellChange(row.id, col.id, input.id, c)}
                                                                                disabled={readOnly}
                                                                            />
                                                                        )}
                                                                        {input.type === 'text' && (
                                                                            <Input
                                                                                value={cellData.values[input.id] || ''}
                                                                                onChange={(e) => handleCellChange(row.id, col.id, input.id, e.target.value)}
                                                                                className="h-8 text-xs"
                                                                                disabled={readOnly}
                                                                            />
                                                                        )}
                                                                        {input.type === 'date' && (
                                                                            <Input
                                                                                type="date"
                                                                                value={cellData.values[input.id] || ''}
                                                                                onChange={(e) => handleCellChange(row.id, col.id, input.id, e.target.value)}
                                                                                className="h-8 text-xs"
                                                                                disabled={readOnly}
                                                                            />
                                                                        )}
                                                                        {/* Placeholder for other types */}
                                                                        {input.type === 'select' && <div className="text-xs italic text-gray-400">Select supported</div>}
                                                                        {input.type === 'file' && <div className="text-xs italic text-gray-400">File upload supported</div>}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Capabilities: Comments / Files */}
                                                            {(col.capabilities.allowComments || col.capabilities.allowAttachments) && (
                                                                <div className="flex gap-2 justify-end pt-2">
                                                                    {col.capabilities.allowComments && (
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button variant="ghost" size="sm" className={cn("h-6 w-6 p-0", cellData.comment ? "text-blue-600 bg-blue-50" : "text-gray-400")}>
                                                                                    <MessageSquare className="h-3 w-3" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-80">
                                                                                <div className="space-y-2">
                                                                                    <h4 className="font-medium leading-none">Comment</h4>
                                                                                    <Textarea
                                                                                        value={cellData.comment || ''}
                                                                                        onChange={(e) => handleCommentChange(row.id, col.id, e.target.value)}
                                                                                        placeholder="Add a comment..."
                                                                                        disabled={readOnly}
                                                                                    />
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    )}
                                                                    {col.capabilities.allowAttachments && (
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400" disabled>
                                                                            <Paperclip className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
