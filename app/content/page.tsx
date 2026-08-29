"use client";
import { useEffect, useState } from "react";

type ContentBlock = {
  _id: string;
  section: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
  discountText: string;
  contactLine: string;
};

const SECTIONS = ["hero", "bottom-banner", "footer"];

export default function ContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [form, setForm] = useState({
    section: "hero", title: "", description: "", image: "",
    ctaText: "", ctaLink: "", badge: "", discountText: "", contactLine: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/content");
    setBlocks(await res.json());
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ section: "hero", title: "", description: "", image: "", ctaText: "", ctaLink: "", badge: "", discountText: "", contactLine: "" });
    setFile(null);
    setEditingId(null);
  };

  const handleEdit = (block: ContentBlock) => {
    setForm({
      section: block.section,
      title: block.title || "",
      description: block.description || "",
      image: block.image || "",
      ctaText: block.ctaText || "",
      ctaLink: block.ctaLink || "",
      badge: block.badge || "",
      discountText: block.discountText || "",
      contactLine: block.contactLine || "",
    });
    setEditingId(block._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content block?")) return;
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = form.image;
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.secure_url;
    }

    const payload = { ...form, image: imageUrl };

    if (editingId) {
      await fetch(`/api/content/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/content", {
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
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Site Content</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded mb-8">
        <h2 className="font-medium">{editingId ? "Edit block" : "Add new block"}</h2>
        <select className="border p-2 rounded" value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-xs text-gray-500">
          For "bottom-banner": badge = small top text (e.g. "FREE"), title = big text (e.g. "DELIVERY"),
          description = main line (e.g. "ON ORDERS OVER 5000 BDT"), contactLine = small subtext (e.g. "ANYWHERE IN BANGLADESH")
        </p>
        <input className="border p-2 rounded" placeholder="Badge" value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="border p-2 rounded" placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Discount text (hero only)" value={form.discountText}
          onChange={(e) => setForm({ ...form, discountText: e.target.value })} />
        <input className="border p-2 rounded" placeholder="CTA text (e.g. Order Now)" value={form.ctaText}
          onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
        <input className="border p-2 rounded" placeholder="CTA link" value={form.ctaLink}
          onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Contact line / small subtext" value={form.contactLine}
          onChange={(e) => setForm({ ...form, contactLine: e.target.value })} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {form.image && !file && <img src={form.image} alt="" className="w-32 rounded" />}
        <div className="flex gap-2">
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
            {loading ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {blocks.map((b) => (
          <div key={b._id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-mono text-xs text-gray-500">{b.section}</p>
              <p className="font-medium">{b.title}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleEdit(b)} className="text-blue-600">Edit</button>
              <button onClick={() => handleDelete(b._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
