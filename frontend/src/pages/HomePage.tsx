import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Grid3x3 } from 'lucide-react';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PermBridge</h1>
            <p className="text-sm text-gray-500">Salesforce Permission Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back!</h2>
          <p className="text-lg text-gray-600">
            Choose a tool to manage your Salesforce permissions
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Converter */}
          <Link to="/converter">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Profile 2 Permset Converter
              </h3>
              <p className="text-gray-600 mb-6">
                Convert Profiles to Permission Sets using AI-powered grouping. Save time and organize permissions logically.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* Summarizer */}
          <Link to="/summarizer">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Permission Set Summarizer
              </h3>
              <p className="text-gray-600 mb-6">
                Get a comprehensive 360° view of any Permission Set or Permission Set Group with detailed breakdowns.
              </p>
              <div className="flex items-center text-green-600 font-medium">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* Matrix X-Ray */}
          <Link to="/matrix">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 h-full">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
                <Grid3x3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Permission Matrix X-Ray
              </h3>
              <p className="text-gray-600 mb-6">
                Compare permissions across profiles and permission sets with heatmap visualizations and conflict detection.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Getting Started</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✓ Connected to Salesforce org: {user?.salesforceOrgId}</li>
            <li>✓ Your Profiles and Permission Sets are automatically cached and synced hourly</li>
            <li>✓ All conversions and changes are logged for audit purposes</li>
            <li>✓ Use Claude AI for intelligent permission grouping</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
