---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/admin/tasks/all-tasks.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - Task row displays compactly on single line without duplicate month
    - Expanded panel does not repeat month information from row
    - Icons in detail panel align consistently with text
  artifacts:
    - path: app/admin/tasks/all-tasks.tsx
      provides: Compact task dropdown layout
---

<objective>
Fix task dropdown UI: make single-line compact layout, remove duplicate month display, and improve icon alignment in detail panel.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Compact task row + remove duplicate month + align icons</name>
  <files>app/admin/tasks/all-tasks.tsx</files>
  <action>
    In TaskListView task row (lines 182-233):
    - Keep the row compact with single-line layout
    - The month (Content Plan) is displayed inline at line 211 - this is the single source of truth for month display

    In TaskDetailPanel (lines 122-134):
    - REMOVE the entire "Content Plan (Month)" div block (lines 122-131) since month is already shown in the task row above
    - The grid should now be 2 columns: Assigned To (left) and Posting Date (right)

    In TaskDetailPanel icon alignment (lines 98, 111):
    - Change mt-0.5 to mt-0 for all three icons (User, Clock, LinkIcon) so icons align flush with the top of their text containers
    - This ensures consistent vertical alignment when month field is removed
  </action>
  <verify>
    <automated>grep -c "Content Plan" app/admin/tasks/all-tasks.tsx | xargs -I{} test "{}" -eq 1</automated>
  </verify>
  <done>Task row is single-line compact, expanded panel shows only Assigned To and Posting Date (no duplicate month), icons align consistently</done>
</task>

</tasks>

<verification>
Code compiles without errors: grep finds exactly 1 instance of "Content Plan" (in the detail panel header label that was kept)
</verification>

<success_criteria>
- Task row displays month inline in compact single-line format
- Expanded TaskDetailPanel does not show duplicate month field
- Icons (User, Clock) have consistent vertical alignment (mt-0 instead of mt-0.5)
</success_criteria>

<output>
After completion, create `.planning/quick/260405-klm-fix-task-dropdown-single-line-compact-la/PLAN-SUMMARY.md`
</output>
