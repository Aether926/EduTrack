"use client";

import { useState } from "react";
import {
    Plus,
    Pencil,
    ToggleLeft,
    ToggleRight,
    Loader2,
    X,
    Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
    createDocumentType,
    updateDocumentType,
    toggleDocumentTypeRequired,
    type DocumentTypeRow,
} from "@/features/documents/actions/add-document-type";

type FormState = {
    name: string;
    code: string;
    description: string;
    required: boolean;
    max_mb: string;
};

const EMPTY_FORM: FormState = {
    name: "",
    code: "",
    description: "",
    required: true,
    max_mb: "",
};

export function DocumentTypeManager({
    types,
    onRefresh,
}: {
    types: DocumentTypeRow[];
    onRefresh: () => void;
}) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editing, setEditing] = useState<DocumentTypeRow | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const set = (key: keyof FormState) => (val: string | boolean) =>
        setForm((f) => ({ ...f, [key]: val }));

    const openAdd = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setSheetOpen(true);
    };

    const openEdit = (type: DocumentTypeRow) => {
        setEditing(type);
        setForm({
            name: type.name,
            code: type.code,
            description: type.description ?? "",
            required: type.required,
            max_mb: type.max_mb ? String(type.max_mb) : "",
        });
        setSheetOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("Name is required.");
        if (!editing && !form.code.trim())
            return toast.error("Code is required.");

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description,
                required: form.required,
                max_mb: form.max_mb ? Number(form.max_mb) : undefined,
            };

            const result = editing
                ? await updateDocumentType(editing.id, payload)
                : await createDocumentType({ ...payload, code: form.code });

            if (!result.ok) return toast.error(result.error);

            toast.success(
                editing ? "Document type updated." : "Document type created.",
            );
            setSheetOpen(false);
            onRefresh();
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (type: DocumentTypeRow) => {
        setTogglingId(type.id);
        try {
            const result = await toggleDocumentTypeRequired(
                type.id,
                !type.required,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success(
                `${type.name} marked as ${!type.required ? "required" : "optional"}.`,
            );
            onRefresh();
        } finally {
            setTogglingId(null);
        }
    };

    // Auto-generate code from name
    const handleNameChange = (val: string) => {
        set("name")(val);
        if (!editing) {
            set("code")(
                val
                    .toUpperCase()
                    .trim()
                    .replace(/\s+/g, "_")
                    .replace(/[^A-Z0-9_]/g, ""),
            );
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Document Types ({types.length})
                </h3>
                <Button size="sm" onClick={openAdd} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Add Type
                </Button>
            </div>

            <div className="space-y-2">
                {types.map((type) => (
                    <div
                        key={type.id}
                        className="rounded-lg border border-border/60 bg-card px-4 py-3 flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">
                                    {type.name}
                                </span>
                                {type.required ? (
                                    <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px]">
                                        Required
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] text-muted-foreground"
                                    >
                                        Optional
                                    </Badge>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                {type.code}
                            </p>
                            {type.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {type.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleToggle(type)}
                                disabled={togglingId === type.id}
                                title={
                                    type.required
                                        ? "Mark as optional"
                                        : "Mark as required"
                                }
                            >
                                {togglingId === type.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : type.required ? (
                                    <ToggleRight className="h-4 w-4 text-rose-400" />
                                ) : (
                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEdit(type)}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Add/Edit Sheet ── */}
            <Sheet
                open={sheetOpen}
                onOpenChange={(o) => !saving && setSheetOpen(o)}
            >
                <SheetContent
                    side="right"
                    className="w-[440px] flex flex-col gap-0 p-0"
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60">
                        <SheetTitle>
                            {editing
                                ? "Edit Document Type"
                                : "Add Document Type"}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Name <span className="text-rose-400">*</span>
                            </label>
                            <Input
                                value={form.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder="e.g. Birth Certificate"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Code <span className="text-rose-400">*</span>
                                {editing && (
                                    <span className="text-muted-foreground font-normal ml-1">
                                        (cannot be changed)
                                    </span>
                                )}
                            </label>
                            <Input
                                value={form.code}
                                onChange={(e) =>
                                    set("code")(
                                        e.target.value
                                            .toUpperCase()
                                            .replace(/\s+/g, "_")
                                            .replace(/[^A-Z0-9_]/g, ""),
                                    )
                                }
                                placeholder="e.g. BIRTH_CERT"
                                disabled={!!editing}
                                className={editing ? "opacity-50" : ""}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Unique identifier. Auto-generated from name.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Description
                            </label>
                            <Textarea
                                value={form.description}
                                onChange={(e) =>
                                    set("description")(e.target.value)
                                }
                                placeholder="Brief description of what this document is..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Max File Size (MB)
                            </label>
                            <Input
                                type="number"
                                value={form.max_mb}
                                onChange={(e) => set("max_mb")(e.target.value)}
                                placeholder="e.g. 5"
                                min="1"
                                max="50"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">Required</p>
                                <p className="text-xs text-muted-foreground">
                                    Teachers must submit this document
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => set("required")(!form.required)}
                                className="shrink-0"
                            >
                                {form.required ? (
                                    <ToggleRight className="h-6 w-6 text-rose-400" />
                                ) : (
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                                )}
                            </button>
                        </div>
                    </div>

                    <SheetFooter className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                            disabled={saving}
                            className="flex-1"
                        >
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {saving
                                ? "Saving..."
                                : editing
                                  ? "Save Changes"
                                  : "Create"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
