import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileState } from "@/features/profiles/types/profile";

function Field(props: {
    label: string;
    value: string;
    field: keyof ProfileState;
    type?: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
    rows?: number;
    required?: boolean;
}) {
    const {
        label,
        value,
        field,
        type = "text",
        icon: Icon,
        isEditing,
        onInputChange,
        rows,
        required,
    } = props;
    const isTextarea = type === "textarea";

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                {Icon ? <Icon size={14} className="text-blue-600" /> : null}
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            {isEditing ? (
                isTextarea ? (
                    <Textarea
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        className="resize-none"
                        rows={rows || 3}
                    />
                ) : (
                    <Input
                        type={type}
                        value={value}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        required={Boolean(required)}
                    />
                )
            ) : (
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-md text-sm font-medium">
                    {value || "—"}
                </div>
            )}
        </div>
    );
}

export default function ContactInfoCard(props: {
    data: ProfileState;
    isEditing: boolean;
    onInputChange: (field: keyof ProfileState, value: string) => void;
}) {
    const { data, isEditing, onInputChange } = props;

    return (
        <Card className="border-0 shadow-lg w-full xl:max-w-[500px]">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Phone className="text-blue-600" size={20} />
                    <CardTitle>Contact Information</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 w-full">
                <div className="space-y-4">
                    <Field
                        label="Contact Number"
                        value={data.contactNumber}
                        field="contactNumber"
                        type="tel"
                        icon={Phone}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                        required
                    />

                    <Field
                        label="Email Address"
                        value={data.email}
                        field="email"
                        type="email"
                        icon={Mail}
                        isEditing={false}
                        onInputChange={() => {}}
                    />

                    <Field
                        label="Address"
                        value={data.address}
                        field="address"
                        type="textarea"
                        icon={MapPin}
                        rows={3}
                        isEditing={isEditing}
                        onInputChange={onInputChange}
                    />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800" />
            </CardContent>
        </Card>
    );
}
