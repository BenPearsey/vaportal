import React, { useMemo } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps } from 'slate-react';

interface ReadOnlySlateProps {
  jsonString: string;
}

export function ReadOnlySlate({ jsonString }: ReadOnlySlateProps) {
  // Create a Slate editor instance.
  const editor = useMemo(() => withReact(createEditor()), []);

  // Parse the JSON string once (if it fails, fall back to an empty paragraph).
  const parsedValue: Descendant[] = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse Slate JSON:', e);
    }
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }, [jsonString]);

  // Custom renderElement function for handling custom node types.
  const renderElement = useMemo(() => {
    return (props: RenderElementProps) => {
      const { element, attributes, children } = props;
      switch (element.type) {
        case 'quote':
          return <blockquote {...attributes}>{children}</blockquote>;
        // Add more custom element types if necessary.
        default:
          return <p {...attributes}>{children}</p>;
      }
    };
  }, []);

  // Custom renderLeaf function for handling text-level formatting.
  const renderLeaf = useMemo(() => {
    return (props: RenderLeafProps) => {
      const { leaf, attributes, children } = props;
      let el = children;
      if (leaf.bold) el = <strong>{el}</strong>;
      if (leaf.italic) el = <em>{el}</em>;
      if (leaf.underline) el = <u>{el}</u>;
      if (leaf.color) el = <span style={{ color: leaf.color }}>{el}</span>;
      if (leaf.fontFamily) el = <span style={{ fontFamily: leaf.fontFamily }}>{el}</span>;
      return <span {...attributes}>{el}</span>;
    };
  }, []);

  // By using key={jsonString}, if the JSON content changes, Slate re-mounts and shows the new content.
  return (
    <Slate editor={editor} initialValue={parsedValue} onChange={() => {}} key={jsonString}>
      <Editable 
        readOnly
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="(No content)"
      />
    </Slate>
  );
}
