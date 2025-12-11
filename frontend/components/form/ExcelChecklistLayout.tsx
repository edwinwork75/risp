"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import FileUpload from "./QuestionTypes/FileUpload";
import QuestionHistoryDrawer from "./QuestionHistoryDrawer";
import { History } from "lucide-react";
import { useState } from "react";

interface ExcelChecklistLayoutProps {
    questions: any[];
    answers: Record<number, { value: string | object; comment?: string }>;
    files: Record<string | number, File[]>;
    fileUrls: Record<string | number, { name: string; url: string }[]>;
    onAnswer: (questionId: number, value: string | object) => void;
    onCommentChange: (questionId: number, comment: string) => void;
    onFilesChange: (questionId: string | number, files: File[]) => void;
    globalStartIndex?: number;
}

export default function ExcelChecklistLayout({
    questions,
    answers,
    files,
    fileUrls,
    onAnswer,
    onCommentChange,
    onFilesChange,
    globalStartIndex = 0,
}: ExcelChecklistLayoutProps) {

    // Helper to safely get dual response value
    const getDualResponse = (qId: number) => {
        return (answers[qId]?.value as any) || { main_contractor: {}, sub_contractor: {} };
    };

    const handleDualChange = (qId: number, party: 'main_contractor' | 'sub_contractor', field: string, val: any) => {
        const current = getDualResponse(qId);
        const updated = {
            ...current,
            [party]: {
                ...current[party],
                [field]: val
            }
        };
        onAnswer(qId, updated);
    };

    // Sections processing
    const sectionsMap: { [key: string]: any[] } = {};
    questions.forEach(q => {
        const sectionName = q.section || "General";
        if (!sectionsMap[sectionName]) sectionsMap[sectionName] = [];
        sectionsMap[sectionName].push(q);
    });
    const sections = Object.entries(sectionsMap);
    const currentSectionName = sections.length > 0 ? sections[0][0] : "";

    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<{ id: number, text: string } | null>(null);

    const handleHistoryClick = (q: any) => {
        setSelectedQuestion({ id: q.id, text: q.text });
        setHistoryOpen(true);
    };

    return (
        <div className="space-y-4">
            {currentSectionName && currentSectionName !== "General" && (
                <div className="p-4 bg-white rounded-lg border-l-8 border-primary shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800">{currentSectionName}</h2>
                </div>
            )}

            <div className="border rounded-md shadow-sm bg-white overflow-x-auto">
                <Table className="min-w-[1400px]">
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50 text-xs">
                            <TableHead rowSpan={2} className="w-[50px] font-bold text-black border-r border-b">S/N</TableHead>
                            <TableHead rowSpan={2} className="w-[300px] font-bold text-black border-r border-b">Item / Criteria</TableHead>
                            <TableHead colSpan={3} className="font-bold text-black text-center border-r border-b bg-blue-50/50">Subcontractor</TableHead>
                            <TableHead colSpan={3} className="font-bold text-black text-center border-r border-b bg-yellow-50/50">Main Contractor</TableHead>
                            <TableHead rowSpan={2} className="w-[200px] font-bold text-black border-b">Remarks</TableHead>
                        </TableRow>
                        <TableRow className="bg-gray-50 hover:bg-gray-50 text-xs">
                            <TableHead className="w-[80px] text-center border-r border-b bg-blue-50/30">Check</TableHead>
                            <TableHead className="w-[140px] text-center border-r border-b bg-blue-50/30">Date</TableHead>
                            <TableHead className="w-[200px] text-center border-r border-b bg-blue-50/30">Details</TableHead>

                            <TableHead className="w-[80px] text-center border-r border-b bg-yellow-50/30">Check</TableHead>
                            <TableHead className="w-[140px] text-center border-r border-b bg-yellow-50/30">Date</TableHead>
                            <TableHead className="w-[200px] text-center border-r border-b bg-yellow-50/30">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sections.map(([sectionName, sectionQuestions]) => (
                            <>
                                {sectionQuestions.map((q, idx) => {
                                    const sn = globalStartIndex + idx + 1;
                                    const isProjectInfo = sectionName === 'Project Information';
                                    const rowLabel = isProjectInfo ? `${sn}.` : `${String.fromCharCode(97 + idx)}.`;

                                    const dualValue = q.type === 'dual-response-date' ? getDualResponse(q.id) : null;
                                    const isDual = q.type === 'dual-response-date';

                                    return (
                                        <TableRow key={q.id} className="hover:bg-gray-50/50 align-top">
                                            {/* S/N */}
                                            <TableCell className="font-medium align-top border-r">{rowLabel}</TableCell>

                                            {/* Item / Criteria */}
                                            {/* Item / Criteria */}
                                            <TableCell className="align-top border-r relative group">
                                                <p className="text-sm whitespace-pre-wrap pr-6">{q.text}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 absolute top-2 right-1"
                                                    onClick={() => handleHistoryClick(q)}
                                                    title="View History"
                                                >
                                                    <History className="h-3 w-3 text-muted-foreground" />
                                                </Button>
                                            </TableCell>

                                            {/* Subcontractor Columns */}
                                            {isDual ? (
                                                <>
                                                    <TableCell className="align-top border-r bg-blue-50/10 p-2 text-center">
                                                        <div className="flex flex-col gap-2 items-center">
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`${q.id}-sub-resp`}
                                                                    checked={dualValue?.sub_contractor?.response === 'Yes'}
                                                                    onChange={() => handleDualChange(q.id, 'sub_contractor', 'response', 'Yes')}
                                                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                />
                                                                Yes
                                                            </label>
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`${q.id}-sub-resp`}
                                                                    checked={dualValue?.sub_contractor?.response === 'No'}
                                                                    onChange={() => handleDualChange(q.id, 'sub_contractor', 'response', 'No')}
                                                                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                />
                                                                No
                                                            </label>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top border-r bg-blue-50/10 p-2">
                                                        <input
                                                            type="date"
                                                            className="h-7 w-full rounded border border-input bg-transparent px-1 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                                                            value={dualValue?.sub_contractor?.date ? format(new Date(dualValue?.sub_contractor?.date), 'yyyy-MM-dd') : ''}
                                                            onChange={(e) => handleDualChange(q.id, 'sub_contractor', 'date', e.target.value ? new Date(e.target.value) : undefined)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="align-top border-r bg-blue-50/10 p-2">
                                                        <Input
                                                            placeholder="Comment..."
                                                            value={dualValue?.sub_contractor?.comment || ''}
                                                            onChange={(e) => handleDualChange(q.id, 'sub_contractor', 'comment', e.target.value)}
                                                            className="h-7 text-xs mb-1"
                                                        />
                                                        <FileUploadComp
                                                            files={files[`${q.id}_sub`] || []}
                                                            onChange={(fs) => onFilesChange(`${q.id}_sub`, fs)}
                                                            compact
                                                            label="Sub"
                                                        />
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <TableCell colSpan={3} className="border-r bg-gray-50/30"></TableCell>
                                            )}

                                            {/* Main Contractor Columns */}
                                            {isDual ? (
                                                <>
                                                    <TableCell className="align-top border-r bg-yellow-50/10 p-2 text-center">
                                                        <div className="flex flex-col gap-2 items-center">
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`${q.id}-main-resp`}
                                                                    checked={dualValue?.main_contractor?.response === 'Yes'}
                                                                    onChange={() => handleDualChange(q.id, 'main_contractor', 'response', 'Yes')}
                                                                    className="h-3 w-3 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                                                                />
                                                                Yes
                                                            </label>
                                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                                <input
                                                                    type="radio"
                                                                    name={`${q.id}-main-resp`}
                                                                    checked={dualValue?.main_contractor?.response === 'No'}
                                                                    onChange={() => handleDualChange(q.id, 'main_contractor', 'response', 'No')}
                                                                    className="h-3 w-3 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                                                                />
                                                                No
                                                            </label>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-top border-r bg-yellow-50/10 p-2">
                                                        <input
                                                            type="date"
                                                            className="h-7 w-full rounded border border-input bg-transparent px-1 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none"
                                                            value={dualValue?.main_contractor?.date ? format(new Date(dualValue?.main_contractor?.date), 'yyyy-MM-dd') : ''}
                                                            onChange={(e) => handleDualChange(q.id, 'main_contractor', 'date', e.target.value ? new Date(e.target.value) : undefined)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="align-top border-r bg-yellow-50/10 p-2">
                                                        <Input
                                                            placeholder="Comment..."
                                                            value={dualValue?.main_contractor?.comment || ''}
                                                            onChange={(e) => handleDualChange(q.id, 'main_contractor', 'comment', e.target.value)}
                                                            className="h-7 text-xs mb-1"
                                                        />
                                                        <FileUploadComp
                                                            files={files[`${q.id}_main`] || []}
                                                            onChange={(fs) => onFilesChange(`${q.id}_main`, fs)}
                                                            compact
                                                            label="Main"
                                                        />
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <TableCell colSpan={3} className="border-r bg-gray-50/30">
                                                    {/* If generic question, render it here fully? No, let's keep it clean. */}
                                                </TableCell>
                                            )}

                                            {/* Remarks / General Answer */}
                                            <TableCell className="align-top p-2">
                                                {!isDual ? (
                                                    <div className="space-y-2">
                                                        {renderGenericInput(q, answers, onAnswer)}
                                                        <Textarea
                                                            placeholder="Remarks..."
                                                            className="mt-2 min-h-[40px] text-xs"
                                                            value={answers[q.id]?.comment || ''}
                                                            onChange={(e) => onCommentChange(q.id, e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    // Only general remarks if needed
                                                    <Textarea
                                                        placeholder="General Remarks..."
                                                        className="min-h-[40px] text-xs"
                                                        value={answers[q.id]?.comment || ''}
                                                        onChange={(e) => onCommentChange(q.id, e.target.value)}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {selectedQuestion && (
                <QuestionHistoryDrawer
                    open={historyOpen}
                    onOpenChange={setHistoryOpen}
                    questionText={selectedQuestion.text}
                />
            )}
        </div>
    );
}

// Compact File Upload Component specifically for Table Cell
function FileUploadComp({ files, onChange, compact, label }: { files: File[], onChange: (f: File[]) => void, compact?: boolean, label?: string }) {
    const hiddenInputRef = document.getElementById(`hidden-file-input-${label}`) as HTMLInputElement;

    return (
        <div className="flex flex-col gap-1">
            <label className="cursor-pointer bg-white hover:bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] border border-dashed border-gray-300 inline-flex items-center gap-1 w-full justify-center">
                <Upload className="h-3 w-3" />
                {files.length > 0 ? `${files.length} Added` : "Attach"}
                <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) {
                            onChange([...files, ...Array.from(e.target.files)]);
                        }
                    }}
                />
            </label>
            {files.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {files.map((f, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 px-1 rounded truncate max-w-[80px] border border-blue-100">{f.name}</span>
                    ))}
                </div>
            )}
        </div>
    )
}

function renderGenericInput(q: any, answers: any, onAnswer: any) {
    const val = answers[q.id]?.value;
    switch (q.type) {
        case 'short-answer':
        case 'number':
            return <Input
                className="h-8 text-sm"
                value={val || ''}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                type={q.type === 'number' ? 'number' : 'text'}
            />;
        case 'radio':
        case 'multiple-choice':
            return (
                <div className="flex flex-col gap-1">
                    {q.options?.map((opt: string) => (
                        <label key={opt} className="flex items-center gap-2 text-xs">
                            <input
                                type={q.type === 'multiple-choice' ? 'checkbox' : 'radio'}
                                checked={val === opt} // simplified for radio
                                onChange={() => onAnswer(q.id, opt)}
                                name={`q-${q.id}`}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            )
        case 'date':
            return <input
                type="date"
                className="h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={val ? format(new Date(val), 'yyyy-MM-dd') : ''}
                onChange={(e) => onAnswer(q.id, e.target.value)}
            />
        default:
            return <span className="text-xs text-gray-400">Unsupported type</span>;
    }
}
