import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/products/new" className="bg-black text-white px-4 py-2 rounded">
          + Add Product
        </Link>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p._id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td>৳{p.price}</td>
              <td>{p.stock}</td>
              <td className="flex gap-2 py-2">
                <Link href={`/products/${p._id}/edit`} className="text-blue-600">Edit</Link>
                <DeleteButton id={p._id.toString()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
