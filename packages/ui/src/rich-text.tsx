'use client';

import { EditorContent, useEditor, useEditorState, type Editor, type JSONContent } from '@tiptap/react';
import Heading from '@tiptap/extension-heading';
import StarterKit from '@tiptap/starter-kit';
import { Fragment, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './cx';

export type { JSONContent };

// Inside the editor a document's headings render two levels down (a title
// is an h3, a subheading an h4), so editable content never adds a second h1
// to the page that hosts the editor. The document keeps its own levels.
const EditorHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    return [`h${Math.min(6, Number(node.attrs.level) + 2)}`, HTMLAttributes, 0];
  },
}).configure({ levels: [1, 2] });

// Content typography for the editor, so what a person writes looks like what
// is published. Content is set in Newsreader.
const CONTENT =
  'font-serif text-article text-fg [&_h3]:text-article-title [&_h3]:font-semibold [&_h4]:text-section [&_h4]:font-semibold [&_h4]:font-sans ' +
  '[&_p+p]:mt-3 [&_h3+*]:mt-3 [&_h4+*]:mt-2 [&_*+h4]:mt-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:mt-2 [&_ol]:mt-2 [&_li+li]:mt-1 [&_strong]:font-semibold';

type ToolId = 'bold' | 'italic' | 'heading' | 'bulletList' | 'orderedList';

const TOOLS: { id: ToolId; label: string; glyph: ReactNode; run: (editor: Editor) => void }[] = [
  { id: 'bold', label: 'Bold', glyph: <span className="font-sans font-bold">B</span>, run: (e) => e.chain().focus().toggleBold().run() },
  { id: 'italic', label: 'Italic', glyph: <span className="font-serif italic">I</span>, run: (e) => e.chain().focus().toggleItalic().run() },
  {
    id: 'heading',
    label: 'Heading',
    glyph: <span className="font-sans text-label font-semibold">H</span>,
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'bulletList',
    label: 'Bulleted list',
    glyph: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4.5" cy="6" r="1" fill="currentColor" />
        <circle cx="4.5" cy="12" r="1" fill="currentColor" />
        <circle cx="4.5" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    label: 'Numbered list',
    glyph: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M10 6h10M10 12h10M10 18h10M4 5h1.5v4M4 14.5c0-.8.7-1.5 1.5-1.5S7 13.7 7 14.5c0 1.5-3 2-3 3.5h3" />
      </svg>
    ),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
];

function isActive(editor: Editor, id: ToolId): boolean {
  return id === 'heading' ? editor.isActive('heading', { level: 2 }) : editor.isActive(id);
}

const noop = () => () => {};

type RichTextEditorProps = {
  /** Accessible name of the editing area. */
  label: string;
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  className?: string;
};

// A rich-text field: a formatting toolbar (the ARIA toolbar pattern: one Tab
// stop, arrow keys move between tools) above an editing area. Mount it with a
// new `key` to replace its content.
//
// The editor only exists in the browser. On the server, and for the first
// render, it shows the same content read-only in the same frame, so there
// is no layout shift and nothing random runs during prerendering.
export function RichTextEditor(props: RichTextEditorProps) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return mounted ? <LiveEditor {...props} /> : <EditorShell {...props} />;
}

function EditorShell({ label, content, className }: RichTextEditorProps) {
  return (
    <div className={cx('flex flex-col overflow-hidden rounded-lg border border-line-input bg-surface', className)}>
      <div role="toolbar" aria-label="Formatting" className="flex items-center gap-1 border-b border-line bg-sunken px-2 py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            disabled
            aria-label={tool.label}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-secondary pointer-coarse:h-11 pointer-coarse:w-11"
          >
            {tool.glyph}
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1 overflow-auto wrap-anywhere">
        <div role="textbox" aria-multiline="true" aria-label={label} aria-readonly="true" className={cx('min-h-40 px-4 py-3', CONTENT)}>
          {renderNode(content, 0, { h1: '', h2: '' }, true)}
        </div>
      </div>
    </div>
  );
}

function LiveEditor({
  label,
  content,
  onChange,
  className,
}: RichTextEditorProps) {
  const toolbar = useRef<HTMLDivElement>(null);
  const editor = useEditor({
    extensions: [
      EditorHeading,
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: false,
        strike: false,
        underline: false,
      }),
    ],
    content,
    // Rendered on the server as an empty shell; the editor mounts in the browser.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        class: cx('min-h-40 px-4 py-3 outline-none', CONTENT),
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      Object.fromEntries(TOOLS.map((tool) => [tool.id, current ? isActive(current, tool.id) : false])) as Record<ToolId, boolean>,
  });

  function onToolbarKey(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...(toolbar.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const next =
      event.key === 'ArrowRight' ? (index + 1) % buttons.length
      : event.key === 'ArrowLeft' ? (index - 1 + buttons.length) % buttons.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
      : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons.forEach((button, i) => (button.tabIndex = i === next ? 0 : -1));
    buttons[next]?.focus();
  }

  return (
    <div
      className={cx(
        'flex flex-col overflow-hidden rounded-lg border border-line-input bg-surface',
        'has-[.ProseMirror:focus-visible]:outline-2 has-[.ProseMirror:focus-visible]:outline-offset-2 has-[.ProseMirror:focus-visible]:outline-(--ff-focus-ring)',
        className,
      )}
    >
      <div
        ref={toolbar}
        role="toolbar"
        aria-label="Formatting"
        onKeyDown={onToolbarKey}
        className="flex items-center gap-1 border-b border-line bg-sunken px-2 py-1.5"
      >
        {TOOLS.map((tool, index) => (
          <button
            key={tool.id}
            type="button"
            tabIndex={index === 0 ? 0 : -1}
            aria-label={tool.label}
            aria-pressed={active?.[tool.id] ?? false}
            disabled={!editor}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor && tool.run(editor)}
            className={cx(
              'inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-secondary pointer-coarse:h-11 pointer-coarse:w-11',
              'hover:bg-surface hover:text-fg aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-[inset_0_0_0_1px_var(--ff-border-strong)]',
            )}
          >
            {tool.glyph}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="min-w-0 flex-1 overflow-auto wrap-anywhere" />
    </div>
  );
}

// Plain text of a document, for titles and summaries.
export function plainText(node: JSONContent | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(plainText).join(node.type === 'doc' ? '\n' : '');
}

function renderMarks(text: string, marks: JSONContent['marks']): ReactNode {
  return (marks ?? []).reduce<ReactNode>((child, mark) => {
    if (mark.type === 'bold') return <strong>{child}</strong>;
    if (mark.type === 'italic') return <em>{child}</em>;
    return child;
  }, text);
}

function renderNode(node: JSONContent, key: number, sizes: { h1: string; h2: string }, asEditor = false): ReactNode {
  const children = (node.content ?? []).map((child, i) => renderNode(child, i, sizes, asEditor));
  switch (node.type) {
    case 'doc':
      return <Fragment key={key}>{children}</Fragment>;
    case 'heading':
      if (asEditor) return node.attrs?.level === 1 ? <h3 key={key}>{children}</h3> : <h4 key={key}>{children}</h4>;
      return node.attrs?.level === 1 ? (
        <h3 key={key} className={sizes.h1}>{children}</h3>
      ) : (
        <h4 key={key} className={sizes.h2}>{children}</h4>
      );
    case 'paragraph':
      return <p key={key}>{children}</p>;
    case 'bulletList':
      return <ul key={key}>{children}</ul>;
    case 'orderedList':
      return <ol key={key}>{children}</ol>;
    case 'listItem':
      return <li key={key}>{children}</li>;
    case 'hardBreak':
      return <br key={key} />;
    case 'text':
      return <Fragment key={key}>{renderMarks(node.text ?? '', node.marks)}</Fragment>;
    default:
      return null;
  }
}

// Renders editor content as React elements, never as raw HTML, so content
// cannot inject markup. `size` sets the scale: a website page or a phone.
export function RichTextView({
  content,
  size = 'page',
  className,
}: {
  content: JSONContent;
  size?: 'page' | 'compact';
  className?: string;
}) {
  const sizes =
    size === 'page'
      ? { h1: 'font-serif text-article-display font-medium text-fg', h2: 'font-sans text-section text-fg' }
      : { h1: 'font-serif text-article-title font-semibold text-fg', h2: 'font-sans text-title text-fg' };
  return (
    <div
      className={cx(
        'font-serif text-fg-secondary wrap-anywhere [&_h3+*]:mt-3 [&_h4]:mt-4 [&_h4+*]:mt-2 [&_p+p]:mt-3 [&_ul]:mt-2 [&_ol]:mt-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li+li]:mt-1 [&_strong]:font-semibold [&_strong]:text-fg',
        size === 'page' ? 'text-article' : 'text-body',
        className,
      )}
    >
      {renderNode(content, 0, sizes)}
    </div>
  );
}
