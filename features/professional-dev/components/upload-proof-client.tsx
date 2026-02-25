"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { useUploadProof } from "@/features/professional-dev/hooks/use-upload-proof";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Loader2 } from "lucide-react";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < sizes.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function UploadProofClient({ attendanceId }: { attendanceId: string }) {
  const { file, setFile, loading, submit } = useUploadProof(attendanceId);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // keep these as-is for now (if you want dynamic from DB, send hook output later)
  const title = "Proof";
  const description = "Submit a clear certificate or proof file.";
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  const maxMb = 5;

  const pickFile = () => inputRef.current?.click();

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const onSubmit = async () => {
    try {
      await submit();
      setFile(null);
    } catch {
      // hook should handle toast/error
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-lg font-semibold">Upload — {title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>

        {file ? (
          <Badge variant="secondary">File selected</Badge>
        ) : (
          <Badge variant="outline">No file</Badge>
        )}
      </div>

      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        <div>
          Allowed types:{" "}
          <span className="text-foreground/90">{allowed.join(", ")}</span>
        </div>
        <div>
          Max size: <span className="text-foreground/90">{maxMb}MB</span>
        </div>
      </div>

      <Separator className="my-4" />

      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={allowed.join(",")}
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {/* dropzone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") pickFile();
        }}
        onClick={pickFile}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={[
          "rounded-lg border border-dashed p-10 text-center",
          "cursor-pointer select-none transition-colors",
          "bg-muted/10 hover:bg-muted/20",
          dragActive ? "border-primary/60 bg-muted/30" : "border-border/70",
        ].join(" ")}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted/30">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="text-sm font-medium">
          {file ? "File selected" : "Click to select file"}
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          {file ? (
            <>
              <span className="font-mono">{file.name}</span> • {formatBytes(file.size)}
            </>
          ) : (
            "or drag and drop here"
          )}
        </div>
      </div>

      {/* selected file row */}
      {file ? (
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{file.name}</div>
            <div className="text-xs text-muted-foreground">
              {file.type || "file"} • {formatBytes(file.size)}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setFile(null)}
            disabled={loading}
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {/* footer buttons (same layout as your screenshot) */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setFile(null)}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !file}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Uploading..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}