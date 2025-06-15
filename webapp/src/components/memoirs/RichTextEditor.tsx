import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './RichTextEditor.css'; // We'll create this for basic editor styling

interface RichTextEditorProps {
  initialContent?: string;
  onContentChange: (htmlContent: string) => void; // Callback to send HTML content to parent
  editorRef?: React.MutableRefObject<Editor | null>; // To expose editor instance
}

const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive?: boolean) =>
    `px-3 py-1 m-1 border rounded ${isActive ? 'bg-indigo-500 text-white' : 'bg-white hover:bg-gray-100'}`;

  return (
    <div className="bg-gray-100 p-2 rounded-t-lg border-b border-gray-300 flex flex-wrap items-center" role="toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        aria-pressed={editor.isActive('bold')}
        aria-label="Toggle bold text"
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        aria-pressed={editor.isActive('italic')}
        aria-label="Toggle italic text"
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        aria-pressed={editor.isActive('strike')}
        aria-label="Toggle strikethrough text"
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={buttonClass(editor.isActive('paragraph'))}
        aria-pressed={editor.isActive('paragraph')}
        aria-label="Set as paragraph"
      >
        Paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        aria-pressed={editor.isActive('heading', {level: 1})}
        aria-label="Toggle heading level 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        aria-pressed={editor.isActive('heading', {level: 2})}
        aria-label="Toggle heading level 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        aria-pressed={editor.isActive('heading', {level: 3})}
        aria-label="Toggle heading level 3"
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        aria-pressed={editor.isActive('bulletList')}
        aria-label="Toggle bullet list"
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        aria-pressed={editor.isActive('orderedList')}
        aria-label="Toggle ordered list"
      >
        Ordered List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        aria-pressed={editor.isActive('blockquote')}
        aria-label="Toggle blockquote"
      >
        Blockquote
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={buttonClass()} aria-label="Insert horizontal rule">
        Horizontal Rule
      </button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={buttonClass()} aria-label="Undo last action">
        Undo
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={buttonClass()} aria-label="Redo last undone action">
        Redo
      </button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent = '', onContentChange, editorRef }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit options here if needed
        // For example, to disable some default extensions:
        // heading: { levels: [1, 2, 3] },
        // history: true, // Already enabled by default
      }),
    ],
    content: initialContent, // Set initial content here
    onUpdate: ({ editor: currentEditor }) => {
      onContentChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        // This class will be applied to the ProseMirror editor itself
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none min-h-[200px] p-3 border border-gray-300 rounded-b-lg',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      // Safely update content if initialContent prop changes externally
      // This might happen if outline is generated after editor is mounted
      editor.commands.setContent(initialContent, false); // false to not emit update
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
    return () => {
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [editor, editorRef]);


  return (
    <div className="bg-white shadow rounded-lg">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
