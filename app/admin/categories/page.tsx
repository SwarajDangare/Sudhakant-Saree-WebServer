import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq, desc, like, or, and } from 'drizzle-orm';
import Link from 'next/link';
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  section?: string;
  status?: string;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const userRole = session.user.role;

  // Check if user has permission to manage categories (SUPER_ADMIN or SHOP_MANAGER)
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'SHOP_MANAGER') {
    redirect('/admin/dashboard');
  }

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Build query conditions
  const conditions = [];

  if (searchParams.search) {
    conditions.push(
      or(
        like(categories.name, `%${searchParams.search}%`),
        like(categories.description, `%${searchParams.search}%`)
      )
    );
  }

  if (searchParams.section) {
    conditions.push(eq(categories.sectionId, searchParams.section));
  }

  if (searchParams.status === 'active') {
    conditions.push(eq(categories.active, true));
  } else if (searchParams.status === 'inactive') {
    conditions.push(eq(categories.active, false));
  }

  // Fetch categories with relations
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      order: categories.order,
      active: categories.active,
      createdAt: categories.createdAt,
      section: {
        id: sections.id,
        name: sections.name,
      },
    })
    .from(categories)
    .leftJoin(sections, eq(categories.sectionId, sections.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(categories.order, desc(categories.createdAt));

  // Fetch all sections for filter
  const allSections = await db.select().from(sections).orderBy(sections.name);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center text-gray-600 hover:text-maroon mb-4 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin
              ? 'Manage your product categories and sections'
              : 'Manage product categories (add categories to existing sections)'}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search categories..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
            />
          </div>

          {/* Section Filter */}
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              id="section"
              name="section"
              defaultValue={searchParams.section}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
            >
              <option value="">All Sections</option>
              {allSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={searchParams.status}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="bg-maroon text-white px-6 py-2 rounded-md font-semibold hover:bg-deep-maroon transition"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/categories"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {allCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              {searchParams.search || searchParams.section || searchParams.status
                ? 'Try adjusting your filters'
                : 'Get started by adding your first category'}
            </p>
            <Link
              href="/admin/categories/new"
              className="inline-block bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition"
            >
              Add Your First Category
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {category.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {category.description.substring(0, 60)}
                              {category.description.length > 60 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {category.section?.name || 'No Section'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded text-center ${
                          category.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/products/${category.slug}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </Link>
                        {isSuperAdmin && (
                          <>
                            <span className="text-gray-300">|</span>
                            <DeleteCategoryButton
                              categoryId={category.id}
                              categoryName={category.name}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {allCategories.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{allCategories.length}</span> categor{allCategories.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      )}
    </div>
  );
}
