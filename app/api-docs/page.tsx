export const metadata = {
  title: 'API Documentation',
  description: 'Public API documentation for third-party integrations',
}

export default function ApiDocsPage() {
  const baseUrl = 'https://your-app.com/api/v1'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Programmatic access to your application. Build integrations, automations, and custom tools.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Authentication</h2>
        <p className="text-muted-foreground">
          All API requests require an API key passed in the <code>Authorization</code> header as a Bearer token.
        </p>
        <div className="rounded-lg bg-muted p-4">
          <code className="text-sm font-mono text-foreground">
            Authorization: Bearer YOUR_API_KEY
          </code>
        </div>
        <p className="text-sm text-muted-foreground">
          Create and manage API keys from the <a href="/admin/api-keys" className="text-primary underline">Admin → API Keys</a> page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Base URL</h2>
        <div className="rounded-lg bg-muted p-4">
          <code className="text-sm font-mono text-foreground">{baseUrl}</code>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Rate Limiting</h2>
        <p className="text-muted-foreground">
          Requests are limited to <strong>100 requests per minute</strong> per API key.
          Rate limit headers are included in all responses:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li><code>X-RateLimit-Limit</code> - Maximum requests allowed</li>
          <li><code>X-RateLimit-Remaining</code> - Requests remaining in current window</li>
          <li><code>X-RateLimit-Reset</code> - Unix timestamp when the limit resets</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Response Format</h2>
        <p className="text-muted-foreground">
          All responses are JSON with a consistent envelope:
        </p>
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Success</p>
          <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}`}
          </pre>
          <p className="text-xs font-medium text-muted-foreground uppercase pt-2">Error</p>
          <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}`}
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Endpoints</h2>

        <EndpointSection title="Clients" permission="read:clients / write:clients">
          <Endpoint method="GET" path="/clients" desc="List all clients" />
          <Endpoint method="POST" path="/clients" desc="Create a new client" />
          <Endpoint method="GET" path="/clients/:id" desc="Get a client by ID" />
          <Endpoint method="PATCH" path="/clients/:id" desc="Update a client" />
          <Endpoint method="DELETE" path="/clients/:id" desc="Delete a client" />
        </EndpointSection>

        <EndpointSection title="Projects" permission="read:projects / write:projects">
          <Endpoint method="GET" path="/projects" desc="List projects (optionally filter by ?client_id=)" />
          <Endpoint method="POST" path="/projects" desc="Create a new project" />
          <Endpoint method="GET" path="/projects/:id" desc="Get a project by ID" />
          <Endpoint method="PATCH" path="/projects/:id" desc="Update a project" />
          <Endpoint method="DELETE" path="/projects/:id" desc="Delete a project" />
        </EndpointSection>

        <EndpointSection title="Tasks" permission="read:tasks / write:tasks">
          <Endpoint method="GET" path="/tasks" desc="List tasks (optionally filter by ?project_id= or ?status=)" />
          <Endpoint method="POST" path="/tasks" desc="Create a new task" />
          <Endpoint method="GET" path="/tasks/:id" desc="Get a task by ID" />
          <Endpoint method="PATCH" path="/tasks/:id" desc="Update a task" />
          <Endpoint method="DELETE" path="/tasks/:id" desc="Delete a task" />
        </EndpointSection>

        <EndpointSection title="Comments" permission="read:comments / write:comments">
          <Endpoint method="GET" path="/tasks/:id/comments" desc="List comments on a task" />
          <Endpoint method="POST" path="/tasks/:id/comments" desc="Add a comment to a task" />
        </EndpointSection>

        <EndpointSection title="Team Members" permission="read:team_members">
          <Endpoint method="GET" path="/team-members" desc="List all team members" />
          <Endpoint method="GET" path="/team-members/:id" desc="Get a team member by ID" />
        </EndpointSection>

        <EndpointSection title="Portal" permission="read:portal">
          <Endpoint method="GET" path="/portal/:slug" desc="Get public portal data for a client by slug" />
        </EndpointSection>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Permissions</h2>
        <p className="text-muted-foreground">
          API keys can be scoped with the following permissions:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'read:clients', 'write:clients',
            'read:projects', 'write:projects',
            'read:tasks', 'write:tasks',
            'read:team_members',
            'read:comments', 'write:comments',
            'read:portal',
            'admin (full access)',
          ].map((p) => (
            <code key={p} className="rounded bg-muted px-2 py-1 text-sm font-mono">{p}</code>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Example</h2>
        <div className="rounded-lg bg-muted p-4">
          <pre className="text-sm font-mono text-foreground overflow-x-auto">
{`curl -X GET \\
  https://your-app.com/api/v1/tasks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
          </pre>
        </div>
      </section>
    </div>
  )
}

function EndpointSection({ title, permission, children }: { title: string; permission: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <code className="text-xs text-muted-foreground">{permission}</code>
      </div>
      <div className="divide-y divide-border">
        {children}
      </div>
    </div>
  )
}

function Endpoint({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColors: Record<string, string> = {
    GET: 'text-blue-600 bg-blue-50',
    POST: 'text-green-600 bg-green-50',
    PATCH: 'text-amber-600 bg-amber-50',
    DELETE: 'text-red-600 bg-red-50',
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span className={cn('rounded px-2 py-0.5 text-xs font-bold', methodColors[method] ?? 'text-gray-600 bg-gray-50')}>
        {method}
      </span>
      <code className="text-sm font-mono text-foreground">{path}</code>
      <span className="text-sm text-muted-foreground ml-auto">{desc}</span>
    </div>
  )
}

import { cn } from '@/lib/utils'
