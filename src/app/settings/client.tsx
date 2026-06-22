"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Eye, EyeOff, Key, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Props {
  user: { id: string; email: string; name: string | null };
}

export function SettingsClient({ user }: Props) {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    groq: "",
    tavily: "",
  });
  const [showKeys, setShowKeys] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveKeys() {
    setSaving(true);
    try {
      const res = await fetch("/api/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiKeys),
      });
      if (res.ok) {
        toast.success("API keys saved");
      } else {
        toast.error("Failed to save keys");
      }
    } catch {
      toast.error("Failed to save keys");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and API keys.</p>
      </motion.div>

      <div className="mt-8 space-y-8">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-primary" /> API Keys
              </CardTitle>
              <CardDescription>
                Connect your own AI API keys for resume optimization and interview features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { key: "openai", label: "OpenAI API Key", placeholder: "sk-..." },
                  { key: "groq", label: "Groq API Key", placeholder: "gsk_..." },
                  { key: "tavily", label: "Tavily API Key", placeholder: "tvly-..." },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={field.key}
                        type={showKeys ? "text" : "password"}
                        value={apiKeys[field.key as keyof typeof apiKeys]}
                        onChange={(e) =>
                          setApiKeys({ ...apiKeys, [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeys(!showKeys)}
                >
                  {showKeys ? (
                    <EyeOff className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {showKeys ? "Hide" : "Show"} Keys
                </Button>
                <Button onClick={saveKeys} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
