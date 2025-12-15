import { FieldType, FormField, Section } from "@/types/form";
import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";

interface FormStore {
    title: string;
    description: string;
    fields: FormField[];
    sections: Section[];
    activeSection: string;
    setActiveSection: (sectionId: string) => void;

    // Form Metadata
    updateFormMetadata: (metadata: { title?: string; description?: string }) => void;

    // Section Management
    addSection: () => void;
    updateSection: (id: string, updates: Partial<Section>) => void;
    removeSection: (id: string) => void;
    reorderSections: (activeId: string, overId: string) => void;

    // Field Management
    addField: (type: FieldType, sectionId: string, index?: number) => string;
    updateField: (id: string, updatedField: Partial<FormField>) => void;
    removeField: (id: string) => void;
    duplicateField: (id: string) => void;
    moveField: (activeId: string, overId: string) => void;
    resetForm: () => void;
}

export const useFormStore = create<FormStore>((set, get) => ({
    title: "Untitled Form",
    description: "",
    fields: [],

    // Initialize with a single default page
    sections: [{ id: 'page-1', title: 'Page 1', icon: 'file' }],
    activeSection: 'page-1',
    setActiveSection: (sectionId) => set({ activeSection: sectionId }),

    updateFormMetadata: (metadata) => set((state) => ({ ...state, ...metadata })),

    // Section Actions
    addSection: () => set((state) => {
        const newId = `page-${Date.now()}`;
        const newSection: Section = {
            id: newId,
            title: `Page ${state.sections.length + 1}`,
            icon: 'file'
        };
        return {
            sections: [...state.sections, newSection],
            activeSection: newId // Switch to new section immediately
        };
    }),
    updateSection: (id, updates) => set((state) => ({
        sections: state.sections.map((s) => s.id === id ? { ...s, ...updates } : s)
    })),
    removeSection: (id) => set((state) => {
        if (state.sections.length <= 1) return state; // Prevent deleting the last section

        const newSections = state.sections.filter(s => s.id !== id);
        // If active section is deleted, switch to the first one
        const newActiveSection = state.activeSection === id ? newSections[0].id : state.activeSection;

        return {
            sections: newSections,
            activeSection: newActiveSection,
            // Also remove fields belonging to this section
            fields: state.fields.filter(f => f.section !== id)
        };
    }),
    reorderSections: (activeId, overId) => set((state) => {
        const oldIndex = state.sections.findIndex((s) => s.id === activeId);
        const newIndex = state.sections.findIndex((s) => s.id === overId);
        if (oldIndex === -1 || newIndex === -1) return state;
        return { sections: arrayMove(state.sections, oldIndex, newIndex) };
    }),

    // Field Actions
    addField: (type: FieldType, sectionId: string, index?: number) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type,
            label: "",
            required: false,
            section: sectionId,
            options: ['dropdown', 'radio', 'checkbox'].includes(type)
                ? ['']
                : undefined,
        };

        set((state) => {
            if (index !== undefined) {
                const sectionFields = state.fields.filter(f => f.section === sectionId);
                if (index < sectionFields.length) {
                    const targetField = sectionFields[index];
                    const realIndex = state.fields.findIndex(f => f.id === targetField.id);
                    const newFields = [...state.fields];
                    newFields.splice(realIndex, 0, newField);
                    return { fields: newFields };
                }
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
    moveField: (activeId: string, overId: string) => set((state) => {
        const oldIndex = state.fields.findIndex((f) => f.id === activeId);
        const newIndex = state.fields.findIndex((f) => f.id === overId);

        if (oldIndex === -1 || newIndex === -1) return state;

        return {
            fields: arrayMove(state.fields, oldIndex, newIndex),
        };
    }),
    resetForm: () => set({ fields: [], sections: [{ id: 'page-1', title: 'Page 1', icon: 'file' }], activeSection: 'page-1' }),
}));