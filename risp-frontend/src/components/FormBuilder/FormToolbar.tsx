import { Plus, SplitSquareVertical } from "lucide-react";
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
    embedded?: boolean;
}

export function FormToolbar({ onAddField, onAddSection, embedded }: FormToolbarProps) {
    const defaultClasses = "bg-white border shadow-sm p-2 flex gap-4 md:gap-2 fixed bottom-0 left-0 right-0 z-50 justify-center md:static md:flex-col md:p-1.5 md:bg-white md:rounded-lg md:border md:shadow-sm md:sticky md:top-24";
    const embeddedClasses = "absolute -right-16 top-0 flex flex-col gap-2 bg-white p-2 rounded-lg border shadow-sm z-10 hidden md:flex";

    return (
        <div className={embedded ? embeddedClasses : defaultClasses}>
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
                            onClick={() => onAddSection()}
                        >
                            <SplitSquareVertical className="h-5 w-5 text-gray-600" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>Add Section</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
