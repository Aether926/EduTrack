"use client";

import { useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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

interface ProfileImageActionsProps {
    hasImage: boolean;
    uploading: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: () => Promise<void>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function ProfileImageActions({
    hasImage,
    uploading,
    onFileSelect,
    onDelete,
    fileInputRef,
}: ProfileImageActionsProps) {
    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={onFileSelect}
                className="hidden"
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        disabled={uploading}
                        className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2
                                size={16}
                                className="text-white animate-spin"
                            />
                        ) : (
                            <Camera size={16} className="text-white" />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 cursor-pointer"
                    >
                        <Camera className="h-4 w-4" />
                        {hasImage ? "Change Photo" : "Upload Photo"}
                    </DropdownMenuItem>

                    {hasImage && (
                        <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="gap-2 cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Remove Photo
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Remove profile picture?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Your profile picture will be
                                            permanently removed.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onDelete}
                                            className="bg-rose-600 hover:bg-rose-500 text-white"
                                        >
                                            Remove
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
