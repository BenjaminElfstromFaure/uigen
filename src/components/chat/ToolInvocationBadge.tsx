"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, any>;
  state: string;
  result: any;
}

export function getToolLabel(toolName: string, args: Record<string, any>): string {
  const { command, path } = args;

  if (toolName === "str_replace_editor") {
    if (command === "create") return `Creating ${path}`;
    if (command === "str_replace") return `Editing ${path}`;
    if (command === "insert") return `Editing ${path}`;
    if (command === "view") return `Reading ${path}`;
  }

  if (toolName === "file_manager") {
    if (command === "rename") return `Renaming ${path}`;
    if (command === "delete") return `Deleting ${path}`;
  }

  return toolName;
}

export function ToolInvocationBadge({ toolName, args, state, result }: ToolInvocationBadgeProps) {
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {state === "result" && result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
