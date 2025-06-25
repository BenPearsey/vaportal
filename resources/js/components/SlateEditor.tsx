/* ---------------------------------------------------------------------
   SlateEditor.tsx  – colour-free version
   ------------------------------------------------------------------ */
   import React, {
    useState, useEffect, useMemo, useCallback
  } from 'react';
  import {
    createEditor, Descendant, Editor, Transforms, Node
  } from 'slate';
  import {
    Slate, Editable, withReact,
    useSlate, RenderElementProps, RenderLeafProps
  } from 'slate-react';
  import '@/types/slate';               // your custom Slate types
  
  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  export interface SlateEditorProps {
    value: Descendant[];
    onChange: (value: Descendant[]) => void;
    placeholder?: string;
  }
  
  /** empty document fallback */
  export const defaultValue: Descendant[] = [
    { type: 'paragraph', children: [{ text: '' }] }
  ];
  
  /* ------------------------------------------------------------------ */
  /* Editor component                                                    */
  /* ------------------------------------------------------------------ */
  export default function SlateEditor({
    value, onChange, placeholder
  }: SlateEditorProps) {
    /* needed for Next / Vite SSR hydration */
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
  
    /* Slate instance (once) */
    const editor = useMemo(() => withReact(createEditor()), []);
  
    /* ------------- rendering helpers -------------------------------- */
    const renderElement = useCallback((props: RenderElementProps) => {
      const { element, attributes, children } = props;
      /* alignment support */
      const style: React.CSSProperties = {};
      const align = (element as any).align as
        | 'left' | 'center' | 'right' | 'justify' | undefined;
      if (align) style.textAlign = align;
      return <p style={style} {...attributes}>{children}</p>;
    }, []);
  
    const renderLeaf = useCallback((props: RenderLeafProps) => {
      const { leaf, attributes, children } = props;
      const style: React.CSSProperties = {};
      if (leaf.bold)       style.fontWeight   = 'bold';
      if (leaf.italic)     style.fontStyle    = 'italic';
      if (leaf.underline)  style.textDecoration = 'underline';
      if (leaf.fontFamily) style.fontFamily   = leaf.fontFamily as string;
      return <span style={style} {...attributes}>{children}</span>;
    }, []);
  
    /* guard against empty / malformed value */
    const safeValue =
      Array.isArray(value) && value.length ? value : defaultValue;
  
    if (!mounted) return null;
  
    return (
      <Slate
        editor={editor}
        initialValue={safeValue}
        onChange={val => onChange(val.length ? val : defaultValue)}
      >
        <Toolbar editor={editor} />
        <Editable
          placeholder={placeholder ?? 'Write…'}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
    );
  }
  
  /* ------------------------------------------------------------------ */
  /* Type helper to match your CustomElement                            */
  /* ------------------------------------------------------------------ */
  const isCustomElement = (n: Node): n is
    import('@/types/slate').CustomElement =>
    typeof n === 'object' && n !== null &&
    'type' in n && 'children' in n;
  
  /* ------------------------------------------------------------------ */
  /* Toolbar (colour-free)                                               */
  /* ------------------------------------------------------------------ */
  interface ToolbarProps { editor: Editor }
  
  const Toolbar = ({ editor }: ToolbarProps) => {
    /* mark toggler (bold / italic / underline / fontFamily) */
    const toggleMark = (mark: string, value: boolean | string = true) => {
      const marks = Editor.marks(editor) as Record<string, any> | null;
      if (marks?.[mark]) {
        Editor.removeMark(editor, mark);
      } else {
        Editor.addMark(editor, mark, value);
      }
    };
  
    /* block alignment */
    const setAlign = (
      align: 'left' | 'center' | 'right' | 'justify'
    ) => {
      Transforms.setNodes(
        editor,
        { align } as Partial<import('@/types/slate').CustomElement>,
        { match: n => isCustomElement(n) }
      );
    };
  
    /* handlers ------------------------------------------------------- */
    const onFont = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const font = e.target.value;
      font ? toggleMark('fontFamily', font)
           : Editor.removeMark(editor, 'fontFamily');
    };
    const onAlign = (e: React.ChangeEvent<HTMLSelectElement>) =>
      setAlign(e.target.value as any);
  
    /* UI ------------------------------------------------------------- */
    return (
      <div style={{
        marginBottom: 8, display:'flex', gap:12, alignItems:'center'
      }}>
        {/* font family */}
        <label className="sr-only" htmlFor="fontSel">Font</label>
        <select id="fontSel" defaultValue="" onChange={onFont}>
          <option value="">Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
        </select>
  
        {/* inline marks */}
        <button type="button"
                onMouseDown={e=>{e.preventDefault();toggleMark('bold');}}>
          <strong>B</strong>
        </button>
        <button type="button"
                onMouseDown={e=>{e.preventDefault();toggleMark('italic');}}>
          <em>I</em>
        </button>
        <button type="button"
                onMouseDown={e=>{e.preventDefault();toggleMark('underline');}}>
          <u>U</u>
        </button>
  
        {/* alignment */}
        <label className="sr-only" htmlFor="alignSel">Align</label>
        <select id="alignSel" defaultValue="" onChange={onAlign}>
          <option value="">Default</option>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>
    );
  };
  