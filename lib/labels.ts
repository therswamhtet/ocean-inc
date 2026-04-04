/**
 * Centralized UI labels — single source of truth for all visible text strings.
 * Only change visible UI labels here; never variable names, route paths, or data attributes.
 */
export const LABELS = {
  task: {
    singular: 'Task',
    plural: 'Tasks',
    postingDate: 'Posting Date',
    dueDate: 'Due Date',
    deadline: 'Deadline',
    status: 'Status',
    caption: 'Caption',
    designFile: 'Design File',
    briefing: 'Briefing',
    assignee: 'Assignee',
    create: 'Create Task',
    creating: 'Creating...',
    saved: 'Task saved.',
    deleted: 'Delete task',
    deleteConfirm: 'Delete this task? This also removes the current design file.',
  },
  project: {
    singular: 'Project',
    plural: 'Projects',
    active: 'Active',
    create: 'Create Project',
    creating: 'Create Project',
  },
  client: {
    singular: 'Client',
    plural: 'Clients',
    create: 'Add Client',
    createTitle: 'Create client',
    createDescription:
      'Add a client by name only. A unique slug is generated automatically for portal access.',
    shareLink: 'Share Link',
  },
  teamMember: {
    singular: 'Team Member',
    plural: 'Team Members',
  },
  dashboard: {
    totalProjects: 'Total Active Projects',
    tasksInProgress: 'Tasks In Progress',
    overdueTasks: 'Overdue Tasks',
    completedThisMonth: 'Completed This Month',
  },
  emptyStates: {
    noClients: 'No clients yet',
    noProjects: 'No projects yet. Create the first one.',
    noTasks: 'No tasks yet. Create the first task to populate this project.',
    noTasksAssigned: 'No tasks assigned yet.',
    noDesignFile: 'No design file uploaded yet.',
    noCaption: 'No caption has been added yet.',
    noPortalTasks: 'No tasks with posting dates are available yet.',
  },
  copy: {
    label: 'Copy',
    copied: 'Copied',
    confirmation: 'Copied to clipboard.',
  },
  notify: {
    title: 'Notify Assigner',
    description:
      'This will notify the admin that your work is complete and mark the task as done.',
    button: 'Notify Assigner',
    success: 'Assigner notified and task marked as done.',
    confirmButton: 'Confirm and mark done',
    assigning: 'Assigning...',
  },
} as const
