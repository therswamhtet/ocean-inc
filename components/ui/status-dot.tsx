type Status = "todo" | "in_progress" | "done" | "overdue";

const statusColors: Record<Status, string> = {
  todo: "bg-status-todo",
  in_progress: "bg-status-in-progress",
  done: "bg-status-done",
  overdue: "bg-status-overdue",
};

const statusLabels: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  overdue: "Overdue",
};

export function StatusDot({
  status,
  showLabel = false,
}: {
  status: Status;
  showLabel?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${statusColors[status]} animate-pulse-status`}
        aria-label={statusLabels[status]}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {statusLabels[status]}
        </span>
      )}
    </span>
  );
}
