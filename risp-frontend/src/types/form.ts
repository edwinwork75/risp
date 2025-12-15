export type FieldType = 
  | 'text' 
  | 'number' 
  | 'phone' 
  | 'dropdown' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'time' 
  | 'file'
  | 'image';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For dropdown, radio, checkbox
}

export interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}
