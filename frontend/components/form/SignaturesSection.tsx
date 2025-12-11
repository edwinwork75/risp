"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SignatureInput from "@/components/form/SignatureInput";

interface SignaturesSectionProps {
    questions: any[];
    answers: Record<number, { value: string | object }>;
    onAnswer: (id: number, value: string | object) => void;
}

export default function SignaturesSection({ questions, answers, onAnswer }: SignaturesSectionProps) {
    // Helper to find question ID. Since we hardcoded IDs in the config, we use them here.
    // We double check if question exists in props to be safe, but primarily we rely on the IDs.

    const getValue = (id: number) => {
        const val = answers[id]?.value;
        return typeof val === 'string' ? val : '';
    };

    return (
        <div className="space-y-8">
            {/* Remarks Section */}
            <div className="p-6 bg-white rounded-lg border-t-8 border-primary shadow-sm space-y-4">
                <Label className="text-lg font-semibold">Remarks:</Label>
                <Textarea
                    value={getValue(901)}
                    onChange={(e) => onAnswer(901, e.target.value)}
                    className="min-h-[150px] resize-none border-gray-300"
                    placeholder="Enter any remarks..."
                />
            </div>

            {/* Signatures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Subcon Column */}
                <Card className="border-t-4 border-t-blue-500 shadow-md">
                    <CardContent className="p-4 flex flex-col h-full space-y-4">
                        <div className="h-16 flex items-end pb-2 border-b border-gray-200">
                            <span className="font-bold text-sm uppercase">Checked and Submitted By:<br /><span className="font-normal text-xs">(Subcon. Representative)</span></span>
                        </div>

                        <div className="flex-1 min-h-[150px] border border-gray-200 bg-gray-50 rounded-md relative">
                            <SignatureInput
                                value={getValue(904)}
                                onChange={(val) => onAnswer(904, val)}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dotted border-gray-300">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Name :</Label>
                                <Input
                                    value={getValue(902)}
                                    onChange={(e) => onAnswer(902, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Date :</Label>
                                <Input
                                    type="date"
                                    value={getValue(903)}
                                    onChange={(e) => onAnswer(903, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Con Column */}
                <Card className="border-t-4 border-t-indigo-500 shadow-md">
                    <CardContent className="p-4 flex flex-col h-full space-y-4">
                        <div className="h-16 flex items-end pb-2 border-b border-gray-200">
                            <span className="font-bold text-sm uppercase">Checked By:<br /><span className="font-normal text-xs">(Main Con)</span></span>
                        </div>

                        <div className="flex-1 min-h-[150px] border border-gray-200 bg-gray-50 rounded-md relative">
                            <SignatureInput
                                value={getValue(907)}
                                onChange={(val) => onAnswer(907, val)}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dotted border-gray-300">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Name :</Label>
                                <Input
                                    value={getValue(905)}
                                    onChange={(e) => onAnswer(905, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Date :</Label>
                                <Input
                                    type="date"
                                    value={getValue(906)}
                                    onChange={(e) => onAnswer(906, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SRE/RE Column */}
                <Card className="border-t-4 border-t-purple-500 shadow-md">
                    <CardContent className="p-4 flex flex-col h-full space-y-4">
                        <div className="h-16 flex items-end pb-2 border-b border-gray-200">
                            <span className="font-bold text-sm uppercase">Checked/Acknowledged By:<br /><span className="font-normal text-xs">(SRE/RE)</span></span>
                        </div>

                        <div className="flex-1 min-h-[150px] border border-gray-200 bg-gray-50 rounded-md relative">
                            <SignatureInput
                                value={getValue(910)}
                                onChange={(val) => onAnswer(910, val)}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-dotted border-gray-300">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Name :</Label>
                                <Input
                                    value={getValue(908)}
                                    onChange={(e) => onAnswer(908, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                    placeholder="Enter Name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-gray-500">Date :</Label>
                                <Input
                                    type="date"
                                    value={getValue(909)}
                                    onChange={(e) => onAnswer(909, e.target.value)}
                                    className="bg-transparent border-t-0 border-x-0 border-b border-gray-400 rounded-none focus-visible:ring-0 px-0"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
