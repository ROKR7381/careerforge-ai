"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Certification } from "@/types/resume";

interface Props {
  certifications: Certification[];
  onChange: (certs: Certification[]) => void;
}

export function ResumeFormCertifications({ certifications, onChange }: Props) {
  const add = () => {
    onChange([...certifications, { name: "", issuer: "", date: "" }]);
  };

  const remove = (i: number) => {
    onChange(certifications.filter((_, j) => j !== i));
  };

  const update = (i: number, key: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[i] = { ...updated[i], [key]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Certification
        </Button>
      </div>

      {certifications.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No certifications added yet.
        </p>
      )}

      {certifications.map((cert, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Certification Name</Label>
              <Input value={cert.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="AWS Certified Solutions Architect" />
            </div>
            <div className="space-y-1.5">
              <Label>Issuer</Label>
              <Input value={cert.issuer} onChange={(e) => update(i, "issuer", e.target.value)} placeholder="Amazon Web Services" />
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input value={cert.date} onChange={(e) => update(i, "date", e.target.value)} placeholder="Mar 2024" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
