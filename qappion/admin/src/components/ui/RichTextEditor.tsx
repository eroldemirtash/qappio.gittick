"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
};

export function RichTextEditor({ value, onChange, placeholder, className, minHeight = 160 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    if (typeof value === "string" && value !== el.innerHTML) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    onChange?.(html);
  };

  const insertEmoji = (emoji: string) => {
    exec("insertText", emoji);
  };

  const ToolbarButton = ({ label, onClick, ariaLabel }: { label: React.ReactNode; onClick: () => void; ariaLabel?: string }) => (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
    >
      {label}
    </button>
  );

  return (
    <div className={"w-full " + (className || "")}> 
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ToolbarButton ariaLabel="Bold" label={<b>B</b>} onClick={() => exec("bold")} />
        <ToolbarButton ariaLabel="Italic" label={<i>I</i>} onClick={() => exec("italic")} />
        <ToolbarButton ariaLabel="Underline" label={<span style={{ textDecoration: "underline" }}>U</span>} onClick={() => exec("underline")} />
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton ariaLabel="Bulleted list" label="• List" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton ariaLabel="Numbered list" label="1. List" onClick={() => exec("insertOrderedList")} />
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton ariaLabel="Paragraph" label="¶" onClick={() => exec("formatBlock", "p")} />
        <ToolbarButton ariaLabel="Heading" label="H3" onClick={() => exec("formatBlock", "h3")} />
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton ariaLabel="Emoji smile" label="😊" onClick={() => insertEmoji("😊")} />
        <ToolbarButton ariaLabel="Emoji fire" label="🔥" onClick={() => insertEmoji("🔥")} />
        <ToolbarButton ariaLabel="Emoji star" label="⭐️" onClick={() => insertEmoji("⭐️")} />
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton ariaLabel="Clear formatting" label="Clear" onClick={() => exec("removeFormat")} />
      </div>

      {/* Editor */}
      <div
        ref={ref}
        role="textbox"
        aria-multiline
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
        style={{ minHeight }}
        data-placeholder={placeholder || "Açıklama yazın..."}
      />

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}


