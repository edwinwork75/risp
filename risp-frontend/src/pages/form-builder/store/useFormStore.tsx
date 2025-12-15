import { FieldType, FormField } from "@/types/form";
import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";

interface FormStore {
    fields: FormField[];
    addField: (type: FieldType) => void;
    updateField: (id: string, updatedField: Partial<FormField>) => void;
    removeField: (id: string) => void;
    duplicateField: (id: string) => void;
    moveField: (fromIndex: number, toIndex: number) => void;
    resetForm: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
    fields: [],
    addField: (type: FieldType) => set((state) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type,
            label: "",
            required: false,
            options: ['dropdown', 'radio', 'checkbox'].includes(type)
                ? ['']
                : undefined,
        };
        return { fields: [...state.fields, newField] };
    }),
    updateField: (id, updatedField) => set((state) => ({
       fields:state.fields.map((field)=>field.id===id?{...field,...updatedField}:field)
    })),
    removeField: (id) => set((state) => ({
        fields:state.fields.filter((field)=>field.id!==id)
    })),
    duplicateField: (id) => set((state) => {
        const fieldToDuplicate = state.fields.find((f) => f.id === id);
        if (!fieldToDuplicate) return state;

        const duplicatedField: FormField = {
            ...fieldToDuplicate,
            id: `field-${Date.now()}`,
            label: `${fieldToDuplicate.label} (Copy)`,
        };
        const index = state.fields.findIndex((f) => f.id === id);
        const newFields = [...state.fields];
        newFields.splice(index + 1, 0, duplicatedField);
        return { fields: newFields };
    }),
    moveField: (fromIndex, toIndex) => set((state) => ({
        fields: arrayMove(state.fields, fromIndex, toIndex),
    })),
    resetForm: ()=>set({fields:[]}),
}));