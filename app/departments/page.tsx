"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  ArrowUpDown,
  X,
  Sparkles,
} from "lucide-react";

type Department = { _id: string; title: string; image: string; link: string; order: number };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ title: "", order: 0 });
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
    setForm({ title: "", order: 0 });
    setFile(null);
    setCurrentImage("");
    setEditingId(null);
  };

  const handleEdit = (d: Department) => {
    setForm({ title: d.title, order: d.order });
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-blue-600" /> Shop by Department
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize storefront navigation categories and display order.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 w-fit">
          {departments.length} Categories
        </span>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-8 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-sm sm:text-base text-slate-900">
              {editingId ? "Edit Department" : "Add New Department"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Department Title
            </label>
            <input
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="e.g. Cell Phones, Laptops, Audio"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Display Order
            </label>
            <input
              type="number"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="0 (0 = first)"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Category Icon / Image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {currentImage && !file && (
              <div className="relative shrink-0 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
                <img
                  src={currentImage}
                  alt="Preview"
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? "Saving..." : editingId ? "Update Department" : "Add Department"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Departments Grid Display */}
      {departments.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No departments added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {departments.map((d) => (
            <div
              key={d._id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {d.image ? (
                  <img src={d.image} alt={d.title} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{d.title}</p>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <ArrowUpDown className="w-3 h-3 text-slate-300" /> Order: {d.order}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 border-l border-slate-100 pl-2">
                <button
                  onClick={() => handleEdit(d)}
                  title="Edit Department"
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(d._id)}
                  title="Delete Department"
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}