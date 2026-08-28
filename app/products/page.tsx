"use client";
import { useEffect, useState } from "react";

type Department = { _id: string; title: string };
type Product = { _id: string; name: string; price: number; stock: number; department: Department };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", stock: "", department: "" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [pRes, dRes] = await Promise.all([fetch("/api/products"), fetch("/api/departments")]);
    setProducts(await pRes.json());
    setDepartments(await dRes.json());
  };

  useEffect(() => { load(); }, []);

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
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : [],
      }),
    });

    setLoading(false);
    setForm({ name: "", slug: "", description: "", price: "", stock: "", department: "" });
    setFile(null);
    load();
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border p-4 rounded mb-8">
        <h2 className="font-medium">Add product</h2>
        <select className="border p-2 rounded" value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })} required>
          <option value="">Select department</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}
        </select>
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
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th>Department</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td>{p.department?.title}</td>
              <td>৳{p.price}</td>
              <td>{p.stock}</td>
              <td><button onClick={() => handleDelete(p._id)} className="text-red-600">Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
