"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
// @ts-ignore
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useEffect, useState } from "react";
import { ImageUploadModal } from "@/components/media/image-upload-modal";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CKEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CKEditorComponent({
  content,
  onChange,
  placeholder = "Start writing your content here...",
  className = "",
  disabled = false,
}: CKEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={`border rounded-lg bg-background shadow-sm ${className}`}>
        <div className="flex items-center justify-center p-8 min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleImageSelect = (imageUrl: string, altText?: string) => {
    if (editorInstance) {
      // Try multiple methods to insert image
      const altAttr = altText ? ` alt="${altText}"` : "";
      const imageHtml = `<img src="${imageUrl}"${altAttr} />`;

      // Method 1: Try HTML insertion
      try {
        editorInstance.model.change((writer: any) => {
          const viewFragment = editorInstance.data.processor.toView(imageHtml);
          const modelFragment = editorInstance.data.toModel(viewFragment);
          editorInstance.model.insertContent(modelFragment);
        });
      } catch (error) {
        // Method 2: Try direct command
        try {
          editorInstance.execute("imageInsert", {
            source: [{ src: imageUrl, alt: altText || "" }],
          });
        } catch (error2) {
          // Method 3: Fallback to simple HTML
          const currentContent = editorInstance.getData();
          editorInstance.setData(currentContent + imageHtml);
        }
      }

      // Focus the editor after insertion
      editorInstance.editing.view.focus();
    }
  };

  return (
    <div className={`border rounded-lg bg-white shadow-sm ${className}`}>
      <div className="border-b bg-gray-50 p-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Rich Text Editor</div>
        <ImageUploadModal
          onImageSelect={handleImageSelect}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Insert Image
            </Button>
          }
        />
      </div>
      <style jsx global>{`
        .ck.ck-editor {
          min-height: 400px;
        }
        .ck.ck-editor__editable {
          min-height: 400px;
          padding: 1.5rem;
          font-size: 16px;
          line-height: 1.6;
        }
        .ck.ck-editor__editable h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.2;
          color: #1a202c;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }
        .ck.ck-editor__editable h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          color: #2d3748;
        }
        .ck.ck-editor__editable h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #4a5568;
        }
        .ck.ck-editor__editable h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
          color: #718096;
        }
        .ck.ck-editor__editable h5 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.25rem;
          line-height: 1.4;
          color: #a0aec0;
        }
        .ck.ck-editor__editable h6 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
          line-height: 1.4;
          color: #cbd5e0;
        }
        .ck.ck-editor__editable p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .ck.ck-editor__editable ul,
        .ck.ck-editor__editable ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        .ck.ck-editor__editable li {
          margin: 0.5rem 0;
        }
        .ck.ck-editor__editable ul li {
          list-style-type: disc;
        }
        .ck.ck-editor__editable ol li {
          list-style-type: decimal;
        }
        .ck.ck-editor__editable blockquote {
          border-left: 4px solid #4299e1;
          background-color: #ebf8ff;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
        }
        .ck.ck-editor__editable table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .ck.ck-editor__editable table th,
        .ck.ck-editor__editable table td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
        }
        .ck.ck-editor__editable table th {
          background-color: #f7fafc;
          font-weight: 600;
        }
        .ck.ck-editor__editable hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 2rem 0;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor as any}
        data={content}
        onReady={(editor) => {
          setEditorInstance(editor);
          // Configure the editor when it's ready
          editor.editing.view.change((writer) => {
            writer.setStyle(
              "min-height",
              "400px",
              editor.editing.view.document.getRoot()!,
            );
          });
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          placeholder,
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "|",
              "link",
              "image",
              "mediaEmbed",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "blockQuote",
              "insertTable",
              "|",
              "undo",
              "redo",
              "|",
              "code",
              "codeBlock",
              "|",
              "alignment",
              "fontSize",
              "fontFamily",
              "|",
              "highlight",
              "horizontalLine",
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },
          language: "en",
          image: {
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "linkImage",
            ],
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
            ],
          },
          licenseKey: "",
        }}
        disabled={disabled}
      />
    </div>
  );
}
