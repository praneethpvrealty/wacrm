'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins, Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function OtherSettingsPanel() {
  const supabase = createClient();
  const { accountId, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [hasSettings, setHasSettings] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('showcase_settings')
          .select('currency')
          .eq('account_id', accountId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching currency settings:', error);
          toast.error('Failed to load currency settings');
          return;
        }

        if (data) {
          setCurrency(data.currency || 'INR');
          setHasSettings(true);
        }
      } catch (err) {
        console.error('Unexpected error loading currency settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [accountId, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    setSaving(true);
    try {
      if (hasSettings) {
        // Update
        const { error } = await supabase
          .from('showcase_settings')
          .update({
            currency,
            updated_at: new Date().toISOString(),
          })
          .eq('account_id', accountId);

        if (error) throw error;
      } else {
        // Insert a new showcase settings row with default details + currency
        const { error } = await supabase
          .from('showcase_settings')
          .insert([{
            account_id: accountId,
            website_name: 'Aryavarta Ventures',
            website_url: 'https://www.aryavartaventures.com',
            contact_phone: '',
            whatsapp_message_template: 'Hi! I am interested in your property "{title}" in {location}. Please share details.',
            currency,
          }]);

        if (error) throw error;
        setHasSettings(true);
      }

      toast.success('Currency settings saved successfully');
    } catch (err) {
      console.error('Error saving currency settings:', err);
      toast.error('Failed to save currency settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="size-5 text-primary" />
          General & Currency Settings
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure general preferences and default currency symbols used across properties, flyers, shared layouts, and dashboards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="currency" className="text-slate-350 font-medium">
              System Default Currency
            </Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="INR">INR (₹) - Rupees</option>
              <option value="USD">USD ($) - Dollars</option>
              <option value="EUR">EUR (€) - Euros</option>
              <option value="GBP">GBP (£) - Pounds</option>
              <option value="AED">AED (د.إ) - Dirhams</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Primary currency code. Indian Rupees use dynamic Lakhs/Crores representations automatically.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary-hover flex items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
