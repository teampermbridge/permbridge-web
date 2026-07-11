import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { LogOut, Users, Zap, Grid3x3, Settings, Bell, Search, BarChart3, ArrowUpRight } from 'lucide-react';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PermBridge</h1>
              <p className="text-xs text-slate-400">Permission Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg px-3 py-2 gap-2">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-white placeholder-slate-500 outline-none text-sm w-32"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0]}</h2>
            <p className="text-slate-300">
              Org ID: <code className="bg-slate-800 px-2 py-1 rounded text-slate-200 font-mono text-sm">{user?.salesforceOrgId}</code>
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Profiles', value: '12', change: '+2', icon: Users },
            { label: 'Permission Sets', value: '48', change: '+8', icon: Grid3x3 },
            { label: 'Conversions', value: '6', change: '+1', icon: Zap },
            { label: 'Audit Logs', value: '156', change: '+32', icon: BarChart3 },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Feature cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Converter */}
            <Link to="/converter">
              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300 h-full cursor-pointer hover:shadow-lg hover:shadow-blue-500/10">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg flex items-center justify-center group-hover:from-blue-400/40 group-hover:to-blue-600/40 transition">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">
                  Profile 2 Permset Converter
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  Convert Profiles to Permission Sets using AI-powered intelligent grouping. Suggest names and organize permissions logically.
                </p>
                <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Get started
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Summarizer */}
            <Link to="/summarizer">
              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300 h-full cursor-pointer hover:shadow-lg hover:shadow-purple-500/10">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg flex items-center justify-center group-hover:from-purple-400/40 group-hover:to-purple-600/40 transition">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">
                  Permission Set Summarizer
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  Get a comprehensive 360° view of any Permission Set with object permissions, field access, and related metadata breakdown.
                </p>
                <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Get started
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Matrix */}
            <Link to="/matrix">
              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 h-full cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-lg flex items-center justify-center group-hover:from-indigo-400/40 group-hover:to-indigo-600/40 transition">
                    <Grid3x3 className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                  Permission Matrix X-Ray
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                  Compare permissions across profiles with interactive heatmaps, detect conflicts, and analyze permission inheritance patterns.
                </p>
                <div className="flex items-center text-indigo-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Get started
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-1">Connected & Synced</h4>
            <p className="text-slate-400 text-sm mb-4">
              Your Salesforce org is connected and data is automatically synced hourly. All conversions and changes are logged for audit compliance.
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition">
                View Audit Logs
              </button>
              <button className="px-4 py-2 text-slate-300 hover:text-white text-sm font-semibold transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
