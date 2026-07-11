import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function MatrixPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Permission Matrix X-Ray</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compare Permissions Across Profiles & Permission Sets
          </h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-900 mb-4">
              This feature is coming in Phase 3. It will enable you to:
            </p>
            <ul className="text-sm text-blue-800 space-y-2 ml-4">
              <li>• Create interactive heatmaps comparing permissions</li>
              <li>• Visualize permission inheritance trees</li>
              <li>• Detect conflicting permission combinations</li>
              <li>• Export comparison data as PDF/CSV</li>
              <li>• Set up alerts for risky permission combinations</li>
            </ul>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Heatmap Visualization</h3>
            <p className="text-sm text-purple-800">
              See at a glance which objects have elevated permissions across your org
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Conflict Detection</h3>
            <p className="text-sm text-blue-800">
              Automatically identify risky permission combinations that shouldn't coexist
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">Trend Analysis</h3>
            <p className="text-sm text-green-800">
              Track permission changes over time to identify security drift
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Phase Timeline</h3>
          <p className="text-sm text-yellow-800">
            Phase 1 (Current): Core features foundation with OAuth and API integration
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            Phase 3 (Weeks 5-7): Permission Matrix with heatmap, conflict detection, and advanced visualizations
          </p>
        </div>
      </main>
    </div>
  );
}
