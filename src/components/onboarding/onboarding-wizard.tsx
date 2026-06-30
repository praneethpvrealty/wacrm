'use client';

import { useState } from 'react';
import {
  MessageCircle,
  Building2,
  Users,
  Check,
  ChevronRight,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { OnboardingStatus } from '@/hooks/useOnboarding';

interface Props {
  status: OnboardingStatus;
  onDismiss: () => void;
  onRefresh: () => Promise<void>;
}

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Independent House',
  'Plot / Land',
  'Commercial Office',
  'Commercial Shop',
  'Warehouse / Industrial',
  'Farm House',
  'PG / Hostel',
  'Others',
];

// ── Step components ──────────────────────────────────────────────────────────

function StepWhatsApp({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
        <MessageCircle className="h-8 w-8 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Connect WhatsApp</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          ConvoReal works through your WhatsApp Business number. Connect it now to start receiving
          and managing leads in your inbox.
        </p>
      </div>

      <div className="w-full bg-slate-800/60 rounded-xl border border-slate-700 p-4 text-left space-y-3">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">What you&apos;ll need</p>
        {[
          'A WhatsApp Business account',
          'Your Phone Number ID from Meta Business',
          'A permanent access token',
        ].map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <ChevronRight className="h-2.5 w-2.5 text-primary" />
            </div>
            {item}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button
          className="w-full gap-2"
          onClick={() => {
            window.open('/settings?tab=whatsapp', '_blank');
          }}
        >
          Open WhatsApp Settings <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-300"
          onClick={onDone}
        >
          I&apos;ll set it up later
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        After connecting, click &quot;Mark as done&quot; or refresh this page to continue.
      </p>
    </div>
  );
}

function StepProperty({ onDone }: { onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !type || !location || !price) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          location: location.trim(),
          price: Number(price),
          status: 'available',
          listing_type: 'sale',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save property');
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Add your first property</h2>
        <p className="text-sm text-slate-400">
          Add a property you&apos;re currently selling or renting out. You can add more later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Property title</Label>
          <Input
            placeholder="e.g. 3BHK Apartment in Whitefield"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Property type</Label>
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger className="bg-slate-800/60 border-slate-700 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Location / Area</Label>
          <Input
            placeholder="e.g. Koramangala, Bengaluru"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Price (₹)</Label>
          <Input
            type="number"
            placeholder="e.g. 8500000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Save property & continue'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-300"
            onClick={onDone}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
}

function StepContact({ onDone }: { onDone: () => void }) {
  const { profile } = useAuth();  // needed for account_id when inserting
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: dbError } = await supabase.from('contacts').insert({
        phone: phone.trim(),
        name: name.trim() || null,
        account_id: profile?.account_id,
      });
      if (dbError) throw new Error(dbError.message);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/15 flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Add your first lead</h2>
        <p className="text-sm text-slate-400">
          Add a buyer or tenant you&apos;re currently working with. Every lead you add becomes
          part of your CRM.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Phone number <span className="text-red-400">*</span></Label>
          <Input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-sm">Name (optional)</Label>
          <Input
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving…' : 'Add lead & finish setup'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-300"
            onClick={onDone}
          >
            Skip for now
          </Button>
        </div>
      </form>
    </div>
  );
}

function AllDone({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Sparkles className="h-10 w-10 text-emerald-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set! 🎉</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          ConvoReal is ready to go. Your WhatsApp leads will flow straight into your inbox,
          and your properties are ready to share.
        </p>
      </div>
      <Button onClick={onClose} className="w-full gap-2">
        Go to Dashboard <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

interface StepDef {
  id: string;
  label: string;
  done: boolean;
  icon: typeof MessageCircle;
  color: string;
}

function StepIndicator({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step.done
                ? 'bg-emerald-500/20 text-emerald-400'
                : i === current
                ? 'bg-primary/20 text-primary'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {step.done ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[9px]">
                {i + 1}
              </span>
            )}
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-4 ${i < current || step.done ? 'bg-primary/40' : 'bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

export function OnboardingWizard({ status, onDismiss, onRefresh }: Props) {
  // Derive initial step from what's already done
  function firstIncompleteStep() {
    if (!status.hasWhatsApp) return 0;
    if (!status.hasProperties) return 1;
    if (!status.hasContacts) return 2;
    return 3; // all done
  }

  const [step, setStep] = useState(firstIncompleteStep);
  const [localDone, setLocalDone] = useState({
    whatsapp: status.hasWhatsApp,
    properties: status.hasProperties,
    contacts: status.hasContacts,
  });

  const allDone = localDone.whatsapp && localDone.properties && localDone.contacts;

  const steps: StepDef[] = [
    { id: 'whatsapp', label: 'Connect WhatsApp', done: localDone.whatsapp, icon: MessageCircle, color: 'emerald' },
    { id: 'property', label: 'Add property', done: localDone.properties, icon: Building2, color: 'blue' },
    { id: 'contact', label: 'Add lead', done: localDone.contacts, icon: Users, color: 'violet' },
  ];

  async function advanceStep(doneKey: keyof typeof localDone) {
    const updated = { ...localDone, [doneKey]: true };
    setLocalDone(updated);
    await onRefresh();
    // Move to next incomplete step
    if (!updated.whatsapp) { setStep(0); return; }
    if (!updated.properties) { setStep(1); return; }
    if (!updated.contacts) { setStep(2); return; }
    setStep(3); // all done
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#0d1424] border border-slate-700/60 rounded-2xl shadow-2xl p-8">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Skip setup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        {!allDone && (
          <div className="mb-6">
            <div className="text-xs text-slate-500 mb-1">Getting started</div>
            <h1 className="text-lg font-bold text-white">Set up your ConvoReal workspace</h1>
          </div>
        )}

        {/* Step indicator */}
        {!allDone && <StepIndicator steps={steps} current={step} />}

        {/* Step content */}
        {allDone || step === 3 ? (
          <AllDone onClose={onDismiss} />
        ) : step === 0 ? (
          <StepWhatsApp onDone={() => advanceStep('whatsapp')} />
        ) : step === 1 ? (
          <StepProperty onDone={() => advanceStep('properties')} />
        ) : (
          <StepContact onDone={() => advanceStep('contacts')} />
        )}

        {/* Step navigation dots */}
        {!allDone && step < 3 && (
          <div className="flex justify-center gap-1.5 mt-8">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === step ? 'bg-primary w-4' : s.done ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
