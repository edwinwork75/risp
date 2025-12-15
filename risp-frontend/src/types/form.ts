export type FieldType =
  | 'text'
  | 'dropdown'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'file'
  | 'image'
  | 'section';

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
