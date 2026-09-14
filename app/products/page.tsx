"use client";
import { useEffect, useState } from "react";

type Department = { _id: string; title: string };
type Product = {
  _id: string; name: string; price: number; originalPrice?: number; stock: number;
  department: Department; tags: string[];
};

const TAGS = [
  { key: "new-arrival", label: "New Arrival" },
  { key: "exclusive", label: "Exclusive" },
  { key: "best-seller", label: "Best Seller" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", originalPrice: "", stock: "", department: "", tags: [] as string[] });
  const [file, setFile] = useState<File | null>(null);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "";
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.secure_url;
    }

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : [],
      }),
    });

    setLoading(false);
    setForm({ name: "", slug: "", description: "", price: "", originalPrice: "", stock: "", department: "", tags: [] });
    setFile(null);
    load();
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Products</h1>
      <p className="text-sm text-[--admin-steel] mb-6">{products.length} total</p>

      <form onSubmit={handleSubmit} className="admin-card p-5 flex flex-col gap-3 mb-8">
        <h2 className="font-semibold text-sm mb-1">Add product</h2>
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
        <input type="file" accept="image/*" className="text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />

        <div className="flex gap-4 pt-1">
          {TAGS.map((t) => (
            <label key={t.key} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={form.tags.includes(t.key)} onChange={() => toggleTag(t.key)} />
              {t.label}
            </label>
          ))}
        </div>

        <button disabled={loading} className="admin-btn-primary w-fit mt-1">
          {loading ? "Saving..." : "Add Product"}
        </button>
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
                <td className="px-4"><button onClick={() => handleDelete(p._id)} className="admin-link-danger">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
