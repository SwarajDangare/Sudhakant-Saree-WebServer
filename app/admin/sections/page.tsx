import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db, sections } from '@/db';
import { desc, like, or, and, eq } from 'drizzle-orm';
import Link from 'next/link';
import DeleteSectionButton from '@/components/admin/DeleteSectionButton';

// Make this page dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  status?: string;
}

export default async function SectionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  // Check if user is super admin or shop manager
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SHOP_MANAGER') {
    redirect('/admin/dashboard');
  }

  // Build query conditions
  const conditions = [];

  if (searchParams.search) {
    conditions.push(
      or(
        like(sections.name, `%${searchParams.search}%`),
        like(sections.description, `%${searchParams.search}%`)
      )
    );
  }

  if (searchParams.status === 'active') {
    conditions.push(eq(sections.active, true));
  } else if (searchParams.status === 'inactive') {
    conditions.push(eq(sections.active, false));
  }

  // Fetch sections
  const allSections = await db
    .select()
    .from(sections)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sections.order, desc(sections.createdAt));

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
          <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
          <p className="text-gray-600 mt-1">
            Manage your top-level product sections
          </p>
        </div>
        <Link
          href="/admin/sections/new"
          className="bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Section
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Search sections..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
            />
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
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-maroon text-white px-6 py-2 rounded-md font-semibold hover:bg-deep-maroon transition"
            >
              Apply Filters
            </button>
            <Link
              href="/admin/sections"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-300 transition"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {allSections.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-600 mb-6">
              {searchParams.search || searchParams.status
                ? 'Try adjusting your filters'
                : 'Get started by adding your first section'}
            </p>
            <Link
              href="/admin/sections/new"
              className="inline-block bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition"
            >
              Add Your First Section
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
                {allSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {section.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {section.name}
                          </div>
                          {section.description && (
                            <div className="text-sm text-gray-500 truncate max-w-md">
                              {section.description.substring(0, 60)}
                              {section.description.length > 60 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {section.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded text-center ${
                          section.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {section.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sections/${section.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/admin/categories?section=${section.id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Categories
                        </Link>
                        <span className="text-gray-300">|</span>
                        <DeleteSectionButton
                          sectionId={section.id}
                          sectionName={section.name}
                        />
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
      {allSections.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{allSections.length}</span> section{allSections.length === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  );
}
