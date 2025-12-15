import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormHeaderProps {
    title: string;
    description: string;
    onUpdate: (data: { title?: string; description?: string }) => void;
}

export function FormHeader({ title, description, onUpdate }: FormHeaderProps) {
    return (
        <Card className="mb-4 border-t-[10px] border-t-primary border-x border-b">
            <CardContent className="p-6 space-y-4">
                <Input
                    value={title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Form Title"
                    className="text-3xl font-medium border-0 border-b border-transparent focus-visible:ring-0 focus-visible:border-primary px-0 rounded-none h-auto pb-2 placeholder:text-gray-400"
                />
                <Textarea
                    value={description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Form Description"
                    className="resize-none border-0 border-b border-transparent focus-visible:ring-0 focus-visible:border-gray-300 px-0 rounded-none min-h-[auto] placeholder:text-gray-400 text-sm"
                    rows={1}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                />
            </CardContent>
        </Card>
    );
}
