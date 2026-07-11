import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Send, Clock, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { profiles } from '../api/endpoints';

export function ConverterPage() {
  const { data: profilesList = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => profiles.getAll().then((res) => res.data),
  });

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
            <h1 className="text-2xl font-bold text-white">Profile 2 Permset Converter</h1>
            <p className="text-sm text-slate-400">Convert Profiles to Permission Sets with AI</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">Select a Profile</h2>
              <p className="text-slate-400 mb-6">Choose a Profile from your Salesforce org to convert</p>

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading profiles...</p>
                  </div>
                </div>
              ) : profilesList.length === 0 ? (
                <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No profiles found</p>
                    <p className="text-slate-500 text-sm">Check your Salesforce connection</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profilesList.map((profile: any) => (
                    <button
                      key={profile.id}
                      className="w-full text-left p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition">
                            {profile.name}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">{profile.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                              {profile.permissions_count || 0} permissions
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 pt-1">
                          <Send className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Info & features */}
          <div className="lg:col-span-1 space-y-6">
            {/* How it works */}
            <div className="card card-hover">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                How It Works
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                    1
                  </span>
                  <span className="text-sm text-slate-300">Select a Profile</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                    2
                  </span>
                  <span className="text-sm text-slate-300">AI analyzes permissions</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                    3
                  </span>
                  <span className="text-sm text-slate-300">Review suggestions</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm font-semibold rounded-full flex items-center justify-center">
                    4
                  </span>
                  <span className="text-sm text-slate-300">Create Permission Sets</span>
                </li>
              </ol>
            </div>

            {/* Benefits */}
            <div className="card card-hover">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Benefits
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>AI-powered intelligent grouping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Save and reuse templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Undo/redo editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Full audit trail</span>
                </li>
              </ul>
            </div>

            {/* Timeline */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Coming Soon
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Batch convert profiles</li>
                <li>• Real-time AI streaming</li>
                <li>• Export to JSON/CSV</li>
                <li>• Slack notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
