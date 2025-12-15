import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormStore } from "./store/useFormStore";
import { FieldEditor } from "@/components/FormBuilder/FieldEditor";
import { FormHeader } from "@/components/FormBuilder/FormHeader";
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
import { Card, CardContent } from "@/components/ui/card";

export default function FormBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { title, description, fields, addField, updateField, removeField, duplicateField, moveField, updateFormMetadata } = useFormStore();
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const prevFieldsLength = useRef(fields.length);

  /*
   * Removed useEffect for auto-focus as it was incorrectly focusing the last field
   * when inserting in the middle. We now handle focus explicitly in add handlers.
   */

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      moveField(oldIndex, newIndex);
    }
  };

  const handleSave = () => {
    console.log("Form data:", { title, description, fields });
    toast({
      title: "Form Saved",
      description: "Your form has been saved successfully.",
    });
  };

  const handleAddField = (index?: number) => {
    const newFieldId = addField('text', index);
    setActiveFieldId(newFieldId);
  };

  return (
    <div className="min-h-screen bg-background" onClick={() => setActiveFieldId(null)}>
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Form
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FormHeader
          title={title}
          description={description}
          onUpdate={updateFormMetadata}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                onUpdate={updateField}
                onDelete={removeField}
                onDuplicate={duplicateField}
                onAddBelow={() => handleAddField(index + 1)}
                isActive={field.id === activeFieldId}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFieldId(field.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        {fields.length === 0 && (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <ClipboardList className="h-16 w-16" />
                <h2 className="text-2xl font-semibold">No Questions Yet</h2>
                <p>Click the button below to start building your form.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center mt-8 gap-4">
          <Button
            onClick={() => handleAddField()}
            variant="default"
            className="gap-2"
          >
            Add New Field
          </Button>
          <Button
            onClick={() => {
              const newFieldId = addField('section', undefined);
              setActiveFieldId(newFieldId);
            }}
            variant="outline"
            className="gap-2 border-dashed"
          >
            Add Section
          </Button>
        </div>
      </div>
    </div>
  );
}
