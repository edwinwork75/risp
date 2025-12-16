import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFormStore } from "./store/useFormStore";
import { FormHeader } from "@/components/FormBuilder/FormHeader";
import { SectionNavigation } from "@/components/FormBuilder/SectionNavigation";
import { FormCanvas } from "@/components/FormBuilder/FormCanvas";
import { FormToolbar } from "@/components/FormBuilder/FormToolbar";
import { FieldType } from "@/types/form";

export default function FormBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    title,
    description,
    fields,
    sections,
    activeSection,
    setActiveSection,
    addSection,
    updateSection,
    removeSection,
    addField,
    updateField,
    removeField,
    duplicateField,
    moveField,
    updateFormMetadata
  } = useFormStore();
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const handleSave = () => {
    const pages = sections.map(section => ({
      id: section.id,
      title: section.title,
      fields: fields.filter(f => f.section === section.id)
    }));

    console.log("Form Data (Separated by Pages):", {
      formTitle: title,
      formDescription: description,
      pages
    });

    toast({
      title: "Form Saved",
      description: "Form data has been logged to console by pages.",
    });
  };

  const handleAddField = (type: FieldType = 'text', index?: number) => {
    const newFieldId = addField(type, activeSection, index);
    setActiveFieldId(newFieldId);
  };

  const filteredFields = fields.filter(f => f.section === activeSection);

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

          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <Input
              value={title}
              onChange={(e) => updateFormMetadata({ title: e.target.value })}
              className="text-center font-medium border-transparent hover:border-input focus:border-input transition-colors bg-transparent"
              placeholder="Untitled Form"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/form-preview")}
              title="Preview Form"
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Form
            </Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)_auto] gap-8 items-start relative">
          <div className="sticky top-24">
            <SectionNavigation
              sections={sections}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onAddSection={addSection}
              onUpdateSection={updateSection}
              onRemoveSection={removeSection}
            />
          </div>

          <div className="space-y-8">
            {sections.length > 0 && activeSection === sections[0].id && (
              <FormHeader
                title={title}
                description={description}
                onUpdate={updateFormMetadata}
              />
            )}

            <FormCanvas
              fields={filteredFields}
              onReorder={moveField}
              onUpdate={updateField}
              onDelete={removeField}
              onDuplicate={duplicateField}
              onAddBelow={(index) => handleAddField('text', index)}
              activeFieldId={activeFieldId}
              setActiveFieldId={setActiveFieldId}
              onAddFirst={() => handleAddField('text')}
              onAddField={(type) => handleAddField(type)}
              onAddSection={addSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
