import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users, CreditCard, UserCheck, Search, Download, RefreshCw,
  LogOut, Shield, Filter, ChevronUp, ChevronDown, Phone, Mail,
  Calendar, Package, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

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

interface Stats {
  total: number;
  paid: number;
  registered: number;
  form_started: number;
  checkout_started: number;
  checkout_expired: number;
  payment_failed: number;
  by_plan: Record<string, number>;
}

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

function exportCSV(members: Member[]) {
  const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'DOB', 'Age', 'Plan', 'Price', 'Status', 'Form Started At', 'Registered At', 'Paid At', 'Form Field', 'Page URL', 'IP Address', 'Stripe Session', 'Consent TOS', 'Consent Analytics', 'Consent Version', 'Consent Timestamp'];
  const rows = members.map((m) => [
    m.id, m.first_name, m.last_name, m.email, m.phone, m.dob,
    calcAge(m.dob) ?? '', PLAN_LABELS[m.plan] || m.plan,
    PLAN_PRICES[m.plan] || '', m.status,
    formatDate(m.form_started_at || null),
    formatDate(m.registered_at || null),
    formatDate(m.paid_at || null),
    m.form_field || '',
    m.page_url || '',
    m.ip_address || '',
    m.stripe_session_id || '',
    m.consent_tos ? 'Yes' : 'No',
    m.consent_analytics ? 'Yes' : 'No',
    m.consent_version || '',
    formatDate(m.consent_timestamp || null),
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

export function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [password, setPassword] = useState('');

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [sortField, setSortField] = useState<keyof Member>('registered_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchMembers = useCallback(async (pass: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ pass });
      if (filterStatus) params.set('status', filterStatus);
      if (filterPlan) params.set('plan', filterPlan);
      if (search) params.set('search', search);

      const res = await fetch(`/api/dashboard/members?${params}`);
      if (res.status === 401) {
        setAuthed(false);
        setError('Session expired. Please log in again.');
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMembers(data.members);
      setStats(data.stats);
    } catch (e: any) {
      setError(e.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPlan, search]);

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
        setStats(data.stats);
      }
    } catch {
      setPassError('Connection error. Try again.');
    }
  };

  useEffect(() => {
    if (authed && password) fetchMembers(password);
  }, [authed, password, filterStatus, filterPlan, fetchMembers]);

  const handleSort = (field: keyof Member) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...members].sort((a, b) => {
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: keyof Member }) =>
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline ml-1" /> : <ChevronDown className="h-3 w-3 inline ml-1" />
      : null;

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
          <p className="text-slate-500 text-sm font-medium text-center mb-8 italic">Member Analytics Dashboard</p>
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

  // ─── Dashboard ───
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
            <p className="text-blue-300 text-xs font-medium">Member Analytics Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMembers(password)}
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => exportCSV(members)}
            className="flex items-center gap-2 bg-[#23d9b0] text-[#050249] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#1ec8a0] transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => { setAuthed(false); setPassword(''); setMembers([]); setStats(null); }}
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Data Persistence Warning */}
      <div className="bg-red-50 border-b border-red-200 px-6 py-3">
        <div className="container mx-auto max-w-7xl flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs font-bold text-red-600">
            ⚠️ DATA ALERT: Members are stored in temporary memory. 
            <span className="hidden sm:inline"> On Vercel, data may be lost on redeploy. </span>
            <span className="font-black">Export CSV regularly</span> or configure Supabase for permanent storage.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-7xl">

        {/* Stats Cards */}
        {stats && (
          <>
            {/* Follow-up Alert Banner */}
            {(stats.registered > 0 || stats.checkout_started > 0 || stats.checkout_expired > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-700">
                    ⚠️ Follow-up needed: {stats.registered} registered unpaid, {stats.checkout_started} in checkout, {stats.checkout_expired} expired
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    These members completed registration but haven't paid. Consider reaching out to help them complete enrollment.
                  </p>
                </div>
                <button
                  onClick={() => setFilterStatus('registered')}
                  className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  View Unpaid
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
              {[
                { label: 'Total', value: stats.total, icon: Users, color: 'bg-blue-50 text-[#050249]' },
                { label: 'Paid', value: stats.paid, icon: CreditCard, color: 'bg-[#23d9b0]/10 text-[#23d9b0]' },
                { label: 'Registered', value: stats.registered, icon: UserCheck, color: 'bg-amber-50 text-amber-600' },
                { label: 'Form Started', value: stats.form_started, icon: Clock, color: 'bg-blue-50 text-blue-600' },
                { label: 'Checkout', value: stats.checkout_started, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
                { label: 'Expired', value: stats.checkout_expired, icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
                { label: 'Failed', value: stats.payment_failed, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
              ].map((s, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-md border border-slate-100"
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-black text-[#050249]">{s.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Plan Breakdown */}
        {stats?.by_plan && Object.keys(stats.by_plan).length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mb-8">
            <h3 className="font-black text-[#050249] uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> Enrollments by Plan
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.by_plan).map(([planId, count]) => (
                <div key={planId} className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-100">
                  <span className="font-black text-[#050249] text-sm">{PLAN_LABELS[planId] || planId}</span>
                  <span className="bg-[#050249] text-white text-xs font-black px-2 py-0.5 rounded-full">{count}</span>
                  <span className="text-slate-400 text-xs">{PLAN_PRICES[planId] || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMembers(password)}
              placeholder="Search name, email, phone..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#050249] outline-none text-sm font-medium"
            />
          </div>
          <select
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#050249] outline-none focus:ring-2 focus:ring-[#050249]"
          >
            <option value="">All Statuses</option>
            <option value="paid">✅ Paid</option>
            <option value="registered">📝 Registered (Unpaid)</option>
            <option value="checkout_started">💳 Checkout Started</option>
            <option value="checkout_expired">⏰ Checkout Expired</option>
            <option value="payment_failed">❌ Payment Failed</option>
            <option value="form_started">📋 Form Started</option>
          </select>
          <select
            value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#050249] outline-none focus:ring-2 focus:ring-[#050249]"
          >
            <option value="">All Plans</option>
            {Object.entries(PLAN_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => fetchMembers(password)}
            className="flex items-center gap-2 bg-[#050249] text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-2xl hover:bg-[#03013b] transition-colors"
          >
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

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
                    { label: 'DOB / Age', field: 'dob' as keyof Member },
                    { label: 'Plan', field: 'plan' as keyof Member },
                    { label: 'Status', field: 'status' as keyof Member },
                    { label: 'Consent', field: 'consent_tos' as keyof Member },
                    { label: 'Form Started', field: 'form_started_at' as keyof Member },
                    { label: 'Registered', field: 'registered_at' as keyof Member },
                    { label: 'Paid At', field: 'paid_at' as keyof Member },
                  ].map((col) => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-[#23d9b0] transition-colors whitespace-nowrap select-none"
                    >
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-16 text-slate-400 font-bold italic">Loading...</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16 text-slate-400 font-bold italic">No members found</td></tr>
                ) : sorted.map((m, i) => (
                  <tr key={m.id} className={`border-t border-slate-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-black text-[#050249] text-sm">{m.first_name} {m.last_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-[#050249] font-medium hover:text-[#23d9b0] transition-colors">
                        <Mail className="h-3 w-3 shrink-0 text-slate-400" />
                        {m.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                      {m.phone ? (
                        <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-[#23d9b0] transition-colors">
                          <Phone className="h-3 w-3 text-slate-400" /> {m.phone}
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDOB(m.dob)}
                      </div>
                      {calcAge(m.dob) !== null && (
                        <div className="text-[10px] text-slate-400 font-bold ml-4.5">Age {calcAge(m.dob)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-[#050249] text-xs">{PLAN_LABELS[m.plan] || m.plan}</div>
                      <div className="text-[10px] text-[#23d9b0] font-black">{PLAN_PRICES[m.plan] || ''}/mo</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[m.status] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {m.status === 'paid' ? <CreditCard className="h-2.5 w-2.5" /> : m.status === 'form_started' ? <Clock className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                        {STATUS_LABELS[m.status] || m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        m.consent_tos
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {m.consent_tos ? 'TOS' : 'No Consent'}
                      </span>
                      {m.consent_analytics && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200 ml-1">
                          Analytics
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">
                      {m.form_started_at ? (
                        <span className="text-blue-600 font-bold">{formatDate(m.form_started_at)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">{formatDate(m.registered_at)}</td>
                    <td className="px-4 py-3 text-slate-500 font-medium text-xs whitespace-nowrap">
                      {m.paid_at ? (
                        <span className="text-[#23d9b0] font-bold">{formatDate(m.paid_at)}</span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-400 font-bold flex items-center justify-between">
              <span>Showing {sorted.length} of {members.length} members</span>
              <button onClick={() => exportCSV(sorted)} className="flex items-center gap-1.5 text-[#050249] hover:text-[#23d9b0] transition-colors font-black uppercase tracking-widest">
                <Download className="h-3 w-3" /> Export filtered
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
