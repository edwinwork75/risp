export type FieldType =
  | 'text'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'file'
  | 'image'
  | 'section'
  | 'signature'
  | 'textarea'
  | 'inspection_checklist';

export interface Section {
  id: string;
  title: string;
  icon?: string;
}

// Checklist Types
export interface ChecklistInput {
  id: string;
  type: 'checkbox' | 'text' | 'number' | 'date' | 'select' | 'file';
  label?: string;
  options?: string[];
  required?: boolean;
}

export interface ChecklistColumn {
  id: string;
  name: string;
  type?: 'input' | 'info'; // 'input' is default. 'info' is for static text/criteria.
  inputs: ChecklistInput[];
  capabilities: {
    allowComments: boolean;
    allowAttachments: boolean;
  };
}

export interface ChecklistSection {
  id: string;
  title: string;
  order: number;
}

export interface ChecklistRow {
  id: string;
  sectionId: string;
  text: string;
  order: number;
  info?: Record<string, string>; // Stores static text for 'info' columns (colId -> text)
}

export interface ChecklistConfig {
  columns: ChecklistColumn[];
  sections: ChecklistSection[];
  rows: ChecklistRow[];
}

export interface ChecklistCellData {
  values: Record<string, any>;
  comment?: string;
  attachments?: string[];
}
// Helper type for the full value structure of a checklist field
export type checklistPayload = Record<string, Record<string, ChecklistCellData>>; // rowId -> colId -> data

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, radio, checkbox
  section: string;
  checklistConfig?: ChecklistConfig; // For inspection_checklist
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}
