import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { permsets } from '../api/endpoints';

export function SummarizerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: permsetsList = [], isLoading } = useQuery({
    queryKey: ['permsets'],
    queryFn: () => permsets.getAll().then((res) => res.data),
  });

  const filtered = permsetsList.filter((ps: any) =>
    ps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ps.description && ps.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Permission Set Summarizer</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Permission Sets
            </h2>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500">
              {permsetsList.length === 0
                ? 'No permission sets found.'
                : 'No matching permission sets.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((ps: any) => (
                <div
                  key={ps.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900">{ps.name}</h3>
                  <p className="text-sm text-gray-600">{ps.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Permissions: {ps.permissions_count}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">What You Get</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ Complete 360° permission breakdown</li>
              <li>✓ Object and field-level permissions</li>
              <li>✓ System permissions overview</li>
              <li>✓ Related Permission Set Groups</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Coming Soon</h3>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>📊 Visual permission graph</li>
              <li>🔄 Diff view (compare two sets)</li>
              <li>📥 PDF/CSV export</li>
              <li>📝 Audit trail tracking</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
