"use client";
import { useEffect, useState } from "react";

type Perk = { _id: string; title: string; description: string; icon: string; order: number };

export default function PerksPage() {
  const [perks, setPerks] = useState<Perk[]>([]);
  const [form, setForm] = useState({ title: "", description: "", order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/perks");
    setPerks(await res.json());
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", description: "", order: 0 });
    setFile(null);
    setCurrentIcon("");
    setEditingId(null);
  };

  const handleEdit = (p: Perk) => {
    setForm({ title: p.title, description: p.description, order: p.order });
    setCurrentIcon(p.icon);
    setEditingId(p._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this perk?")) return;
    await fetch(`/api/perks/${id}`, { method: "DELETE" });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let iconUrl = currentIcon;
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      iconUrl = uploadData.secure_url;
    }

    if (!iconUrl) {
      alert("Please upload an icon image");
      setLoading(false);
      return;
    }

    const payload = { ...form, order: Number(form.order), icon: iconUrl };

    if (editingId) {
      await fetch(`/api/perks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/perks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setLoading(false);
    resetForm();
    load();
  };

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Trust Badges</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded mb-8">
        <h2 className="font-medium">{editingId ? "Edit perk" : "Add new perk"}</h2>
        <input className="border p-2 rounded" placeholder="Title (e.g. Free Shipping)" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="border p-2 rounded" placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="number" className="border p-2 rounded" placeholder="Order (0 = first)" value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {currentIcon && !file && <img src={currentIcon} alt="" className="w-10 h-10 object-contain" />}
        <div className="flex gap-2">
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
            {loading ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {perks.map((p) => (
          <div key={p._id} className="border rounded p-3 flex items-center gap-3">
            <img src={p.icon} alt="" className="w-8 h-8 object-contain" />
            <div className="flex-1">
              <p className="font-medium text-sm">{p.title}</p>
              <p className="text-xs text-gray-500">Order: {p.order}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleEdit(p)} className="text-blue-600 text-xs">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="text-red-600 text-xs">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
