"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", stock: "", category: "" });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

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
      body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), images: imageUrl ? [imageUrl] : [] }),
    });

    setLoading(false);
    router.push("/products");
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-lg flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <input className="border p-2 rounded" placeholder="Name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input className="border p-2 rounded" placeholder="Slug" value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      <textarea className="border p-2 rounded" placeholder="Description" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} required />
      <input type="number" className="border p-2 rounded" placeholder="Price" value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })} required />
      <input type="number" className="border p-2 rounded" placeholder="Stock" value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
      <select className="border p-2 rounded" value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })} required>
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button disabled={loading} className="bg-black text-white p-2 rounded">
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}
