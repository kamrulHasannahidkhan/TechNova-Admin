"use client";
import { useEffect, useState } from "react";

type Department = { _id: string; title: string };
type Product = {
  _id: string; name: string; slug: string; description: string;
  price: number; originalPrice?: number; stock: number;
  images?: string[]; department: Department; tags: string[];
};

const MAX_IMAGES = 3;

const TAGS = [
  { key: "new-arrival", label: "New Arrival" },
  { key: "exclusive", label: "Exclusive" },
  { key: "best-seller", label: "Best Seller" },
];

const EMPTY_FORM = {
  name: "", slug: "", description: "", price: "", originalPrice: "",
  stock: "", department: "", tags: [] as string[],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [pRes, dRes] = await Promise.all([fetch("/api/products"), fetch("/api/departments")]);
    setProducts(await pRes.json());
    setDepartments(await dRes.json());
  };

  useEffect(() => { load(); }, []);

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

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    const room = MAX_IMAGES - images.length;
    setFiles(picked.slice(0, room));
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImages([]);
    setFiles([]);
    setInputKey((k) => k + 1);
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
    setImages(p.images || []);
    setFiles([]);
    setInputKey((k) => k + 1);
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

    const uploaded: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.secure_url) uploaded.push(data.secure_url);
    }

    const finalImages = [...images, ...uploaded].slice(0, MAX_IMAGES);

    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      images: finalImages,
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

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Products</h1>
      <p className="text-sm text-[--admin-steel] mb-6">{products.length} total</p>

      <form onSubmit={handleSubmit} className="admin-card p-5 flex flex-col gap-3 mb-8">
        <h2 className="font-semibold text-sm mb-1">{editingId ? "Edit product" : "Add product"}</h2>
        <select className="admin-input" value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })} required>
          <option value="">Select department</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}
        </select>
        <input className="admin-input" placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="admin-input" placeholder="Slug" value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <textarea className="admin-input" placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="grid grid-cols-3 gap-3">
          <input type="number" className="admin-input" placeholder="Original price (optional)" value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
          <input type="number" className="admin-input" placeholder="Sale price" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input type="number" className="admin-input" placeholder="Stock" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        </div>
        <p className="text-xs text-[--admin-steel]">Set an original price higher than the sale price to show a discount badge on the storefront.</p>

        <div>
          <p className="text-sm font-medium mb-2">Images ({images.length + files.length}/{MAX_IMAGES})</p>

          {images.length > 0 && (
            <div className="flex gap-3 mb-3">
              {images.map((url) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {canAddMore ? (
            <>
              <input
                key={inputKey}
                type="file"
                accept="image/*"
                multiple
                className="text-sm"
                onChange={handleFiles}
              />
              {files.length > 0 && (
                <p className="text-xs text-[--admin-steel] mt-1">
                  Selected: {files.map((f) => f.name).join(", ")}
                </p>
              )}
              <p className="text-xs text-[--admin-steel] mt-1">
                You can add {MAX_IMAGES - images.length} more image(s). Hold Ctrl to pick several at once.
              </p>
            </>
          ) : (
            <p className="text-xs text-[--admin-steel]">Maximum reached. Remove one to add a different image.</p>
          )}
        </div>

        <div className="flex gap-4 pt-1">
          {TAGS.map((t) => (
            <label key={t.key} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={form.tags.includes(t.key)} onChange={() => toggleTag(t.key)} />
              {t.label}
            </label>
          ))}
        </div>

        <div className="flex gap-2 mt-1">
          <button disabled={loading} className="admin-btn-primary w-fit">
            {loading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="admin-btn-secondary w-fit">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="admin-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left border-b border-[--admin-line] bg-[--admin-bg]">
              <th className="py-3 px-4 admin-label font-normal">Name</th>
              <th className="admin-label font-normal">Department</th>
              <th className="admin-label font-normal">Price</th>
              <th className="admin-label font-normal">Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-[--admin-line] last:border-0">
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="text-[--admin-steel]">{p.department?.title}</td>
                <td className="font-medium">
                  {p.originalPrice && <span className="line-through text-[--admin-steel] mr-1">৳{p.originalPrice}</span>}
                  ৳{p.price}
                </td>
                <td>
                  <div className="flex gap-3">
                    {TAGS.map((t) => (
                      <label key={t.key} className="flex items-center gap-1 text-xs text-[--admin-steel]">
                        <input
                          type="checkbox"
                          checked={p.tags?.includes(t.key) || false}
                          onChange={() => toggleProductTag(p, t.key)}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(p)} className="admin-link-edit">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="admin-link-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
