import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, categories, sections } from '@/db';
import { eq, desc, like, or, and } from 'drizzle-orm';
import Link from 'next/link';
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';
import CategoryFilters from '@/components/admin/CategoryFilters';
import { getServerPermissions } from '@/lib/server-permissions';

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

  // Get user permissions
  const permissions = await getServerPermissions();

  // Check if user has access to categories page
  if (!permissions.canAccessCategoriesPage) {
    redirect('/admin/dashboard');
  }

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
    .orderBy(sections.name, categories.order);

  // Fetch all sections for filter
  const allSections = await db.select().from(sections).orderBy(sections.name);

  return (
    <div className="space-y-6">
      {/* Action Button */}
      {permissions.canCreateCategories && (
        <div className="flex justify-end">
          <Link
            href="/admin/categories/new"
            className="bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Category
          </Link>
        </div>
      )}

      {/* Filters */}
      <CategoryFilters 
        sections={allSections} 
        initialSearch={searchParams.search}
        initialSection={searchParams.section}
        initialStatus={searchParams.status}
      />

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
                        {permissions.canEditCategories && (
                          <>
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </Link>
                            <span className="text-gray-300">|</span>
                          </>
                        )}
                        <Link
                          href={`/products/${category.slug}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900"
                        >
                          View
                        </Link>
                        {permissions.canDeleteCategories && (
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
