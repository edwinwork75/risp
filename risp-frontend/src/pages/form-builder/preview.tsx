import { useState } from "react";
import { useFormStore } from "./store/useFormStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function FormPreview() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { title, description, fields, sections } = useFormStore();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    const currentSection = sections[currentSectionIndex];
    const currentFields = fields.filter(f => f.section === currentSection.id);

    const isFirstPage = currentSectionIndex === 0;
    const isLastPage = currentSectionIndex === sections.length - 1;

    const handleNext = () => {
        if (!isLastPage) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (!isFirstPage) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = () => {
        console.log("Form Submitted:", formValues);
        toast({
            title: "Success",
            description: "Form submitted successfully (check console for data).",
        });
        setTimeout(() => navigate('/form-builder'), 2000);
    };

    const handleValueChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Preview Header - Always Visible */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span>Preview Mode</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/form-builder')}>
                    Close Preview
                </Button>
            </div>

            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Form Header - Only on First Page */}
                    {isFirstPage && (
                        <Card className="border-t-8 border-t-[#FFD539]">
                            <CardHeader>
                                <CardTitle className="text-3xl font-normal">{title}</CardTitle>
                                {description && <CardDescription className="text-lg mt-2">{description}</CardDescription>}
                            </CardHeader>
                        </Card>
                    )}

                    {/* Section Title (if pages > 1 and not first page, or if it has a custom title) */}
                    {(!isFirstPage || sections.length > 1) && (
                        <Card className="bg-white border-l-4 border-l-[#FFD539]">
                            <CardHeader className="py-4">
                                <CardTitle className="text-xl">{currentSection.title}</CardTitle>
                            </CardHeader>
                        </Card>
                    )}

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        {currentFields.map((field) => (
                            <Card key={field.id}>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <Label className="text-base font-medium">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </Label>
                                        </div>

                                        {/* Field Rendering Logic */}
                                        {(() => {
                                            switch (field.type) {
                                                case 'text':
                                                case 'date':
                                                case 'time':
                                                case 'file':
                                                case 'image':
                                                    return (
                                                        <Input
                                                            type={field.type === 'image' ? 'file' : field.type}
                                                            placeholder={field.placeholder}
                                                            required={field.required}
                                                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                                                        />
                                                    );
                                                case 'textarea':
                                                    return (
                                                        <Textarea
                                                            placeholder={field.placeholder}
                                                            required={field.required}
                                                            className="min-h-[100px]"
                                                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                                                        />
                                                    );
                                                case 'dropdown':
                                                    return (
                                                        <Select onValueChange={(val) => handleValueChange(field.id, val)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {field.options?.map((opt, idx) => (
                                                                    <SelectItem key={idx} value={opt || `option-${idx}`}>
                                                                        {opt}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    );
                                                case 'radio':
                                                    return (
                                                        <RadioGroup onValueChange={(val) => handleValueChange(field.id, val)}>
                                                            {field.options?.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center space-x-2">
                                                                    <RadioGroupItem value={opt || `option-${idx}`} id={`${field.id}-${idx}`} />
                                                                    <Label htmlFor={`${field.id}-${idx}`}>{opt}</Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    );
                                                case 'checkbox':
                                                    return (
                                                        <div className="space-y-2">
                                                            {field.options?.map((opt, idx) => (
                                                                <div key={idx} className="flex items-center space-x-2">
                                                                    <Checkbox id={`${field.id}-${idx}`} />
                                                                    <Label htmlFor={`${field.id}-${idx}`}>{opt}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                case 'section':
                                                    return (
                                                        <div className="py-2">
                                                            {/* This is a "Title/Description" field type, not a page break */}
                                                            <h3 className="text-lg font-medium">{field.label}</h3>
                                                            {field.placeholder && <p className="text-sm text-gray-500">{field.placeholder}</p>}
                                                        </div>
                                                    );
                                                case 'signature':
                                                    return (
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                                                            <p className="text-gray-500">Tap to Sign (Simulation)</p>
                                                        </div>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </form>

                    <div className="flex justify-between items-center py-6">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isFirstPage}
                            className={isFirstPage ? "invisible" : ""}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        {isLastPage ? (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => navigate('/form-builder')}>
                                    Edit
                                </Button>
                                <Button onClick={handleSubmit} className="bg-[#FFD539] text-black hover:bg-[#ffe066]">
                                    Submit <Check className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
