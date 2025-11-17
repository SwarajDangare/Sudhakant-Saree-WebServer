import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories } from '@/db';
import { eq } from 'drizzle-orm';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch categories for the form
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Create a new product listing for your store
        </p>
      </div>

      {/* Form */}
      <ProductForm categories={allCategories} />
    </div>
  );
}
