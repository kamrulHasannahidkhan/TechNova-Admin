"use client";
import { useEffect, useState } from "react";

type Category = { _id: string; name: string };
type Section = { _id: string; title: string; description: string; category: Category; order: number };

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ title: "", description: "", category: "", order: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const [sRes, cRes] = await Promise.all([fetch("/api/sections"), fetch("/api/categories")]);
    setSections(await sRes.json());
    setCategories(await cRes.json());
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", category: "", order: 0 });
    setEditingId(null);
  };

  const handleEdit = (s: Section) => {
    setForm({ title: s.title, description: s.description, category: s.category._id, order: s.order });
    setEditingId(s._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    await fetch(`/api/sections/${id}`, { method: "DELETE" });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, order: Number(form.order) };

    if (editingId) {
      await fetch(`/api/sections/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    load();
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Homepage Sections</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded mb-8">
        <h2 className="font-medium">{editingId ? "Edit section" : "Add new section"}</h2>
        <input className="border p-2 rounded" placeholder="Section title (e.g. Electronics)" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="border p-2 rounded" placeholder="Optional description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className="border p-2 rounded" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} required>
          <option value="">Select category to pull products from</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input type="number" className="border p-2 rounded" placeholder="Order (0 = first)" value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        <div className="flex gap-2">
          <button className="bg-black text-white px-4 py-2 rounded">{editingId ? "Update" : "Add"}</button>
          {editingId && <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {sections.map((s) => (
          <div key={s._id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-gray-500">Category: {s.category?.name} · Order: {s.order}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(s)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(s._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
