import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormField } from "@/types/form";
import { FieldEditor } from "./FieldEditor";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormCanvasProps {
    fields: FormField[];
    onReorder: (activeId: string, overId: string) => void;
    onUpdate: (id: string, updatedField: Partial<FormField>) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onAddBelow: (index: number) => void;
    activeFieldId: string | null;
    setActiveFieldId: (id: string | null) => void;
    onAddFirst: () => void;
}

export function FormCanvas({
    fields,
    onReorder,
    onUpdate,
    onDelete,
    onDuplicate,
    onAddBelow,
    activeFieldId,
    setActiveFieldId,
    onAddFirst,
}: FormCanvasProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            onReorder(active.id as string, over.id as string);
        }
    };

    if (fields.length === 0) {
        return (
            <Card className="border-dashed border-2 mt-4">
                <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <ClipboardList className="h-16 w-16" />
                        <h2 className="text-2xl font-semibold">No Fields in this Section</h2>
                        <p>Click below to start adding fields.</p>
                        <Button variant="outline" onClick={onAddFirst}>
                            Add Field
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <FieldEditor
                            key={field.id}
                            field={field}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onAddBelow={() => onAddBelow(index + 1)}
                            isActive={field.id === activeFieldId}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveFieldId(field.id);
                            }}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
