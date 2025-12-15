import { Plus, Type, Image, SplitSquareHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FieldType } from "@/types/form";

interface FormToolbarProps {
    onAddField: (type: FieldType) => void;
    onAddSection: () => void;
}

export function FormToolbar({ onAddField, onAddSection }: FormToolbarProps) {
    return (
        <div className="bg-white border shadow-sm p-2 flex gap-4 md:gap-2 fixed bottom-0 left-0 right-0 z-50 justify-center md:static md:flex-col md:p-1.5 md:bg-white md:rounded-lg md:border md:shadow-sm md:sticky md:top-24">
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-100"
                            onClick={() => onAddField('text')}
                        >
                            <Plus className="h-5 w-5 text-gray-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add Question</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-100"
                            onClick={() => onAddField('section')}
                        >
                            <Type className="h-5 w-5 text-gray-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add Title and Description</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-100"
                            onClick={() => onAddField('image')}
                        >
                            <Image className="h-5 w-5 text-gray-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add Image</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-gray-100"
                            onClick={onAddSection}
                        >
                            <SplitSquareHorizontal className="h-5 w-5 text-gray-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add Section (Page)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
