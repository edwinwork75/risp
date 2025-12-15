import { FieldType, FormField } from "@/types/form";
import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";

interface FormStore {
    title: string;
    description: string;
    fields: FormField[];
    updateFormMetadata: (metadata: { title?: string; description?: string }) => void;
    addField: (type: FieldType, index?: number) => string;
    updateField: (id: string, updatedField: Partial<FormField>) => void;
    removeField: (id: string) => void;
    duplicateField: (id: string) => void;
    moveField: (fromIndex: number, toIndex: number) => void;
    resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
    title: "Untitled Form",
    description: "",
    fields: [],
    updateFormMetadata: (metadata) => set((state) => ({ ...state, ...metadata })),
    addField: (type: FieldType, index?: number) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type,
            label: "",
            required: false,
            options: ['dropdown', 'radio', 'checkbox'].includes(type)
                ? ['']
                : undefined,
        };

        set((state) => {
            if (index !== undefined) {
                const newFields = [...state.fields];
                newFields.splice(index, 0, newField);
                return { fields: newFields };
            }
            return { fields: [...state.fields, newField] };
        });

        return newField.id;
    },
    updateField: (id, updatedField) => set((state) => ({
        fields: state.fields.map((field) => field.id === id ? { ...field, ...updatedField } : field)
    })),
    removeField: (id) => set((state) => ({
        fields: state.fields.filter((field) => field.id !== id)
    })),
    duplicateField: (id) => set((state) => {
        const fieldToDuplicate = state.fields.find((f) => f.id === id);
        if (!fieldToDuplicate) return state;

        const duplicatedField: FormField = {
            ...fieldToDuplicate,
            id: `field-${Date.now()}`,
            label: `${fieldToDuplicate.label} `,
        };
        const index = state.fields.findIndex((f) => f.id === id);
        const newFields = [...state.fields];
        newFields.splice(index + 1, 0, duplicatedField);
        return { fields: newFields };
    }),
    moveField: (fromIndex, toIndex) => set((state) => ({
        fields: arrayMove(state.fields, fromIndex, toIndex),
    })),
    resetForm: () => set({ fields: [] }),
}));