"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
  Upload,
  X,
  Layers,
  DollarSign,
  AlertCircle,
} from "lucide-react";

type Department = { _id: string; title: string };
type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images?: string[];
  department: Department;
  tags: string[];
};

const TAGS = [
  { key: "new-arrival", label: "New Arrival" },
  { key: "exclusive", label: "Exclusive" },
  { key: "best-seller", label: "Best Seller" },
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  department: "",
  tags: [] as string[],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [pRes, dRes] = await Promise.all([fetch("/api/products"), fetch("/api/departments")]);
    setProducts(await pRes.json());
    setDepartments(await dRes.json());
  };

  useEffect(() => {
    load();
  }, []);

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  };

  const toggleProductTag = async (product: Product, tag: string) => {
    const newTags = product.tags.includes(tag)
      ? product.tags.filter((t) => t !== tag)
      : [...product.tags, tag];
    await fetch(`/api/products/${product._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: newTags }),
    });
    load();
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setCurrentImage("");
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      stock: String(p.stock),
      department: p.department?._id || "",
      tags: p.tags || [],
    });
    setCurrentImage(p.images?.[0] || "");
    setFile(null);
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
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

    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      images: imageUrl ? [imageUrl] : [],
    };

    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/products", {
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage inventory, pricing, tags, and department assignments.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          {products.length} Total Items
        </span>
      </div>

      {/* Product Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-8 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-base text-slate-900">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Department
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition bg-white"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Product Name
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            URL Slug
          </label>
          <input
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
            placeholder="wireless-noise-canceling-headphones"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
            placeholder="Write a clear summary of features..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        {/* Pricing & Stock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Original Price (৳)
            </label>
            <input
              type="number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="e.g. 5000"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sale Price (৳)
            </label>
            <input
              type="number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="e.g. 4200"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none transition"
              placeholder="e.g. 25"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Set an original price higher than the sale price to display a discount badge on the storefront.
        </p>

        {/* Image Upload Area */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Product Image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {currentImage && !file && (
              <div className="relative group shrink-0">
                <img
                  src={currentImage}
                  alt="Product thumbnail"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Tags */}
        <div className="pt-2">
          <span className="block text-xs font-semibold text-slate-600 mb-2">
            Badges & Attributes
          </span>
          <div className="flex gap-4 flex-wrap">
            {TAGS.map((t) => (
              <label
                key={t.key}
                className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  checked={form.tags.includes(t.key)}
                  onChange={() => toggleTag(t.key)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Products Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-400 font-mono">/products/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {p.department?.title || "Unassigned"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {p.originalPrice && (
                        <span className="line-through text-slate-400 text-xs mr-1.5">
                          ৳{p.originalPrice}
                        </span>
                      )}
                      <span>৳{p.price}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex gap-2 flex-wrap">
                        {TAGS.map((t) => (
                          <label
                            key={t.key}
                            className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900"
                          >
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                              checked={p.tags?.includes(t.key) || false}
                              onChange={() => toggleProductTag(p, t.key)}
                            />
                            {t.label}
                          </label>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}