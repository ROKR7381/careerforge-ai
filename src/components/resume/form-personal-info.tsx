"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Trash2 } from "lucide-react";
import { PersonalInfo } from "@/types/resume";

interface Props {
  info: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function ResumeFormPersonalInfo({ info, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const fields: Array<{ key: keyof PersonalInfo; label: string; placeholder?: string }> = [
    { key: "full_name", label: "Full Name", placeholder: "John Doe" },
    { key: "professional_title", label: "Professional Title", placeholder: "Senior Software Engineer" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567" },
    { key: "location", label: "Location", placeholder: "San Francisco, CA" },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/johndoe" },
    { key: "github", label: "GitHub URL", placeholder: "https://github.com/johndoe" },
    { key: "website", label: "Website", placeholder: "https://johndoe.com" },
    { key: "power_statement", label: "Power Statement / Tagline", placeholder: "Results-driven engineer with 8+ years..." },
    { key: "nationality", label: "Nationality", placeholder: "American" },
    { key: "hobbies", label: "Hobbies", placeholder: "Photography, hiking, reading" },
  ];

  const update = (key: keyof PersonalInfo, value: string) => {
    onChange({ ...info, [key]: value });
  };

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange({ ...info, photo_base64: base64 });
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    onChange({ ...info, photo_base64: undefined });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>

      {/* Photo Upload */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
        <div className="relative shrink-0">
          {info.photo_base64 ? (
            <div className="relative group">
              <img
                src={info.photo_base64}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-dashed border-border">
              <Camera className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Profile Photo</p>
          <p className="text-xs text-muted-foreground mb-2">
            JPEG or PNG, square image recommended
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              value={info[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
