"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  Globe,
  Palette,
  Scale,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";

interface Company {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
  document_rules: {
    style?: string;
    tone?: string;
    customInstructions?: string;
  } | null;
  status: string;
  // Contact
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  website: string | null;
  // Branding
  logo_url: string | null;
  primary_color: string | null;
  tagline: string | null;
  // Legal
  bar_number: string | null;
  practice_areas: string[] | null;
}

const industries = [
  { value: "immigration", label: "Immigration Law Firm" },
  { value: "legal", label: "General Law Firm" },
  { value: "corporate", label: "Corporate Legal Department" },
  { value: "fintech", label: "Fintech / Financial Services" },
  { value: "tech", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "real_estate", label: "Real Estate" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const documentStyles = [
  { value: "formal", label: "Formal — Highly technical and traditional" },
  { value: "semiformal", label: "Semi-formal — Professional but accessible" },
  { value: "modern", label: "Modern — Clear and direct" },
];

const PRACTICE_AREA_OPTIONS = [
  "Family-Based Immigration",
  "Employment-Based Immigration",
  "Asylum & Refugees",
  "Removal Defense",
  "Naturalization & Citizenship",
  "DACA / TPS",
  "Business Immigration",
  "Investor Visas (EB-5)",
  "Consular Processing",
  "Appeals & Federal Court",
];

const PRESET_COLORS = [
  { label: "Navy", value: "#0f2044" },
  { label: "Slate", value: "#1e3a5f" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Teal", value: "#0f766e" },
  { label: "Charcoal", value: "#1f2937" },
  { label: "Burgundy", value: "#7f1d1d" },
];

export default function EmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewCompany, setIsNewCompany] = useState(false);

  const [form, setForm] = useState({
    // Basic
    name: "",
    industry: "immigration",
    description: "",
    // Contact
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    website: "",
    // Branding
    logo_url: "",
    primary_color: "#0f2044",
    tagline: "",
    // Legal
    bar_number: "",
    practice_areas: [] as string[],
    // AI
    style: "formal",
    tone: "",
    customInstructions: "",
  });

  useEffect(() => {
    fetch("/api/company/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          const c = data.data as Company;
          setForm({
            name: c.name || "",
            industry: c.industry || "immigration",
            description: c.description || "",
            address_line1: c.address_line1 || "",
            address_line2: c.address_line2 || "",
            city: c.city || "",
            state: c.state || "",
            zip: c.zip || "",
            phone: c.phone || "",
            website: c.website || "",
            logo_url: c.logo_url || "",
            primary_color: c.primary_color || "#0f2044",
            tagline: c.tagline || "",
            bar_number: c.bar_number || "",
            practice_areas: c.practice_areas || [],
            style: c.document_rules?.style || "formal",
            tone: c.document_rules?.tone || "",
            customInstructions: c.document_rules?.customInstructions || "",
          });
          setIsNewCompany(false);
        } else {
          setIsNewCompany(true);
        }
      })
      .catch(() => setIsNewCompany(true))
      .finally(() => setLoading(false));
  }, []);

  const togglePracticeArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      practice_areas: prev.practice_areas.includes(area)
        ? prev.practice_areas.filter((a) => a !== area)
        : [...prev.practice_areas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const method = isNewCompany ? "POST" : "PUT";
      const body = {
        name: form.name,
        industry: form.industry,
        description: form.description,
        address_line1: form.address_line1 || null,
        address_line2: form.address_line2 || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        phone: form.phone || null,
        website: form.website || null,
        logo_url: form.logo_url || null,
        primary_color: form.primary_color || "#0f2044",
        tagline: form.tagline || null,
        bar_number: form.bar_number || null,
        practice_areas: form.practice_areas.length > 0 ? form.practice_areas : null,
        document_rules: {
          style: form.style,
          tone: form.tone,
          customInstructions: form.customInstructions,
        },
      };

      const res = await fetch("/api/company/setup", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to save");
        return;
      }

      setSuccess(isNewCompany ? "Firm profile created" : "Changes saved");
      setIsNewCompany(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/dashboard/configuracion" },
          { label: isNewCompany ? "Set Up Firm" : "Firm Profile" },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/configuracion"
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNewCompany ? "Set Up Your Firm" : "Firm Profile"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isNewCompany
              ? "Configure your firm's details to personalize documents and branding"
              : "Manage your firm's profile, branding, and AI preferences"}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firm Information
            </CardTitle>
            <CardDescription>Core details about your firm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Firm Name *</Label>
                <Input id="name" placeholder="e.g. Aaron G. Christensen, Attorney at Law PLLC" {...field("name")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Practice Type</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline / Slogan (optional)</Label>
              <Input id="tagline" placeholder="e.g. Trusted Immigration Counsel · Houston, Texas" {...field("tagline")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">About the Firm (optional)</Label>
              <Textarea id="description" placeholder="Brief description of your firm, areas of focus, or client base..." rows={3} {...field("description")} />
            </div>
          </CardContent>
        </Card>

        {/* ── Contact Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Address, phone, and website — shown in document letterheads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input id="address_line1" placeholder="1811 North Freeway, Suite 200" {...field("address_line1")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2">Address Line 2 (optional)</Label>
              <Input id="address_line2" placeholder="Suite, Floor, etc." {...field("address_line2")} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Houston" {...field("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="TX" maxLength={2} {...field("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="77060" {...field("zip")} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-1 inline h-3.5 w-3.5" />
                  Phone
                </Label>
                <Input id="phone" placeholder="346-423-2375" type="tel" {...field("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">
                  <Globe className="mr-1 inline h-3.5 w-3.5" />
                  Website
                </Label>
                <Input id="website" placeholder="https://www.elabogadoaaron.com" type="url" {...field("website")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Legal Credentials ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Legal Credentials
            </CardTitle>
            <CardDescription>Bar number and practice areas for document context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bar_number">Bar Number (optional)</Label>
              <Input id="bar_number" placeholder="e.g. TX 24012345" {...field("bar_number")} />
            </div>
            <div className="space-y-2">
              <Label>Practice Areas</Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select all that apply — the AI uses these to tailor document context</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRACTICE_AREA_OPTIONS.map((area) => {
                  const active = form.practice_areas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => togglePracticeArea(area)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Branding ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding
            </CardTitle>
            <CardDescription>
              Logo and colors appear in document headers and the platform UI.{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">Powered by Luuc.ai</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL (optional)</Label>
              <Input id="logo_url" placeholder="https://yourfirm.com/logo.png" type="url" {...field("logo_url")} />
              <p className="text-xs text-slate-500">Hosted image URL — shown in document letterheads instead of firm name text</p>
            </div>
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setForm({ ...form, primary_color: preset.value })}
                    className={`flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all ${
                      form.primary_color === preset.value
                        ? "border-slate-400 ring-2 ring-slate-400 ring-offset-1"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: preset.value, color: "#fff" }}
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-500">{form.primary_color}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="px-4 py-2.5 text-xs font-semibold text-white" style={{ backgroundColor: form.primary_color }}>
                {form.name || "Your Firm Name"}
              </div>
              <div className="bg-white px-4 py-3 dark:bg-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: form.primary_color }}>
                  {form.name || "Your Firm Name"}
                </p>
                {form.tagline && <p className="text-[9px] uppercase tracking-widest text-slate-400">{form.tagline}</p>}
                <p className="mt-2 font-serif text-xs text-slate-700 dark:text-slate-300">
                  Document content will appear here in your firm's letterhead…
                </p>
              </div>
              <div className="border-t border-slate-100 bg-slate-50 px-4 py-1.5 dark:border-slate-700 dark:bg-slate-900/50">
                <p className="text-center text-[9px] text-slate-400">Powered by Luuc.ai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── AI Preferences ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Document Preferences
            </CardTitle>
            <CardDescription>How the AI drafts documents for your firm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="style">Writing Style</Label>
              <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {documentStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Specific Tone (optional)</Label>
              <Input id="tone" placeholder="e.g. Persuasive and client-focused, conservative, aggressive..." {...field("tone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customInstructions">
                <FileText className="mr-1 inline h-3.5 w-3.5" />
                Custom AI Instructions (optional)
              </Label>
              <Textarea
                id="customInstructions"
                placeholder="e.g. Always cite INA sections, use formal salutations, reference specific regulations..."
                rows={4}
                {...field("customInstructions")}
              />
              <p className="text-xs text-slate-500">Applied to every document this firm generates</p>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/configuracion">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
            ) : (
              <><Save className="h-4 w-4" />{isNewCompany ? "Create Firm Profile" : "Save Changes"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
