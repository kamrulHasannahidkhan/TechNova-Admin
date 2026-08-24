"use client";
import { useEffect, useState } from "react";

type Category = { _id: string; name: string; slug: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    setName(""); setSlug("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input className="border p-2 rounded flex-1" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)} required />
        <input className="border p-2 rounded flex-1" placeholder="Slug" value={slug}
          onChange={(e) => setSlug(e.target.value)} required />
        <button className="bg-black text-white px-4 rounded">Add</button>
      </form>
      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c._id} className="flex justify-between border-b pb-2">
            <span>{c.name}</span>
            <button onClick={() => handleDelete(c._id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
