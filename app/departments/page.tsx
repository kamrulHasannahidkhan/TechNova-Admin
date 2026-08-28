"use client";
import { useEffect, useState } from "react";

type Department = { _id: string; title: string; image: string; link: string; order: number };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ title: "", link: "", order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/departments");
    setDepartments(await res.json());
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: "", link: "", order: 0 });
    setFile(null);
    setCurrentImage("");
    setEditingId(null);
  };

  const handleEdit = (d: Department) => {
    setForm({ title: d.title, link: d.link, order: d.order });
    setCurrentImage(d.image);
    setEditingId(d._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    await fetch(`/api/departments/${id}`, { method: "DELETE" });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = currentImage;
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.secure_url;
    }

    if (!imageUrl) {
      alert("Please upload an image");
      setLoading(false);
      return;
    }

    const payload = { ...form, order: Number(form.order), image: imageUrl };

    if (editingId) {
      await fetch(`/api/departments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/departments", {
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
      <h1 className="text-2xl font-bold mb-6">Shop by Department</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded mb-8">
        <h2 className="font-medium">{editingId ? "Edit department" : "Add new department"}</h2>
        <input className="border p-2 rounded" placeholder="Title (e.g. Cell Phones)" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Link (optional, e.g. /category/phones)" value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })} />
        <input type="number" className="border p-2 rounded" placeholder="Order (0 = first)" value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {currentImage && !file && <img src={currentImage} alt="" className="w-16 h-16 object-contain" />}
        <div className="flex gap-2">
          <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
            {loading ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3">
        {departments.map((d) => (
          <div key={d._id} className="border rounded p-3 flex items-center gap-3">
            <img src={d.image} alt="" className="w-10 h-10 object-contain" />
            <div className="flex-1">
              <p className="font-medium">{d.title}</p>
              <p className="text-xs text-gray-500">Order: {d.order}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => handleEdit(d)} className="text-blue-600 text-sm">Edit</button>
              <button onClick={() => handleDelete(d._id)} className="text-red-600 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
