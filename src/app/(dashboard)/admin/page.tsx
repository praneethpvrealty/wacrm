'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Activity,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WhatsappConfig {
  account_id: string;
  phone_number_id: string | null;
  status: string;
  integration_type: string;
  owner_name: string;
  owner_email: string;
}

interface Organization {
  id: string;
  name: string;
  created_at: string;
  owner_name: string;
  owner_email: string;
}

export default function AdminDashboardPage() {
  const { user, profileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'organizations'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // DB Data State
  const [whatsappConfigs, setWhatsappConfigs] = useState<WhatsappConfig[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [metrics, setMetrics] = useState({ usersCount: 0, orgsCount: 0 });
  const [fallbackConfigAccountId, setFallbackConfigAccountId] = useState<string | null>(null);
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({
    selfRegistrationEnabled: true,
    sandboxTrialsEnabled: true,
  });

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await fetch('/api/admin/settings');
        if (!res.ok) {
          if (res.status === 403) {
            toast.error('Access Denied: Super Admin role required');
          } else {
            toast.error('Failed to load admin settings');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setWhatsappConfigs(data.whatsappConfigs || []);
        setOrganizations(data.organizations || []);
        setMetrics(data.metrics || { usersCount: 0, orgsCount: 0 });
        setFallbackConfigAccountId(data.settings?.fallback_whatsapp_account_id || null);
        if (data.settings?.feature_toggles) {
          setFeatureToggles(data.settings.feature_toggles);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin settings:', err);
        toast.error('Internal server error loading settings');
        setLoading(false);
      }
    }

    if (!profileLoading && user) {
      fetchAdminData();
    }
  }, [user, profileLoading]);

  async function handleSaveSettings() {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fallback_whatsapp_account_id: fallbackConfigAccountId,
          feature_toggles: featureToggles,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update settings');
      }

      toast.success('Admin settings successfully updated');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-400">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedFallback = whatsappConfigs.find((c) => c.account_id === fallbackConfigAccountId);

  return (
    <div className="space-y-6">
      {/* Admin Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Global Admin Control Center
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Manage system configurations, organizations, feature toggles, and dynamic fallbacks.
        </p>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-white bg-primary/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-primary text-white bg-primary/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Fallback & Settings
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'organizations'
              ? 'border-primary text-white bg-primary/5'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Organizations
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-400">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{metrics.usersCount}</div>
                <p className="text-xs text-slate-500 mt-1">Platform-wide registered profiles</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-400">Organizations</CardTitle>
                <Building className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{metrics.orgsCount}</div>
                <p className="text-xs text-slate-500 mt-1">Active business tenants</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-400">WhatsApp Senders</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-white">{whatsappConfigs.length}</div>
                <p className="text-xs text-slate-500 mt-1">Configured account credentials</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Fallback Status Alert */}
          {selectedFallback ? (
            <Alert className="bg-emerald-950/30 border-emerald-600/30 text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <AlertTitle className="text-emerald-400 font-bold">Active Fallback OTP Sender Configured</AlertTitle>
              <AlertDescription className="text-xs text-slate-400 mt-1">
                System OTP login codes will be sent from account:{' '}
                <strong className="text-slate-200">
                  {selectedFallback.owner_name} ({selectedFallback.owner_email})
                </strong>{' '}
                using method <strong className="text-slate-200">{selectedFallback.integration_type}</strong> (Phone ID:{' '}
                {selectedFallback.phone_number_id || 'N/A'}).
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-950/30 border-amber-600/30 text-slate-200">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-400 font-bold">No Explicit Fallback Sender Configured</AlertTitle>
              <AlertDescription className="text-xs text-slate-400 mt-1">
                The system is currently defaulting to the very first registered config row in the database. Go to the{' '}
                <button
                  onClick={() => setActiveTab('settings')}
                  className="underline text-primary font-semibold cursor-pointer"
                >
                  Fallback & Settings
                </button>{' '}
                tab to configure one explicitly.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white text-base">OTP Fallback Routing Configuration</CardTitle>
              <CardDescription className="text-slate-400">
                Choose which account&apos;s Meta credentials will send the system-wide login OTP verification codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Selected Sender Account</label>
                <select
                  value={fallbackConfigAccountId || ''}
                  onChange={(e) => setFallbackConfigAccountId(e.target.value || null)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="">-- No Fallback Config Selected (Use database default) --</option>
                  {whatsappConfigs.map((cfg) => (
                    <option key={cfg.account_id} value={cfg.account_id}>
                      {cfg.owner_name} ({cfg.owner_email}) - {cfg.integration_type.toUpperCase()} [ID:{' '}
                      {cfg.phone_number_id || 'N/A'}]
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-1.5 pt-1">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  Ensure the selected sender account has an approved Utility Template named{' '}
                  <code className="text-slate-300">whatsapp_otp</code> to deliver OTP codes to Indian (+91) recipients
                  without getting blocked by Meta.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white text-base">Global Feature Toggles</CardTitle>
              <CardDescription className="text-slate-400">
                Enable or disable specific modules and trials globally across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle Self-registration */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">Self Sign-up Registration</div>
                  <p className="text-xs text-slate-500">Allow new clients to create accounts on this CRM instance.</p>
                </div>
                <input
                  type="checkbox"
                  checked={featureToggles.selfRegistrationEnabled}
                  onChange={(e) =>
                    setFeatureToggles((prev) => ({ ...prev, selfRegistrationEnabled: e.target.checked }))
                  }
                  className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                />
              </div>

              {/* Toggle Sandbox mode */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white">Sandbox Mode Trials</div>
                  <p className="text-xs text-slate-500">Enable 7-day sandbox trials for new connections.</p>
                </div>
                <input
                  type="checkbox"
                  checked={featureToggles.sandboxTrialsEnabled}
                  onChange={(e) =>
                    setFeatureToggles((prev) => ({ ...prev, sandboxTrialsEnabled: e.target.checked }))
                  }
                  className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveSettings} disabled={saving} className="rounded-xl px-5">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Admin Settings
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardHeader>
            <CardTitle className="text-white text-base">Registered CRM Tenants</CardTitle>
            <CardDescription className="text-slate-400">
              Overview of all organizations and account groups created on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead className="bg-slate-950/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850">
                  <tr>
                    <th className="px-6 py-4">Organization Name</th>
                    <th className="px-6 py-4">Owner Name</th>
                    <th className="px-6 py-4">Owner Email</th>
                    <th className="px-6 py-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-950/20">
                      <td className="px-6 py-4 font-bold text-white">{org.name || 'Personal Account'}</td>
                      <td className="px-6 py-4">{org.owner_name}</td>
                      <td className="px-6 py-4 text-slate-400">{org.owner_email}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        No organizations found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
