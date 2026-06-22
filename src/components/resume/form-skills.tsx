"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { SkillGroup } from "@/types/resume";

interface Props {
  skills: SkillGroup[];
  onChange: (skills: SkillGroup[]) => void;
}

export function ResumeFormSkills({ skills, onChange }: Props) {
  const add = () => {
    onChange([...skills, { category: "", skills: [""] }]);
  };

  const remove = (i: number) => {
    onChange(skills.filter((_, j) => j !== i));
  };

  const updateCategory = (i: number, value: string) => {
    const updated = [...skills];
    updated[i] = { ...updated[i], category: value };
    onChange(updated);
  };

  const updateSkill = (groupIdx: number, skillIdx: number, value: string) => {
    const updated = [...skills];
    const list = [...updated[groupIdx].skills];
    list[skillIdx] = value;
    updated[groupIdx] = { ...updated[groupIdx], skills: list };
    onChange(updated);
  };

  const addSkill = (i: number) => {
    const updated = [...skills];
    updated[i] = { ...updated[i], skills: [...updated[i].skills, ""] };
    onChange(updated);
  };

  const removeSkill = (groupIdx: number, skillIdx: number) => {
    const updated = [...skills];
    const list = updated[groupIdx].skills.filter((_, j) => j !== skillIdx);
    updated[groupIdx] = { ...updated[groupIdx], skills: list };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
        </Button>
      </div>

      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No skills added yet.
        </p>
      )}

      {skills.map((group, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-2">
              <Input
                value={group.category}
                onChange={(e) => updateCategory(i, e.target.value)}
                placeholder="Category (e.g., Programming Languages)"
                className="text-sm font-medium"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-2">
            {group.skills.map((skill, j) => (
              <div key={j} className="flex gap-2">
                <Input
                  value={skill}
                  onChange={(e) => updateSkill(i, j, e.target.value)}
                  placeholder="Skill name"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => removeSkill(i, j)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => addSkill(i)}>
              <Plus className="h-3 w-3 mr-1" /> Add Skill
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
