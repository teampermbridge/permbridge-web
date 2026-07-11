import { Link } from 'react-router-dom';
import { ArrowLeft, Grid3x3, Zap, AlertCircle, TrendingUp, Lock } from 'lucide-react';

export function MatrixPage() {
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
            <h1 className="text-2xl font-bold text-white">Permission Matrix X-Ray</h1>
            <p className="text-sm text-slate-400">Compare permissions across profiles & permission sets</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Coming in Phase 3</h2>
              <p className="text-slate-300 mb-4">
                Advanced permission analysis with visual comparisons, conflict detection, and trend analysis.
                This feature is coming soon to help you understand permission patterns across your organization.
              </p>
              <div className="text-sm text-slate-400">
                <strong>Phase Timeline:</strong> Phase 3 will launch Weeks 5-7 with full visualization capabilities.
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Heatmap */}
          <div className="card card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400/20 to-red-600/20 rounded-lg flex items-center justify-center mb-4">
              <Grid3x3 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Heatmap Visualization</h3>
            <p className="text-slate-400 text-sm mb-4">
              Interactive heatmaps showing permission distribution across objects and profiles at a glance.
            </p>
            <div className="flex items-center text-red-400 text-sm font-semibold">
              Phase 3 <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
            </div>
          </div>

          {/* Conflict Detection */}
          <div className="card card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conflict Detection</h3>
            <p className="text-slate-400 text-sm mb-4">
              Automatic detection of risky permission combinations that shouldn't coexist in your org.
            </p>
            <div className="flex items-center text-yellow-400 text-sm font-semibold">
              Phase 3 <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="card card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trend Analysis</h3>
            <p className="text-slate-400 text-sm mb-4">
              Track permission changes over time and identify security drift across your organization.
            </p>
            <div className="flex items-center text-green-400 text-sm font-semibold">
              Phase 3 <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
            </div>
          </div>
        </div>

        {/* Detailed Feature List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Capabilities You'll Get</h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Cross-Profile Comparison',
                  desc: 'Compare permissions side-by-side across multiple profiles and permission sets'
                },
                {
                  title: 'Object-Level Analysis',
                  desc: 'Deep dive into object permissions with granular CRUD operations breakdown'
                },
                {
                  title: 'Permission Inheritance Tree',
                  desc: 'Visualize how permissions flow through your org hierarchy'
                },
                {
                  title: 'Bulk Operations',
                  desc: 'Convert multiple profiles in batch with conflict pre-detection'
                },
              ].map((item, idx) => (
                <div key={idx} className="card card-hover p-4">
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Integration Roadmap</h3>
            <div className="space-y-4">
              {[
                {
                  phase: 'Phase 3',
                  items: ['Heatmap visualizations', 'Conflict detection', 'Export to PDF/CSV', 'Trend analysis']
                },
                {
                  phase: 'Phase 4+',
                  items: ['Slack integration', 'Email alerts', 'Multi-org support', 'Real-time monitoring']
                },
              ].map((section, idx) => (
                <div key={idx} className="card">
                  <h4 className="font-bold text-white mb-3 text-lg">{section.phase}</h4>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-center gap-2 text-slate-300 text-sm">
                        <Zap className="w-4 h-4 text-slate-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Stay Tuned</h3>
          <p className="text-slate-300 mb-6">
            Permission Matrix X-Ray launches in Phase 3. In the meantime, use Profile Converter and Permission Set Summarizer.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition">
            Back to Dashboard
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </main>
    </div>
  );
}
