"use client";

import * as React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    GripVertical,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Position, PendingChange } from "@/lib/position-store";

// ─── Initial Data ────────────────────────────────────────────────────────────

const INITIAL_POSITIONS: Position[] = [
    { id: "1", title: "Teacher I" },
    { id: "2", title: "Teacher II" },
    { id: "3", title: "Teacher III" },
    { id: "4", title: "Master Teacher I" },
    { id: "5", title: "Master Teacher II" },
    { id: "6", title: "Master Teacher III" },
    { id: "7", title: "Principal" },
    { id: "8", title: "Administrative Staff" },
];

// Simulated HR user — replace with your auth session
const HR_USER = "HR User";

// ─── Pending overlay type for UI ─────────────────────────────────────────────

type PendingMeta = {
    changeId: string;
    type: "add" | "edit" | "delete" | "reorder";
};

// ─── Sortable Row ─────────────────────────────────────────────────────────────

function SortableRow({
    pos,
    index,
    pendingMeta,
    editingId,
    editValue,
    onEdit,
    onSaveEdit,
    onCancelEdit,
    onEditValueChange,
    onDelete,
    editInputRef,
}: {
    pos: Position;
    index: number;
    pendingMeta?: PendingMeta;
    editingId: string | null;
    editValue: string;
    onEdit: (pos: Position) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditValueChange: (v: string) => void;
    onDelete: (pos: Position) => void;
    editInputRef: React.RefObject<HTMLInputElement>;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pos.id });

    const style = { transform: CSS.Transform.toString(transform), transition };
    const isEditing = editingId === pos.id;
    const isPending = !!pendingMeta;

    return (
        <TooltipProvider delayDuration={200}>
            <li
                ref={setNodeRef}
                style={style}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 group transition-colors border-b last:border-b-0",
                    isDragging
                        ? "bg-muted/60 shadow-lg z-50 opacity-90 rounded-md"
                        : isEditing
                          ? "bg-muted/40"
                          : isPending
                            ? "bg-yellow-500/5"
                            : "hover:bg-muted/20",
                )}
            >
                {/* Drag handle — disabled while pending */}
                <button
                    {...(!isPending ? { ...attributes, ...listeners } : {})}
                    className={cn(
                        "flex-shrink-0 touch-none transition-colors",
                        isPending
                            ? "text-muted-foreground/20 cursor-not-allowed"
                            : "cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground",
                    )}
                    tabIndex={-1}
                    disabled={isPending}
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                {/* Index */}
                <span className="text-xs tabular-nums text-muted-foreground w-5 text-right flex-shrink-0 select-none">
                    {index + 1}
                </span>

                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                        <Input
                            ref={editInputRef}
                            value={editValue}
                            onChange={(e) => onEditValueChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSaveEdit();
                                if (e.key === "Escape") onCancelEdit();
                            }}
                            className="h-7 text-sm flex-1"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={onSaveEdit}
                        >
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={onCancelEdit}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <span
                            className={cn(
                                "flex-1 text-sm font-medium",
                                isPending &&
                                    pendingMeta?.type === "delete" &&
                                    "line-through text-muted-foreground",
                            )}
                        >
                            {pos.title}
                        </span>

                        {/* Pending badge */}
                        {isPending && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium select-none">
                                        <Clock className="h-3.5 w-3.5" />
                                        Pending
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                    Awaiting Principal approval
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Actions — hidden while pending */}
                        {!isPending && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    onClick={() => onEdit(pos)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Remove Position?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                <span className="font-medium text-foreground">
                                                    &ldquo;{pos.title}&rdquo;
                                                </span>{" "}
                                                will be submitted for removal.
                                                It won&apos;t be deleted until
                                                the Principal approves the
                                                request.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() => onDelete(pos)}
                                            >
                                                Submit for Removal
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </>
                )}
            </li>
        </TooltipProvider>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PositionDesignationHRPage() {
    const [positions, setPositions] =
        React.useState<Position[]>(INITIAL_POSITIONS);

    // pendingMap: positionId → PendingMeta (for per-row pending display)
    const [pendingMap, setPendingMap] = React.useState<
        Record<string, PendingMeta>
    >({});

    // Full pending changes list (would be persisted to DB in real app)
    const [pendingChanges, setPendingChanges] = React.useState<PendingChange[]>(
        [],
    );

    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editValue, setEditValue] = React.useState("");
    const [newTitle, setNewTitle] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);

    const editInputRef = React.useRef<HTMLInputElement>(null);
    const addInputRef = React.useRef<HTMLInputElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    React.useEffect(() => {
        if (editingId && editInputRef.current) editInputRef.current.focus();
    }, [editingId]);

    React.useEffect(() => {
        if (isAdding && addInputRef.current) addInputRef.current.focus();
    }, [isAdding]);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const submitChange = (change: PendingChange) => {
        setPendingChanges((prev) => [...prev, change]);
        // In real app: POST /api/pending-changes
    };

    const markPending = (
        posId: string,
        changeId: string,
        type: PendingMeta["type"],
    ) => {
        setPendingMap((prev) => ({ ...prev, [posId]: { changeId, type } }));
    };

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleAdd = () => {
        if (!newTitle.trim()) return;
        const newPos: Position = {
            id: crypto.randomUUID(),
            title: newTitle.trim(),
        };
        const changeId = crypto.randomUUID();

        // Optimistically add to list as pending
        setPositions((prev) => [...prev, newPos]);
        markPending(newPos.id, changeId, "add");
        submitChange({
            id: changeId,
            type: "add",
            submittedBy: HR_USER,
            submittedAt: new Date(),
            newTitle: newTitle.trim(),
            status: "pending",
            // Store temp id so principal knows what to confirm
            targetId: newPos.id,
        });

        setNewTitle("");
        setIsAdding(false);
    };

    const handleEdit = (pos: Position) => {
        setEditingId(pos.id);
        setEditValue(pos.title);
        setIsAdding(false);
    };

    const handleSaveEdit = () => {
        if (!editValue.trim() || !editingId) return;
        const target = positions.find((p) => p.id === editingId);
        if (!target) return;

        const changeId = crypto.randomUUID();

        // Optimistically show updated title as pending
        setPositions((prev) =>
            prev.map((p) =>
                p.id === editingId ? { ...p, title: editValue.trim() } : p,
            ),
        );
        markPending(editingId, changeId, "edit");
        submitChange({
            id: changeId,
            type: "edit",
            submittedBy: HR_USER,
            submittedAt: new Date(),
            targetId: editingId,
            previousTitle: target.title,
            updatedTitle: editValue.trim(),
            status: "pending",
        });

        setEditingId(null);
        setEditValue("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const handleDelete = (pos: Position) => {
        const changeId = crypto.randomUUID();
        markPending(pos.id, changeId, "delete");
        submitChange({
            id: changeId,
            type: "delete",
            submittedBy: HR_USER,
            submittedAt: new Date(),
            targetId: pos.id,
            deletedTitle: pos.title,
            status: "pending",
        });
        // Position stays in list as pending-delete (shown with strikethrough)
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const previousOrder = positions.map((p) => p.id);
        const oldIndex = previousOrder.indexOf(active.id as string);
        const newIndex = previousOrder.indexOf(over.id as string);
        const reordered = arrayMove(positions, oldIndex, newIndex);
        const newOrder = reordered.map((p) => p.id);

        const changeId = crypto.randomUUID();
        setPositions(reordered);

        // Mark all moved positions as pending reorder
        reordered.forEach((p) => {
            if (previousOrder.indexOf(p.id) !== newOrder.indexOf(p.id)) {
                markPending(p.id, changeId, "reorder");
            }
        });

        submitChange({
            id: changeId,
            type: "reorder",
            submittedBy: HR_USER,
            submittedAt: new Date(),
            previousOrder,
            newOrder,
            status: "pending",
        });
    };

    const pendingCount = pendingChanges.filter(
        (c) => c.status === "pending",
    ).length;
    const teachingRoles = positions.filter((p) =>
        p.title.toLowerCase().includes("teacher"),
    ).length;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="p-6 md:p-10 max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Configuration
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Position / Designation
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Changes require Principal approval before taking
                            effect.
                        </p>
                    </div>

                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>
                                <span className="font-semibold">
                                    {pendingCount}
                                </span>{" "}
                                {pendingCount === 1 ? "change" : "changes"}{" "}
                                awaiting Principal approval
                            </span>
                        </div>
                    )}
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    {/* ── Left: Editable List ── */}
                    <div className="lg:col-span-3">
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">
                                        Positions
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {positions.length}
                                    </Badge>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setIsAdding(true);
                                        setEditingId(null);
                                    }}
                                    className="gap-1 h-7 text-xs"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Position
                                </Button>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={positions.map((p) => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <ul>
                                        {positions.map((pos, index) => (
                                            <SortableRow
                                                key={pos.id}
                                                pos={pos}
                                                index={index}
                                                pendingMeta={pendingMap[pos.id]}
                                                editingId={editingId}
                                                editValue={editValue}
                                                onEdit={handleEdit}
                                                onSaveEdit={handleSaveEdit}
                                                onCancelEdit={handleCancelEdit}
                                                onEditValueChange={setEditValue}
                                                onDelete={handleDelete}
                                                editInputRef={editInputRef}
                                            />
                                        ))}

                                        {isAdding && (
                                            <li className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-t">
                                                <GripVertical className="h-4 w-4 text-muted-foreground/20 flex-shrink-0" />
                                                <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">
                                                    {positions.length + 1}
                                                </span>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Input
                                                        ref={addInputRef}
                                                        placeholder="e.g. Teacher IV"
                                                        value={newTitle}
                                                        onChange={(e) =>
                                                            setNewTitle(
                                                                e.target.value,
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            )
                                                                handleAdd();
                                                            if (
                                                                e.key ===
                                                                "Escape"
                                                            ) {
                                                                setIsAdding(
                                                                    false,
                                                                );
                                                                setNewTitle("");
                                                            }
                                                        }}
                                                        className="h-7 text-sm flex-1"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        onClick={handleAdd}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            setIsAdding(false);
                                                            setNewTitle("");
                                                        }}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </li>
                                        )}

                                        {positions.length === 0 &&
                                            !isAdding && (
                                                <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                                                    No positions yet.{" "}
                                                    <button
                                                        className="underline underline-offset-2 hover:text-foreground"
                                                        onClick={() =>
                                                            setIsAdding(true)
                                                        }
                                                    >
                                                        Add one now
                                                    </button>
                                                </li>
                                            )}
                                    </ul>
                                </SortableContext>
                            </DndContext>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3 px-1">
                            Press{" "}
                            <kbd className="px-1 py-0.5 rounded border text-[10px] font-mono bg-muted">
                                Enter
                            </kbd>{" "}
                            to save or{" "}
                            <kbd className="px-1 py-0.5 rounded border text-[10px] font-mono bg-muted">
                                Esc
                            </kbd>{" "}
                            to cancel while editing.
                        </p>
                    </div>

                    {/* ── Right: Info Panel ── */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {/* Stats */}
                        <div className="rounded-xl border bg-card shadow-sm p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                                Overview
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted/40 p-4">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {positions.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total Positions
                                    </p>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-4">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {teachingRoles}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Teaching Roles
                                    </p>
                                </div>
                                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 col-span-2">
                                    <p className="text-3xl font-bold tabular-nums text-yellow-500">
                                        {pendingCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Pending Approval
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dropdown preview */}
                        <div className="rounded-xl border bg-card shadow-sm p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                Dropdown Preview
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                                Only approved positions appear here.
                            </p>
                            <div className="rounded-lg border bg-muted/20 overflow-hidden text-sm">
                                {positions
                                    .filter(
                                        (p) =>
                                            !pendingMap[p.id] ||
                                            pendingMap[p.id].type === "edit" ||
                                            pendingMap[p.id].type === "reorder",
                                    )
                                    .filter(
                                        (p) => pendingMap[p.id]?.type !== "add",
                                    )
                                    .slice(0, 6)
                                    .map((pos, i) => (
                                        <div
                                            key={pos.id}
                                            className="px-3 py-2 flex items-center gap-2 border-b last:border-b-0"
                                        >
                                            <span className="text-xs text-muted-foreground tabular-nums w-4">
                                                {i + 1}
                                            </span>
                                            {pos.title}
                                        </div>
                                    ))}
                                {positions.filter(
                                    (p) =>
                                        !pendingMap[p.id] ||
                                        pendingMap[p.id]?.type !== "add",
                                ).length === 0 && (
                                    <div className="px-3 py-2 text-xs text-muted-foreground">
                                        No approved positions yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Approval note */}
                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 dark:text-yellow-400 mb-2">
                                Approval Required
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                All changes are submitted to the{" "}
                                <span className="font-medium text-foreground">
                                    Principal
                                </span>{" "}
                                for review. Items marked{" "}
                                <span className="text-yellow-500 font-medium">
                                    Pending
                                </span>{" "}
                                are awaiting approval and won&apos;t be visible
                                to users until approved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
