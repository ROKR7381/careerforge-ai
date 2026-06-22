"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { WorkExperience } from "@/types/resume";

interface Props {
  experience: WorkExperience[];
  onChange: (exp: WorkExperience[]) => void;
}

export function ResumeFormExperience({ experience, onChange }: Props) {
  const add = () => {
    onChange([
      ...experience,
      {
        company: "",
        position: "",
        location: "",
        start_date: "",
        end_date: "",
        description: [""],
      },
    ]);
  };

  const remove = (i: number) => {
    onChange(experience.filter((_, j) => j !== i));
  };

  const update = (i: number, key: keyof WorkExperience, value: any) => {
    const updated = [...experience];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  const addBullet = (i: number) => {
    const updated = [...experience];
    updated[i] = { ...updated[i], description: [...updated[i].description, ""] };
    onChange(updated);
  };

  const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    const updated = [...experience];
    const bullets = [...updated[expIdx].description];
    bullets[bulletIdx] = value;
    updated[expIdx] = { ...updated[expIdx], description: bullets };
    onChange(updated);
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    const updated = [...experience];
    const bullets = updated[expIdx].description.filter((_, j) => j !== bulletIdx);
    updated[expIdx] = { ...updated[expIdx], description: bullets };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Experience
        </Button>
      </div>

      {experience.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No experience entries yet. Click "Add Experience" to start.
        </p>
      )}

      {experience.map((exp, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Experience #{i + 1}
            </span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={exp.company}
                onChange={(e) => update(i, "company", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Position</Label>
              <Input
                value={exp.position}
                onChange={(e) => update(i, "position", e.target.value)}
                placeholder="Job title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => update(i, "location", e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input
                  value={exp.start_date}
                  onChange={(e) => update(i, "start_date", e.target.value)}
                  placeholder="Jan 2021"
                />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input
                  value={exp.end_date || ""}
                  onChange={(e) => update(i, "end_date", e.target.value)}
                  placeholder="Present"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Bullet Points</Label>
              <Button variant="ghost" size="sm" onClick={() => addBullet(i)}>
                <Plus className="h-3 w-3 mr-1" /> Add Bullet
              </Button>
            </div>
            {exp.description.map((bullet, j) => (
              <div key={j} className="flex gap-2">
                <Textarea
                  value={bullet}
                  onChange={(e) => updateBullet(i, j, e.target.value)}
                  placeholder="Accomplished [X] as measured by [Y] by doing [Z]..."
                  className="min-h-[50px] text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBullet(i, j)}
                  className="shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
