"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Language } from "@/types/resume";

interface Props {
  languages: Language[];
  onChange: (langs: Language[]) => void;
}

export function ResumeFormLanguages({ languages, onChange }: Props) {
  const add = () => {
    onChange([...languages, { name: "", proficiency: "" }]);
  };

  const remove = (i: number) => {
    onChange(languages.filter((_, j) => j !== i));
  };

  const update = (i: number, key: keyof Language, value: string) => {
    const updated = [...languages];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Languages</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Language
        </Button>
      </div>

      {languages.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No languages added yet.
        </p>
      )}

      {languages.map((lang, i) => (
        <div key={i} className="flex items-end gap-3 rounded-lg border border-border p-4">
          <div className="flex-1 space-y-1.5">
            <Label>Language</Label>
            <Input value={lang.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="English" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Proficiency</Label>
            <Input value={lang.proficiency} onChange={(e) => update(i, "proficiency", e.target.value)} placeholder="Native / Fluent / Conversational" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
