"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calculateProfileCompletion,
  getCompletionColor,
  getCompletionTextColor,
} from "@/features/profiles/lib/profile-completion";
import type { ProfileState } from "@/features/profiles/types/profile";

interface ProfileCompletionModalProps {
  data: ProfileState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileCompletionModal({
  data,
  open,
  onOpenChange,
}: ProfileCompletionModalProps) {
  const { percentage, sections, completedCount, totalCount } =
    calculateProfileCompletion(data);

  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const barColor = getCompletionColor(percentage);
  const textColor = getCompletionTextColor(percentage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList size={20} className="text-blue-600" />
            Profile Completion
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Based on DepEd PDS (CS Form No. 212)
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* ── Progress Bar ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedCount} of {totalCount} sections completed
              </span>
              <span className={`text-2xl font-bold ${textColor}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className={`text-xs font-medium ${textColor}`}>
              {percentage === 100
                ? "🎉 Profile is complete!"
                : percentage >= 80
                ? "Almost there! Fill in the remaining sections."
                : percentage >= 50
                ? "Good progress! Keep filling in your profile."
                : "Your profile needs more information."}
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* ── Section Checklist ── */}
          <div className="space-y-2">
            {sections.map((section) => {
              const isExpanded = expandedSections.includes(section.label);
              const hasMissing = section.fields.length > 0;

              return (
                <div
                  key={section.label}
                  className={`rounded-lg border transition-colors ${
                    section.completed
                      ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30"
                      : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => hasMissing && toggleSection(section.label)}
                  >
                    <div className="flex items-center gap-3">
                      {section.completed ? (
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={18} className="text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {section.label}
                      </span>
                    </div>

                    {hasMissing && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500 font-medium">
                          {section.fields.length} missing
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {hasMissing && isExpanded && (
                    <div className="px-4 pb-3">
                      <div className="border-t border-red-200 dark:border-red-900 pt-2">
                        <ul className="space-y-1">
                          {section.fields.map((field) => (
                            <li
                              key={field}
                              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}