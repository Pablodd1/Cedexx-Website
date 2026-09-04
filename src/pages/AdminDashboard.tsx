import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users, CreditCard, UserCheck, Search, Download, RefreshCw,
  LogOut, Shield, Filter, ChevronUp, ChevronDown, Phone, Mail,
  Calendar, Package, Clock, CheckCircle2, AlertCircle, PhoneCall,
  Voicemail, BarChart3, Eye, Globe, Monitor, Smartphone, TrendingUp
} from 'lucide-react';

// ─── Types ───
interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  plan: string;
  status: 'registered' | 'paid' | 'form_started' | 'checkout_started' | 'checkout_expired' | 'payment_failed';
  registered_at: string | null;
  paid_at: string | null;
  form_started_at?: string | null;
  checkout_started_at?: string | null;
  checkout_expired_at?: string | null;
  payment_failed_at?: string | null;
  form_field?: string;
  page_url?: string;
  ip_address?: string;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  consent_tos?: boolean;
  consent_analytics?: boolean;
  consent_version?: string;
  consent_timestamp?: string;
}

interface Call {
  callSid: string;
  from: string;
  type: string;
  direction?: string;
  status?: string;
  duration?: string;
  recordingUrl?: string;
  transcription?: string;
  transcriptionConfidence?: number;
  intent?: string;
  loggedAt: string;
  timestamp?: string;
}

interface AnalyticsStats {
  activeNow: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  sessions: number;
  sessionsToday: number;
}

interface Visit {
  id: string;
  page: string;
  referrer: string;
  device: string;
  browser: string;
  os: string;
  country?: string;
  timestamp: string;
  duration?: number;
}

type Tab = 'members' | 'calls' | 'analytics';

// ─── Constants ───
const PLAN_LABELS: Record<string, string> = {
  'carenow': 'CareNow™',
  'carenow-mental': 'CareNow + Mental',
  'mental-wellness': 'Mental Wellness',
  'carecomplete': 'CareComplete™',
  'carecomplete-family': 'CareComplete™ Family',
};

const PLAN_PRICES: Record<string, string> = {
  'carenow': '$18.99',
  'carenow-mental': '$26.99',
  'mental-wellness': '$18.99',
  'carecomplete': '$34.99',
  'carecomplete-family': '$52.99',
};

const STATUS_LABELS: Record<string, string> = {
  'paid': '✅ Paid',
  'registered': '📝 Registered (Unpaid)',
  'form_started': '📋 Form Started',
  'checkout_started': '💳 Checkout Started',
  'checkout_expired': '⏰ Checkout Expired',
  'payment_failed': '❌ Payment Failed',
};

const STATUS_STYLES: Record<string, string> = {
  'paid': 'bg-[#23d9b0]/10 text-[#23d9b0] border border-[#23d9b0]/30',
  'registered': 'bg-amber-50 text-amber-600 border border-amber-200',
  'form_started': 'bg-blue-50 text-blue-600 border border-blue-200',
  'checkout_started': 'bg-purple-50 text-purple-600 border border-purple-200',
  'checkout_expired': 'bg-orange-50 text-orange-600 border border-orange-200',
  'payment_failed': 'bg-red-50 text-red-600 border border-red-200',
};

// ─── Helpers ───
function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDOB(dob: string) {
  if (!dob) return '—';
  try {
    return new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dob; }
}

function calcAge(dob: string) {
  if (!dob) return null;
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return isNaN(age) ? null : age;
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function exportCSV(members: Member[]) {
  const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'DOB', 'Age', 'Plan', 'Price', 'Status', 'Form Started At', 'Registered At', 'Paid At'];
  const rows = members.map((m) => [
    m.id, m.first_name, m.last_name, m.email, m.phone, m.dob,
    calcAge(m.dob) ?? '', PLAN_LABELS[m.plan] || m.plan,
    PLAN_PRICES[m.plan] || '', m.status,
    formatDate(m.form_started_at || null),
    formatDate(m.registered_at || null),
    formatDate(m.paid_at || null),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cedexx-members-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───
export function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('members');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [memberStats, setMemberStats] = useState<any>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  // Calls state
  const [calls, setCalls] = useState<Call[]>([]);
  const [callStats, setCallStats] = useState<any>(null);
  const [callsLoading, setCallsLoading] = useState(false);

  // Analytics state
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [topPages, setTopPages] = useState<[string, number][]>([]);
  const [topReferrers, setTopReferrers] = useState<[string, number][]>([]);
  const [devices, setDevices] = useState<[string, number][]>([]);
  const [browsers, setBrowsers] = useState<[string, number][]>([]);
  const [osList, setOsList] = useState<[string, number][]>([]);
  const [byDay, setByDay] = useState<Record<string, number>>({});
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ─── Fetch Members ───
  const fetchMembers = useCallback(async (pass: string) => {
    setMembersLoading(true);
    try {
      const params = new URLSearchParams({ pass });
      if (filterStatus) params.set('status', filterStatus);
      if (filterPlan) params.set('plan', filterPlan);
      if (memberSearch) params.set('search', memberSearch);
      const res = await fetch(`/api/dashboard/members?${params}`);
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      if (data.success) { setMembers(data.members); setMemberStats(data.stats); }
    } catch { /* ignore */ } finally { setMembersLoading(false); }
  }, [filterStatus, filterPlan, memberSearch]);

  // ─── Fetch Calls ───
  const fetchCalls = useCallback(async (pass: string) => {
    setCallsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/calls?pass=${encodeURIComponent(pass)}`);
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      if (data.success) { setCalls(data.calls); setCallStats(data.stats); }
    } catch { /* ignore */ } finally { setCallsLoading(false); }
  }, []);

  // ─── Fetch Analytics ───
  const fetchAnalytics = useCallback(async (pass: string) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/analytics?pass=${encodeURIComponent(pass)}`);
      if (res.status === 401) { setAuthed(false); return; }
      const data = await res.json();
      if (data.success) {
        setAnalyticsStats(data.stats);
        setTopPages(data.topPages || []);
        setTopReferrers(data.topReferrers || []);
        setDevices(data.devices || []);
        setBrowsers(data.browsers || []);
        setOsList(data.os || []);
        setByDay(data.byDay || {});
        setRecentVisits(data.recent || []);
      }
    } catch { /* ignore */ } finally { setAnalyticsLoading(false); }
  }, []);

  // ─── Tab Switch Handler ───
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (authed && password) {
      if (tab === 'members') fetchMembers(password);
      if (tab === 'calls') fetchCalls(password);
      if (tab === 'analytics') fetchAnalytics(password);
    }
  };

  // ─── Login ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    try {
      const res = await fetch(`/api/dashboard/members?pass=${encodeURIComponent(passInput)}`);
      if (res.status === 401) { setPassError('Incorrect password'); return; }
      const data = await res.json();
      if (data.success) {
        setPassword(passInput);
        setAuthed(true);
        setMembers(data.members);
        setMemberStats(data.stats);
      }
    } catch {
      setPassError('Connection error. Try again.');
    }
  };

  // ─── Refresh current tab ───
  const handleRefresh = () => {
    if (!password) return;
    if (activeTab === 'members') fetchMembers(password);
    if (activeTab === 'calls') fetchCalls(password);
    if (activeTab === 'analytics') fetchAnalytics(password);
  };

  // ─── Login Screen ───
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050249] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-md"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[#050249] text-white mx-auto mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-[#050249] text-center uppercase italic tracking-tighter mb-2">
            CEDEXX Admin
          </h1>
          <p className="text-slate-500 text-sm font-medium text-center mb-8 italic">Command Center</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Enter dashboard password"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-blue-50 focus:ring-2 focus:ring-[#050249] outline-none font-medium text-sm"
              autoFocus
            />
            {passError && (
              <p className="text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {passError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-[#050249] text-white font-black py-4 rounded-2xl hover:bg-[#03013b] transition-all shadow-xl text-sm uppercase tracking-tighter italic"
            >
              Access Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Main Dashboard ───
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <div className="bg-[#050249] text-white px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#23d9b0] flex items-center justify-center">
            <Shield className="h-5 w-5 text-[#050249]" />
          </div>
          <div>
            <h1 className="font-black uppercase italic tracking-tighter text-lg leading-none">CEDEXX Admin</h1>
            <p className="text-blue-300 text-xs font-medium">Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${membersLoading || callsLoading || analyticsLoading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'members' && (
            <button
              onClick={() => exportCSV(members)}
              className="flex items-center gap-2 bg-[#23d9b0] text-[#050249] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#1ec8a0] transition-colors"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
          <button
            onClick={() => { setAuthed(false); setPassword(''); }}
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="container mx-auto max-w-7xl flex gap-1">
          {[
            { id: 'members' as Tab, label: 'Members', icon: Users },
            { id: 'calls' as Tab, label: 'Calls & Voicemails', icon: PhoneCall },
            { id: 'analytics' as Tab, label: 'Visitor Analytics', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#23d9b0] text-[#050249]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* ─── MEMBERS TAB ─── */}
        {activeTab === 'members' && (
          <MembersTab
            members={members}
            stats={memberStats}
            loading={membersLoading}
            search={memberSearch}
            setSearch={setMemberSearch}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPlan={filterPlan}
            setFilterPlan={setFilterPlan}
            onFilter={() => fetchMembers(password)}
          />
        )}

        {/* ─── CALLS TAB ─── */}
        {activeTab === 'calls' && (
          <CallsTab calls={calls} stats={callStats} loading={callsLoading} />
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            stats={analyticsStats}
            topPages={topPages}
            topReferrers={topReferrers}
            devices={devices}
            browsers={browsers}
            osList={osList}
            byDay={byDay}
            recentVisits={recentVisits}
            loading={analyticsLoading}
          />
        )}
      </div>
    </div>
  );
}

// ─── Members Tab Component ───
function MembersTab({ members, stats, loading, search, setSearch, filterStatus, setFilterStatus, filterPlan, setFilterPlan, onFilter }: any) {
  const [sortField, setSortField] = useState<keyof Member>('registered_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Member) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...members].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'bg-blue-50 text-[#050249]' },
            { label: 'Paid', value: stats.paid, icon: CreditCard, color: 'bg-[#23d9b0]/10 text-[#23d9b0]' },
            { label: 'Registered', value: stats.registered, icon: UserCheck, color: 'bg-amber-50 text-amber-600' },
            { label: 'Form Started', value: stats.form_started, icon: Clock, color: 'bg-blue-50 text-blue-600' },
            { label: 'Checkout', value: stats.checkout, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
            { label: 'Expired', value: stats.expired, icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
            { label: 'Failed', value: stats.failed, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <div className="text-xl font-black text-[#050249]">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && onFilter()}
            placeholder="Search name, email, phone..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#050249] outline-none text-sm font-medium" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#050249] outline-none">
          <option value="">All Statuses</option>
          <option value="paid">✅ Paid</option>
          <option value="registered">📝 Registered (Unpaid)</option>
          <option value="checkout_started">💳 Checkout Started</option>
          <option value="checkout_expired">⏰ Checkout Expired</option>
          <option value="payment_failed">❌ Payment Failed</option>
          <option value="form_started">📋 Form Started</option>
        </select>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#050249] outline-none">
          <option value="">All Plans</option>
          {Object.entries(PLAN_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <button onClick={onFilter}
          className="flex items-center gap-2 bg-[#050249] text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-[#03013b] transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#050249] text-white">
                {[
                  { label: 'Name', field: 'last_name' as keyof Member },
                  { label: 'Email', field: 'email' as keyof Member },
                  { label: 'Phone', field: 'phone' as keyof Member },
                  { label: 'Plan', field: 'plan' as keyof Member },
                  { label: 'Status', field: 'status' as keyof Member },
                  { label: 'Registered', field: 'registered_at' as keyof Member },
                  { label: 'Paid At', field: 'paid_at' as keyof Member },
                ].map((col) => (
                  <th key={col.field} onClick={() => handleSort(col.field)}
                    className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#23d9b0] transition-colors whitespace-nowrap select-none">
                    {col.label}
                    {sortField === col.field && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400 font-bold italic">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-slate-400 font-bold italic">No members found</td></tr>
              ) : sorted.map((m: Member, i: number) => (
                <tr key={m.id} className={`border-t border-slate-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-black text-[#050249] text-sm">{m.first_name} {m.last_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-[#050249] font-medium hover:text-[#23d9b0]">
                      <Mail className="h-3 w-3 shrink-0 text-slate-400" />{m.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                    {m.phone ? <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-[#23d9b0]"><Phone className="h-3 w-3 text-slate-400" /> {m.phone}</a> : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-[#050249] text-xs">{PLAN_LABELS[m.plan] || m.plan}</div>
                    <div className="text-[10px] text-[#23d9b0] font-black">{PLAN_PRICES[m.plan] || ''}/mo</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[m.status]}`}>
                      {STATUS_LABELS[m.status] || m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">{formatDate(m.registered_at)}</td>
                  <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">
                    {m.paid_at ? <span className="text-[#23d9b0] font-bold">{formatDate(m.paid_at)}</span> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Calls Tab Component ───
function CallsTab({ calls, stats, loading }: { calls: Call[]; stats: any; loading: boolean }) {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total Calls', value: stats.total, icon: PhoneCall, color: 'bg-blue-50 text-[#050249]' },
            { label: 'Voicemails', value: stats.voicemails, icon: Voicemail, color: 'bg-purple-50 text-purple-600' },
            { label: 'Inbound', value: stats.inbound, icon: Phone, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Last 24h', value: stats.last24h, icon: Clock, color: 'bg-amber-50 text-amber-600' },
            { label: 'Last 7d', value: stats.last7d, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
            { label: 'Avg Duration', value: stats.avgDuration ? `${stats.avgDuration}s` : '—', icon: Clock, color: 'bg-slate-50 text-slate-600' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <div className="text-xl font-black text-[#050249]">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Calls by Intent */}
      {stats?.byIntent && Object.keys(stats.byIntent).length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-6">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4">Call Intents</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byIntent).sort((a: any, b: any) => b[1] - a[1]).map(([intent, count]: [string, any]) => (
              <div key={intent} className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
                <span className="font-black text-[#050249] text-sm capitalize">{intent}</span>
                <span className="bg-[#050249] text-white text-xs font-black px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calls Table */}
      <div className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#050249] text-white">
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">Type</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">From</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">Intent</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">Duration</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">When</th>
                <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 font-bold italic">Loading calls...</td></tr>
              ) : calls.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 font-bold italic">No calls yet. Calls will appear here when people start calling (754) 432-2201.</td></tr>
              ) : calls.map((call, i) => (
                <React.Fragment key={call.callSid || i}>
                  <tr className={`border-t border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    onClick={() => setExpandedCall(expandedCall === call.callSid ? null : call.callSid || null)}>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        call.type === 'voicemail' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}>
                        {call.type === 'voicemail' ? <Voicemail className="h-2.5 w-2.5" /> : <Phone className="h-2.5 w-2.5" />}
                        {call.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-[#050249]">{call.from || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-600 font-medium text-xs">{call.intent || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{call.duration ? `${call.duration}s` : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(call.loggedAt || call.timestamp || null)}</td>
                    <td className="px-4 py-3">
                      {call.recordingUrl && (
                        <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-[#050249] text-white px-3 py-1.5 rounded-lg hover:bg-[#03013b] transition-colors"
                          onClick={e => e.stopPropagation()}>
                          <PhoneCall className="h-3 w-3" /> Listen
                        </a>
                      )}
                    </td>
                  </tr>
                  {expandedCall === call.callSid && call.transcription && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="bg-white rounded-2xl p-4 border border-slate-200">
                          <h4 className="font-black text-[#050249] text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Voicemail className="h-4 w-4 text-purple-600" /> Transcription
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">{call.transcription}</p>
                          {call.transcriptionConfidence && (
                            <p className="text-[10px] text-slate-400 mt-2 font-bold">
                              Confidence: {Math.round(call.transcriptionConfidence * 100)}%
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Analytics Tab Component ───
function AnalyticsTab({ stats, topPages, topReferrers, devices, browsers, osList, byDay, recentVisits, loading }: any) {
  const dayLabels = Object.keys(byDay).sort();
  const maxDayCount = dayLabels.length > 0 ? Math.max(...Object.values(byDay) as number[]) : 0;

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Active Now', value: stats.activeNow, icon: Eye, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Today', value: stats.today, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
            { label: 'This Week', value: stats.thisWeek, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
            { label: 'This Month', value: stats.thisMonth, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
            { label: 'Total', value: stats.total, icon: Globe, color: 'bg-slate-50 text-slate-600' },
            { label: 'Sessions', value: stats.sessionsToday, icon: Users, color: 'bg-[#23d9b0]/10 text-[#23d9b0]' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}><s.icon className="h-4 w-4" /></div>
              <div className="text-xl font-black text-[#050249]">{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Pages */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Top Pages
          </h3>
          {topPages.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No data yet. Visitors will appear here once they start browsing.</p>
          ) : (
            <div className="space-y-2">
              {topPages.map(([page, count]: [string, number], i: number) => {
                const max = topPages[0][1];
                const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                return (
                  <div key={page} className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-[#050249] flex-1 truncate">{page}</span>
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#23d9b0] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Top Referrers
          </h3>
          {topReferrers.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No referrer data yet.</p>
          ) : (
            <div className="space-y-2">
              {topReferrers.map(([ref, count]: [string, number], i: number) => {
                const max = topReferrers[0][1];
                const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                return (
                  <div key={ref} className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-[#050249] flex-1 truncate">{ref === 'direct' ? 'Direct / Bookmark' : ref}</span>
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#050249] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-600 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Devices
          </h3>
          <div className="space-y-2">
            {devices.length === 0 ? <p className="text-slate-400 text-sm italic">No data</p> : devices.map(([name, count]: [string, number]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Browsers
          </h3>
          <div className="space-y-2">
            {browsers.length === 0 ? <p className="text-slate-400 text-sm italic">No data</p> : browsers.map(([name, count]: [string, number]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OS */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> Operating Systems
          </h3>
          <div className="space-y-2">
            {osList.length === 0 ? <p className="text-slate-400 text-sm italic">No data</p> : osList.map(([name, count]: [string, number]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic by Day (Last 30 days) */}
      {dayLabels.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-6">
          <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Daily Traffic (Last 30 Days)
          </h3>
          <div className="flex items-end gap-1 h-32">
            {dayLabels.map((date) => {
              const count = byDay[date] || 0;
              const height = maxDayCount > 0 ? Math.max((count / maxDayCount) * 100, 5) : 5;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full bg-[#23d9b0]/20 rounded-t hover:bg-[#23d9b0]/40 transition-colors relative" style={{ height: `${height}%` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#050249] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {count} visits
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 rotate-45 origin-left translate-y-2">{date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Visits */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
        <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4" /> Recent Visitors
        </h3>
        {recentVisits.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No visits recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest">Page</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest">Referrer</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest">Device</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest">Browser</th>
                  <th className="px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest">When</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((v: Visit) => (
                  <tr key={v.id} className="border-t border-slate-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 font-medium text-[#050249] text-xs">{v.page}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{v.referrer === 'direct' ? 'Direct' : v.referrer}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        v.device === 'Mobile' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {v.device === 'Mobile' ? <Smartphone className="h-2.5 w-2.5" /> : <Monitor className="h-2.5 w-2.5" />}
                        {v.device}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{v.browser} / {v.os}</td>
                    <td className="px-3 py-2 text-slate-400 text-xs whitespace-nowrap">{formatDate(v.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
