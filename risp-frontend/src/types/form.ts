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
  | 'textarea';

export interface Section {
  id: string;
  title: string;
  icon?: string;
}

// export type FormSection = 'project-info' | 'inspection-items' | 'approval'; // Deprecated

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, radio, checkbox
  section: string; // Changed from FormSection to string (id)
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}
