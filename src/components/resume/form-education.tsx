"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Education } from "@/types/resume";

interface Props {
  education: Education[];
  onChange: (edu: Education[]) => void;
}

export function ResumeFormEducation({ education, onChange }: Props) {
  const add = () => {
    onChange([
      ...education,
      { institution: "", degree: "", location: "", start_date: "", end_date: "" },
    ]);
  };

  const remove = (i: number) => {
    onChange(education.filter((_, j) => j !== i));
  };

  const update = (i: number, key: keyof Education, value: string) => {
    const updated = [...education];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Education
        </Button>
      </div>

      {education.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No education entries yet.
        </p>
      )}

      {education.map((edu, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Institution</Label>
              <Input value={edu.institution} onChange={(e) => update(i, "institution", e.target.value)} placeholder="University name" />
            </div>
            <div className="space-y-1.5">
              <Label>Degree</Label>
              <Input value={edu.degree} onChange={(e) => update(i, "degree", e.target.value)} placeholder="B.S. in Computer Science" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={edu.location} onChange={(e) => update(i, "location", e.target.value)} placeholder="City, State" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input value={edu.start_date} onChange={(e) => update(i, "start_date", e.target.value)} placeholder="Sep 2017" />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input value={edu.end_date} onChange={(e) => update(i, "end_date", e.target.value)} placeholder="May 2021" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description (Optional)</Label>
            <Textarea
              value={edu.description || ""}
              onChange={(e) => update(i, "description", e.target.value)}
              placeholder="GPA, honors, relevant coursework..."
              className="min-h-[50px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
