import { query } from '../src/db.js';

async function clearAllData() {
  try {
    console.log('🗑️  CLEARING ALL DATA...');

    // Delete in order of dependencies
    await query('DELETE FROM sync_jobs');
    console.log('✓ Cleared sync_jobs');

    await query('DELETE FROM field_permissions');
    console.log('✓ Cleared field_permissions');

    await query('DELETE FROM object_permissions');
    console.log('✓ Cleared object_permissions');

    await query('DELETE FROM salesforce_users');
    console.log('✓ Cleared salesforce_users');

    await query('DELETE FROM permission_sets');
    console.log('✓ Cleared permission_sets');

    await query('DELETE FROM profiles');
    console.log('✓ Cleared profiles');

    await query('DELETE FROM salesforce_connections');
    console.log('✓ Cleared salesforce_connections');

    await query('DELETE FROM organization_members');
    console.log('✓ Cleared organization_members');

    await query('DELETE FROM organizations');
    console.log('✓ Cleared organizations');

    await query('DELETE FROM user_settings');
    console.log('✓ Cleared user_settings');

    await query('DELETE FROM users');
    console.log('✓ Cleared users');

    console.log('\n✅ ALL DATA CLEARED! Ready for fresh start.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearAllData();
