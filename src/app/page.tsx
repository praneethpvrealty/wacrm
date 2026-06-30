import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/automations/admin-client';
import { ShowcaseView } from '@/components/showcase/showcase-view';
import { MarketingLanding } from '@/components/landing/marketing-landing';
import type { Property } from '@/types';
import { BRANDING } from '@/config/branding';

export const metadata: Metadata = {
  title: `${BRANDING.name} — AI-Powered WhatsApp CRM & Property Portals`,
  description:
    'ConvoReal is a premium WhatsApp-first CRM for real estate agents and agencies. Auto-capture leads, manage inventories, match properties, and run campaigns.',
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * ISR: Regenerate showcase pages every 1 hour (3600s) in the background.
 * Property listings change infrequently (price edits, new listings), so
 * 1 hour is a safe balance between freshness and performance.
 * The edge cache (s-maxage=3600) serves stale content instantly
 * while fresh data is fetched asynchronously.
 */
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    account_id?: string;
    ref?: string;
    agent_id?: string;
    property_id?: string;
    category?: string;
    code?: string;
    invite?: string;
  }>;
}

// ── Parallel data fetchers ───────────────────────────────────────

async function resolveAccountFromSubdomain(admin: ReturnType<typeof supabaseAdmin>, subdomain: string | null) {
  if (!subdomain) return null;
  const { data } = await admin
    .from('showcase_settings')
    .select('account_id')
    .eq('subdomain', subdomain)
    .maybeSingle();
  return data?.account_id || null;
}

async function resolvePropertyById(
  admin: ReturnType<typeof supabaseAdmin>,
  propertyId: string,
  scopedAccountId: string | null,
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId);
  let query = admin.from('properties').select('*');
  if (isUuid) query = query.eq('id', propertyId);
  else query = query.eq('property_code', propertyId.toUpperCase());
  if (scopedAccountId) query = query.eq('account_id', scopedAccountId);
  const { data } = await query.maybeSingle();
  return data as Property | null;
}

async function resolveRefInParallel(admin: ReturnType<typeof supabaseAdmin>, ref: string) {
  const [accountResult, contactResult, profileResult] = await Promise.all([
    admin.from('accounts').select('id').eq('id', ref).maybeSingle(),
    admin.from('contacts').select('account_id, id').eq('id', ref).maybeSingle(),
    admin.from('profiles').select('account_id, user_id').eq('user_id', ref).maybeSingle(),
  ]);

  if (accountResult.data) {
    return { type: 'account' as const, accountId: accountResult.data.id, filterContactId: null, filterUserId: null };
  }
  if (contactResult.data) {
    return {
      type: 'contact' as const,
      accountId: contactResult.data.account_id,
      filterContactId: contactResult.data.id,
      filterUserId: null,
    };
  }
  if (profileResult.data) {
    return {
      type: 'profile' as const,
      accountId: profileResult.data.account_id,
      filterContactId: null,
      filterUserId: profileResult.data.user_id,
    };
  }
  return null;
}

async function fetchFallbackAccount(admin: ReturnType<typeof supabaseAdmin>) {
  const { data } = await admin.from('accounts').select('id').limit(1).maybeSingle();
  return data?.id || null;
}

// Server Component: fetches public listings & configuration details
export default async function RootPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  if (resolvedParams.code) {
    const inviteParam = resolvedParams.invite
      ? `&invite=${encodeURIComponent(resolvedParams.invite)}`
      : '';
    redirect(`/auth/callback?code=${encodeURIComponent(resolvedParams.code)}${inviteParam}`);
  }

  const admin = supabaseAdmin();
  const reqHeaders = await headers();
  const host = reqHeaders.get('host') || '';

  // Resolve subdomain from hostname
  let subdomain: string | null = null;
  const domainParts = host.split('.');
  if (
    (domainParts.length >= 3 && !host.includes('localhost')) ||
    (host.includes('localhost') && domainParts.length >= 2 && !host.startsWith('localhost'))
  ) {
    const possibleSubdomain = domainParts[0].toLowerCase();
    const systemSubdomains = ['www', 'app', 'admin', 'api'];
    if (!systemSubdomains.includes(possibleSubdomain)) {
      subdomain = possibleSubdomain;
    }
  }

  let accountId: string | null = process.env.NEXT_PUBLIC_DEFAULT_ACCOUNT_ID || null;
  const ref = resolvedParams.ref || resolvedParams.account_id || resolvedParams.agent_id;
  const initialPropertyId = resolvedParams.property_id;

  // If there is no subdomain and no showcase query parameters, serve the product landing page
  if (!subdomain && !ref && !initialPropertyId) {
    return <MarketingLanding />;
  }

  // ── Phase 1: Resolve accountId in parallel ─────────────────────
  // Property lookup + subdomain lookup + ref resolution all fire at once.
  const [subdomainAccount, targetProperty] = await Promise.all([
    resolveAccountFromSubdomain(admin, subdomain),
    initialPropertyId ? resolvePropertyById(admin, initialPropertyId, accountId) : Promise.resolve(null),
  ]);

  if (subdomainAccount) accountId = subdomainAccount;
  if (targetProperty) accountId = targetProperty.account_id;

  let filterContactId: string | null = null;
  let filterUserId: string | null = null;

  if (ref) {
    const resolved = await resolveRefInParallel(admin, ref);
    if (resolved) {
      if (!accountId) accountId = resolved.accountId;
      if (accountId === resolved.accountId) {
        filterContactId = resolved.filterContactId;
        filterUserId = resolved.filterUserId;
      }
    }
  }

  // Fallback to default account
  if (!accountId) {
    accountId = await fetchFallbackAccount(admin);
  }

  if (!accountId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-xl font-bold">Showcase Setup Pending</h2>
          <p className="text-sm text-slate-400">
            Please log in to the admin dashboard and configure your account settings.
          </p>
          <a
            href="/login"
            className="inline-block bg-primary text-primary-foreground font-bold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover"
          >
            Go to Login Portal
          </a>
        </div>
      </div>
    );
  }

  // ── Phase 2: Fetch all showcase data in parallel ───────────────
  const [
    settingsResult,
    propertiesResult,
    agentsResult,
    profilesResult,
  ] = await Promise.all([
    admin.from('showcase_settings').select('*').eq('account_id', accountId).maybeSingle(),
    admin
      .from('properties')
      .select('*')
      .eq('account_id', accountId)
      .eq('is_published', true)
      .eq('status', 'Available')
      .order('created_at', { ascending: false }),
    admin
      .from('contacts')
      .select('id, name, phone, email')
      .eq('account_id', accountId)
      .eq('classification', 'Agent'),
    admin.from('profiles').select('user_id, full_name, email, avatar_url').eq('account_id', accountId),
  ]);

  const settings = settingsResult.data;
  let publishedProperties = propertiesResult.data || [];
  const agentContacts = agentsResult.data || [];
  const profiles = profilesResult.data || [];

  // Apply referrer filter client-side instead of in the query
  // (already fetched all properties, just filter the array)
  if (filterContactId) {
    publishedProperties = publishedProperties.filter((p) => p.owner_contact_id === filterContactId);
  } else if (filterUserId) {
    publishedProperties = publishedProperties.filter((p) => p.user_id === filterUserId);
  }

  // Merge targeted property if not in list
  const propertiesList = [...publishedProperties];
  if (targetProperty) {
    const exists = propertiesList.some((p) => p.id === targetProperty.id);
    if (!exists) {
      propertiesList.unshift(targetProperty);
    }
  }

  // ── Phase 3: Resolve referrer phone ──
  let referrerPhone: string | null = null;

  if (filterContactId) {
    const { data: contact } = await admin
      .from('contacts')
      .select('phone')
      .eq('id', filterContactId)
      .maybeSingle();
    if (contact) referrerPhone = contact.phone;
  } else if (filterUserId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('user_id', filterUserId)
      .maybeSingle();
    if (profile?.email) {
      const { data: contact } = await admin
        .from('contacts')
        .select('phone, id')
        .eq('account_id', accountId)
        .eq('email', profile.email)
        .maybeSingle();
      if (contact) {
        referrerPhone = contact.phone;
        filterContactId = contact.id;
      }
    }
  } else if (targetProperty?.user_id) {
    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('user_id', targetProperty.user_id)
      .maybeSingle();
    if (profile?.email) {
      const { data: contact } = await admin
        .from('contacts')
        .select('phone, id')
        .eq('account_id', accountId)
        .eq('email', profile.email)
        .maybeSingle();
      if (contact) {
        referrerPhone = contact.phone;
        filterContactId = contact.id;
      }
    }
  }

  // Build agent mapping
  const userIdToAgentMap: Record<
    string,
    { id: string; name: string; phone: string; email?: string | null; avatar_url?: string | null }
  > = {};

  profiles.forEach((p) => {
    const matchingContact = agentContacts.find(
      (c) => c.email && c.email.toLowerCase() === p.email.toLowerCase(),
    );
    if (matchingContact) {
      userIdToAgentMap[p.user_id] = {
        id: matchingContact.id,
        name: p.full_name || matchingContact.name,
        phone: matchingContact.phone,
        email: matchingContact.email,
        avatar_url: p.avatar_url,
      };
    }
  });

  // Attach agent details, strip documents
  const propertiesWithAgent = propertiesList.map((prop) => {
    const agent = prop.user_id ? userIdToAgentMap[prop.user_id] : null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { documents: _documents, ...publicProp } = prop;
    return {
      ...publicProp,
      agent_details: agent || null,
    };
  });

  // Render
  return (
    <ShowcaseView
      properties={propertiesWithAgent}
      settings={settings}
      accountId={accountId}
      referrerContactId={filterContactId || undefined}
      referrerPhone={referrerPhone || undefined}
      initialPropertyId={initialPropertyId}
      initialCategory={resolvedParams.category}
    />
  );
}
