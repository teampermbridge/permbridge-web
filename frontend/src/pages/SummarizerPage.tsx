import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, BarChart3, Download, Eye, Filter } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Permission Set Summarizer</h1>
            <p className="text-sm text-slate-400">360° view of permissions with detailed analysis</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Permission Sets List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-purple-500 animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading permission sets...</p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-96 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">
                    {permsetsList.length === 0 ? 'No permission sets found' : 'No matching results'}
                  </p>
                  <p className="text-slate-500 text-sm">Try adjusting your search</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((ps: any) => (
                  <button
                    key={ps.id}
                    className="w-full text-left p-5 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">
                          {ps.name}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">{ps.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                            {ps.permissions_count || 0} permissions
                          </span>
                          {ps.last_synced_at && (
                            <span className="text-xs text-slate-500">
                              Synced {new Date(ps.last_synced_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 pt-1">
                        <Eye className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Features */}
            <div className="card card-hover">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Features
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Object permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Field-level access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>System permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Related metadata</span>
                </li>
              </ul>
            </div>

            {/* Coming Soon */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Coming Soon
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Side-by-side compare</li>
                <li>• PDF export</li>
                <li>• CSV download</li>
                <li>• Permission search</li>
              </ul>
            </div>

            {/* Filters */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                Filter
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white transition">
                  <input type="checkbox" className="rounded" defaultChecked />
                  With permissions
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 hover:text-white transition">
                  <input type="checkbox" className="rounded" defaultChecked />
                  Synced recently
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
