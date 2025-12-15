import React from "react";
import { OptionsEditor } from "./OptionsEditor";
import { SectionEditor } from "./SectionEditor";
import { FormField, FieldType } from "@/types/form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy, Type, CheckSquare, ChevronDown, ToggleLeft, Calendar, Clock, File, Hash, Phone, FileImage, Heading } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface FieldEditorProps {
  field: FormField;
  onUpdate: (id: string, updatedField: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddBelow: () => void;
  isActive: boolean;
  onClick: (event: React.MouseEvent) => void;
}

const fieldTypeIcons: Record<FieldType, JSX.Element> = {
  text: <Type className="h-4 w-4" />,
  dropdown: <ChevronDown className="h-4 w-4" />,
  radio: <ToggleLeft className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  time: <Clock className="h-4 w-4" />,
  file: <File className="h-4 w-4" />,
  image: <FileImage className="h-4 w-4" />,
  section: <Heading className="h-4 w-4" />,
};

const renderPreview = (field: FormField) => {
  switch (field.type) {
    case 'text':

    case 'date':
    case 'time':
      return <Input placeholder={field.placeholder || `Enter ${field.type}`} disabled className="mt-2 placeholder-gray-500" />;
    case 'dropdown':
    case 'radio':
      return (
        <RadioGroup disabled className="mt-2 space-y-2">
          {(field.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${index}`} />
              <Label htmlFor={`${field.id}-${index}`}>{option || `Option ${index + 1}`}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'checkbox':
      return (
        <div className="mt-2 space-y-2">
          {(field.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox id={`${field.id}-${index}`} disabled />
              <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    case 'file':
      return <Input type="file" disabled className="mt-2 placeholder-gray-500" />;
    case 'image':
      return <Input type="file" accept="image/*" disabled className="mt-2 placeholder-gray-500" />;
    default:
      return null;
  }
}


export function FieldEditor({ field, onUpdate, onDelete, onDuplicate, onAddBelow, isActive, onClick }: FieldEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  const fieldTypes: FieldType[] = [
    'text', 'dropdown', 'radio', 'checkbox', 'date', 'time', 'file', 'image'
  ];

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group" onClick={onClick}>
      <Card className={cn("mb-3 border-l-[6px]", {
        "border-[#FFD539]": field.type === 'section',
        "border-primary": field.type !== 'section' && isActive,
        "border-transparent": field.type !== 'section' && !isActive
      })}>
        <div {...listeners} className={cn("absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab z-10", { "opacity-100": isActive })}>
          <GripVertical className="h-5 w-5 text-muted-foreground bg-background rounded-full p-1" />
        </div>
        <CardContent className="p-4 space-y-4">
          {field.type === 'section' ? (
            <SectionEditor
              field={field}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isActive={isActive}
            />
          ) : (
            isActive ? (
              <>
                {/* Active State: Full Editing UI */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow pr-4">
                    <Input
                      value={field.label}
                      onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                      placeholder="Enter your label"
                      className="text-lg font-normal border-0 focus-visible:ring-0 px-3 py-2 placeholder:text-gray-400"
                    />

                  </div>
                  <div className="w-1/3">
                    <Select
                      value={field.type}
                      onValueChange={(value: FieldType) => {
                        const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(value);
                        const currentOptions = field.options || [];
                        if (needsOptions && currentOptions.length === 0) {
                          onUpdate(field.id, { type: value, options: [''], placeholder: 'Option 1' });
                        } else {
                          onUpdate(field.id, { type: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
                  <OptionsEditor
                    options={field.options || []}
                    onUpdate={(newOptions) => onUpdate(field.id, { options: newOptions })}
                  />
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onDuplicate(field.id)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(field.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <>
                    <div className="border-l h-6 mx-2" />
                    <Label htmlFor={`required-${field.id}`} className="mr-2">Required</Label>
                    <Switch
                      id={`required-${field.id}`}
                      checked={field.required}
                      onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
                    />
                  </>
                </div>

                <div className="flex justify-center mt-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddBelow();
                    }}
                    variant="default"
                    className="gap-2"
                  >
                    Add New Field
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Inactive State: Preview */}
                <div className="min-h-[100px]">
                  <div className="flex justify-between items-start">
                    <>
                      <p className="text-lg font-normal">
                        {field.label}
                        {field.required && <span className="text-destructive text-lg ml-1">*</span>}
                      </p>
                      <Badge variant="outline" className="flex items-center gap-2">
                        {fieldTypeIcons[field.type]}
                        <span className="capitalize">{field.type}</span>
                      </Badge>
                    </>
                  </div>
                  <div className="mt-2">
                    {renderPreview(field)}
                  </div>
                </div>
              </>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}