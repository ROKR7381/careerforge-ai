"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Project } from "@/types/resume";

interface Props {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ResumeFormProjects({ projects, onChange }: Props) {
  const add = () => {
    onChange([...projects, { name: "", description: "" }]);
  };

  const remove = (i: number) => {
    onChange(projects.filter((_, j) => j !== i));
  };

  const update = (i: number, key: keyof Project, value: string) => {
    const updated = [...projects];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Project
        </Button>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No projects added yet.
        </p>
      )}

      {projects.map((project, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input value={project.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Project name" />
            </div>
            <div className="space-y-1.5">
              <Label>Role (Optional)</Label>
              <Input value={project.role || ""} onChange={(e) => update(i, "role", e.target.value)} placeholder="Lead Developer" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Link (Optional)</Label>
              <Input value={project.link || ""} onChange={(e) => update(i, "link", e.target.value)} placeholder="https://github.com/project" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={project.description}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="Brief description of the project and technologies used..."
              className="min-h-[60px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
