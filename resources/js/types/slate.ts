import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontFamily?: string;
};

export type CustomElement = {
  type: 'paragraph' | 'heading' | 'quote'; // extend as needed
  children: CustomText[];
  align?: 'left' | 'center' | 'right' | 'justify';
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
