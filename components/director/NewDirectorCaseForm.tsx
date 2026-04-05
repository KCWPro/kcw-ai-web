"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubmitMode = "save_draft" | "run_ai" | "save_open";

type FormState = {
  customer_name: string;
  phone: string;
  email: string;
  service_address: string;
  city: string;
  zip_code: string;
  property_type: string;
  residential_or_commercial: "residential" | "commercial" | "unknown";
  urgency_level: "low" | "medium" | "high";
  job_category: string;
  job_description: string;
  scope_notes: string;
  known_symptoms: string;
  known_constraints: string;
  target_equipment_system: string;
  permit_already_exists: "yes" | "no" | "unknown";
  inspection_expected: "yes" | "no" | "unknown";
  access_difficulty: "easy" | "moderate" | "hard" | "unknown";
  house_age_type: "old" | "new" | "unknown";
  leak_present: boolean;
  gas_involved: boolean;
  drain_involved: boolean;
  water_heater_involved: boolean;
  repipe_related: boolean;
  commercial_fixture_related: boolean;
  photos: string;
  videos: string;
  operator_notes: string;
  plan_sketch_refs: string;
  import_lead_id: string;
};

const initialState: FormState = {
  customer_name: "",
  phone: "",
  email: "",
  service_address: "",
  city: "",
  zip_code: "",
  property_type: "",
  residential_or_commercial: "unknown",
  urgency_level: "medium",
  job_category: "",
  job_description: "",
  scope_notes: "",
  known_symptoms: "",
  known_constraints: "",
  target_equipment_system: "",
  permit_already_exists: "unknown",
  inspection_expected: "unknown",
  access_difficulty: "unknown",
  house_age_type: "unknown",
  leak_present: false,
  gas_involved: false,
  drain_involved: false,
  water_heater_involved: false,
  repipe_related: false,
  commercial_fixture_related: false,
  photos: "",
  videos: "",
  operator_notes: "",
  plan_sketch_refs: "",
  import_lead_id: "",
};

export default function NewDirectorCaseForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState<SubmitMode | "import" | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function importLead() {
    if (!form.import_lead_id.trim()) {
      setError("Please input a lead id to import.");
      return;
    }
    setLoading("import");
    setError("");
    const res = await fetch(`/api/director/import-lead/${encodeURIComponent(form.import_lead_id.trim())}`, { method: "POST" });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      setError(payload.error || "Import lead failed");
      setLoading(null);
      return;
    }
    router.push(`/director/cases/${payload.case.case_id}`);
  }

  async function submit(mode: SubmitMode) {
    setLoading(mode);
    setError("");

    const res = await fetch("/api/director/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_type: "manual",
        source_lead_id: null,
        case_title: `${form.job_category || "General Job"} - ${form.city || "Unknown City"}`,
        customer_name: form.customer_name,
        phone: form.phone,
        email: form.email,
        service_address: form.service_address,
        city: form.city,
        zip_code: form.zip_code,
        property_type: form.property_type,
        residential_or_commercial: form.residential_or_commercial,
        urgency_level: form.urgency_level,
        job_category: form.job_category,
        job_description: form.job_description,
        scope_notes: form.scope_notes,
        known_symptoms: form.known_symptoms,
        known_constraints: form.known_constraints,
        target_equipment_system: form.target_equipment_system,
        permit_already_exists: form.permit_already_exists,
        inspection_expected: form.inspection_expected,
        access_difficulty: form.access_difficulty,
        house_age_type: form.house_age_type,
        leak_present: form.leak_present,
        gas_involved: form.gas_involved,
        drain_involved: form.drain_involved,
        water_heater_involved: form.water_heater_involved,
        repipe_related: form.repipe_related,
        commercial_fixture_related: form.commercial_fixture_related,
        operator_notes: [form.operator_notes, `photos:${form.photos}`, `videos:${form.videos}`].filter(Boolean).join(" | "),
        plan_sketch_refs: form.plan_sketch_refs,
      }),
    });

    const payload = await res.json();
    if (!res.ok || !payload.success) {
      setError(payload.error || "Create case failed");
      setLoading(null);
      return;
    }

    const caseId = payload.case.case_id;
    if (mode === "run_ai") {
      await fetch(`/api/director/cases/${caseId}/ai`, { method: "POST" });
      router.push(`/director/cases/${caseId}`);
      return;
    }
    if (mode === "save_open") {
      router.push(`/director/cases/${caseId}`);
      return;
    }
    setLoading(null);
    router.push("/director/cases");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Import Existing Lead (Optional)</h2>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 rounded border px-3 py-2 text-sm" placeholder="lead-1001" value={form.import_lead_id} onChange={(e) => patch("import_lead_id", e.target.value)} />
          <button type="button" onClick={importLead} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">{loading === "import" ? "Importing..." : "Import Lead"}</button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">A. 基础信息</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["customer_name", "phone", "email", "service_address", "city", "zip_code", "property_type"] as const).map((field) => (
            <input key={field} value={form[field]} onChange={(e) => patch(field, e.target.value)} className="rounded border px-3 py-2 text-sm" placeholder={field} />
          ))}
          <select value={form.residential_or_commercial} onChange={(e) => patch("residential_or_commercial", e.target.value as FormState["residential_or_commercial"])} className="rounded border px-3 py-2 text-sm"><option value="unknown">unknown</option><option value="residential">residential</option><option value="commercial">commercial</option></select>
          <select value={form.urgency_level} onChange={(e) => patch("urgency_level", e.target.value as FormState["urgency_level"])} className="rounded border px-3 py-2 text-sm"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">B. 工程输入</h2>
        <div className="mt-3 grid gap-3">
          {(["job_category", "job_description", "scope_notes", "known_symptoms", "known_constraints", "target_equipment_system"] as const).map((field) => (
            <textarea key={field} value={form[field]} onChange={(e) => patch(field, e.target.value)} className="rounded border px-3 py-2 text-sm" placeholder={field} rows={2} />
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={form.permit_already_exists} onChange={(e) => patch("permit_already_exists", e.target.value as FormState["permit_already_exists"])} className="rounded border px-3 py-2 text-sm"><option value="unknown">permit unknown</option><option value="yes">permit yes</option><option value="no">permit no</option></select>
            <select value={form.inspection_expected} onChange={(e) => patch("inspection_expected", e.target.value as FormState["inspection_expected"])} className="rounded border px-3 py-2 text-sm"><option value="unknown">inspection unknown</option><option value="yes">inspection yes</option><option value="no">inspection no</option></select>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">C. 现场条件</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select value={form.access_difficulty} onChange={(e) => patch("access_difficulty", e.target.value as FormState["access_difficulty"])} className="rounded border px-3 py-2 text-sm"><option value="unknown">access unknown</option><option value="easy">easy</option><option value="moderate">moderate</option><option value="hard">hard</option></select>
          <select value={form.house_age_type} onChange={(e) => patch("house_age_type", e.target.value as FormState["house_age_type"])} className="rounded border px-3 py-2 text-sm"><option value="unknown">house age unknown</option><option value="old">old house</option><option value="new">new house</option></select>
          {(["leak_present", "gas_involved", "drain_involved", "water_heater_involved", "repipe_related", "commercial_fixture_related"] as const).map((field) => (
            <label key={field} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
              <input type="checkbox" checked={form[field]} onChange={(e) => patch(field, e.target.checked)} />
              {field}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">D. 媒体与附件（结构化占位）</h2>
        <div className="mt-3 grid gap-3">
          <textarea value={form.photos} onChange={(e) => patch("photos", e.target.value)} className="rounded border px-3 py-2 text-sm" rows={2} placeholder="photos refs" />
          <textarea value={form.videos} onChange={(e) => patch("videos", e.target.value)} className="rounded border px-3 py-2 text-sm" rows={2} placeholder="videos refs" />
          <textarea value={form.operator_notes} onChange={(e) => patch("operator_notes", e.target.value)} className="rounded border px-3 py-2 text-sm" rows={3} placeholder="operator notes" />
          <textarea value={form.plan_sketch_refs} onChange={(e) => patch("plan_sketch_refs", e.target.value)} className="rounded border px-3 py-2 text-sm" rows={2} placeholder="plan / sketch / file refs" />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => submit("save_draft")} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">{loading === "save_draft" ? "Saving..." : "Save Draft Case"}</button>
        <button type="button" onClick={() => submit("run_ai")} className="rounded bg-blue-700 px-3 py-2 text-sm text-white">{loading === "run_ai" ? "Running..." : "Run AI Director Analysis"}</button>
        <button type="button" onClick={() => submit("save_open")} className="rounded border border-slate-400 bg-white px-3 py-2 text-sm">{loading === "save_open" ? "Saving..." : "Save and Open Workspace"}</button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
