import React from "react";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProfileState } from "@/features/profiles/types/profile";

function Field(props: {
    label: string;
    value: string;
    field: keyof ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    placeholder?: string;
}) {
    const { label, value, field, isEditing, onInputChange, placeholder } =
        props;

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <Shield size={14} className="text-blue-600" />
                {label}
            </label>

            {isEditing ? (
                <Input
                    value={value}
                    onChange={(e) => onInputChange(field, e.target.value)}
                    placeholder={placeholder || "(optional)"}
                />
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
}

export default function GovernmentIDsCard(props: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const { data, isEditing, onInputChange } = props;

    return (
        <Card className="flex-col border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    <CardTitle>Government IDs & Numbers</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* ── Existing IDs ── */}
                <div className="space-y-4">
                    {/* Row 1 */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                PAG-IBIG No.
                            </label>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                PhilHealth No.
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {isEditing ? (
                                <Input
                                    value={data.pagibigNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange(
                                            "pagibigNo",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.pagibigNo || "—"}
                                </div>
                            )}
                            {isEditing ? (
                                <Input
                                    value={data.philHealthNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange(
                                            "philHealthNo",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.philHealthNo || "—"}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                GSIS No.
                            </label>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                TIN No.
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {isEditing ? (
                                <Input
                                    value={data.gsisNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange("gsisNo", e.target.value)
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.gsisNo || "—"}
                                </div>
                            )}
                            {isEditing ? (
                                <Input
                                    value={data.tinNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange("tinNo", e.target.value)
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.tinNo || "—"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Additional PDS IDs ── */}
                <div className="space-y-4">
                    {/* Row 3 */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                SSS No.
                            </label>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                UMID No.
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {isEditing ? (
                                <Input
                                    value={data.sssNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange("sssNo", e.target.value)
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.sssNo || "—"}
                                </div>
                            )}
                            {isEditing ? (
                                <Input
                                    value={data.umidNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange("umidNo", e.target.value)
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.umidNo || "—"}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Row 4 */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                PhilSys No. (PSN)
                            </label>
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield
                                    size={13}
                                    className="text-blue-600 shrink-0"
                                />
                                Agency Employee No.
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {isEditing ? (
                                <Input
                                    value={data.philSysNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange(
                                            "philSysNo",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.philSysNo || "—"}
                                </div>
                            )}
                            {isEditing ? (
                                <Input
                                    value={data.agencyEmployeeNo ?? ""}
                                    onChange={(e) =>
                                        onInputChange(
                                            "agencyEmployeeNo",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="(optional)"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                                    {data.agencyEmployeeNo || "—"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
