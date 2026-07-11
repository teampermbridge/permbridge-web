import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { profiles } from '../api/endpoints';

export function ConverterPage() {
  const { data: profilesList = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => profiles.getAll().then((res) => res.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Profile 2 Permset Converter</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select a Profile to Convert
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : profilesList.length === 0 ? (
            <p className="text-gray-500">No profiles found. Check your Salesforce connection.</p>
          ) : (
            <div className="space-y-2">
              {profilesList.map((profile: any) => (
                <div
                  key={profile.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                >
                  <h3 className="font-medium text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Permissions: {profile.permissions_count}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feature Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Select a Profile from the list</li>
              <li>2. Review the AI-suggested permission groupings</li>
              <li>3. Edit groups and labels as needed</li>
              <li>4. Convert to Permission Sets in Salesforce</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">Benefits</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>✓ AI-powered logical grouping of permissions</li>
              <li>✓ Save conversion templates for reuse</li>
              <li>✓ Undo/redo for edits</li>
              <li>✓ Full audit trail of all conversions</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
