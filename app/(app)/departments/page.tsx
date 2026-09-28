"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";

type Dept = { id: number; name: string; description: string; color: string; headcount: number };

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Dept[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6C5DD3" });
  const [error, setError] = useState("");

  async function load() {
    const d = await fetch("/api/departments").then((r) => r.json());
    setDepts(d);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name) { setError("Department name is required"); return; }
    const res = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setModalOpen(false);
    setForm({ name: "", description: "", color: "#6C5DD3" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition">
          <Plus className="w-4 h-4" /> Add department
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depts.map((d) => (
          <div key={d.id} className="card p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${d.color}1a`, color: d.color }}>
              <Users className="w-5 h-5" />
            </div>
            <p className="font-semibold">{d.name}</p>
            <p className="text-xs text-muted mt-1 line-clamp-2">{d.description || "No description"}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-xs text-muted">Headcount</span>
              <span className="text-sm font-semibold">{d.headcount}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add department">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-16 h-10 rounded-lg border border-border" />
          </div>
          {error && <div className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-background">Cancel</button>
            <button type="submit" className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark">Add department</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
