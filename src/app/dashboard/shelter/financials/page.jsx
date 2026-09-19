'use client';

import { DollarSign, TrendingUp, AlertCircle, Plus, Pencil, X, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatK = (n) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return abs >= 1000 ? `${sign}Rs. ${(abs / 1000).toFixed(0)}K` : `${sign}Rs. ${abs}`;
};

export default function ShelterFinancialsPage() {
  const { user } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [categories, setCategories] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({ name: '', budget: '' });
  const [editForm, setEditForm] = useState({ name: '', budget: '', spent: '' });
  const [suggestion, setSuggestion] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    const { data: s } = await supabase.from('shelters').select('*').eq('owner_id', user.id).single();
    setShelter(s);
    if (!s) { setLoading(false); return; }

    const [{ data: cats }, { data: dons }, { data: exps }] = await Promise.all([
      supabase.from('shelter_budget_categories').select('*').eq('shelter_id', s.id).order('created_at'),
      supabase.from('donations').select('amount, created_at').eq('shelter_id', s.id),
      supabase.from('shelter_expenses').select('amount, created_at').eq('shelter_id', s.id),
    ]);

    setCategories(cats || []);
    setDonations(dons || []);
    setExpenses(exps || []);
    setLoading(false);
  };

  // Current month stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = donations.filter(d => new Date(d.created_at) >= startOfMonth).reduce((s, d) => s + (d.amount || 0), 0);
  const monthlyExpenses = expenses.filter(e => new Date(e.created_at) >= startOfMonth).reduce((s, e) => s + (e.amount || 0), 0);
  const deficit = monthlyIncome - monthlyExpenses;

  // Monthly trends (last 4 months)
  const trends = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const inc = donations.filter(x => new Date(x.created_at) >= d && new Date(x.created_at) < end).reduce((s, x) => s + (x.amount || 0), 0);
    const exp = expenses.filter(x => new Date(x.created_at) >= d && new Date(x.created_at) < end).reduce((s, x) => s + (x.amount || 0), 0);
    trends.push({ month: MONTHS[d.getMonth()], income: inc, expenses: exp });
  }
  const maxTrend = Math.max(...trends.flatMap(t => [t.income, t.expenses]), 1);

  // Add category
  const handleAdd = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('shelter_budget_categories').insert({
      shelter_id: shelter.id,
      name: addForm.name.trim(),
      budget: parseFloat(addForm.budget) || 0,
      spent: 0,
    }).select().single();
    if (data) setCategories([...categories, data]);
    setSaving(false);
    setShowAdd(false);
    setAddForm({ name: '', budget: '' });
  };

  // Edit category
  const openEdit = (cat) => {
    setEditCat(cat);
    setEditForm({ name: cat.name, budget: String(cat.budget || ''), spent: String(cat.spent || '') });
  };

  const handleEdit = async () => {
    if (!editCat) return;
    setSaving(true);
    const { data } = await supabase.from('shelter_budget_categories').update({
      name: editForm.name,
      budget: parseFloat(editForm.budget) || 0,
      spent: parseFloat(editForm.spent) || 0,
    }).eq('id', editCat.id).select().single();
    if (data) setCategories(categories.map(c => c.id === editCat.id ? data : c));
    setSaving(false);
    setEditCat(null);
  };

  // Submit suggestion (stored as notification or just dismissed)
  const handleSuggest = async () => {
    if (!suggestion.trim()) return;
    setSaving(true);
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Financial Suggestion',
      message: suggestion.trim(),
      type: 'system',
      is_read: false,
    });
    setSaving(false);
    setShowSuggest(false);
    setSuggestion('');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-sm text-vitality mt-0.5">Track expenses and set monthly goals</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSuggest(true)}
            className="bg-card border border-border hover:bg-muted text-foreground text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
            <Lightbulb size={15} /> Suggest
          </button>
          <button onClick={() => setShowAdd(true)}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 btn-press transition-expo">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-2xl bg-card shadow-card p-5">
          <DollarSign size={20} className="text-vitality mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatK(monthlyIncome)}</p>
          <p className="text-sm text-vitality mt-0.5">Monthly Income</p>
        </div>
        <div className="rounded-2xl bg-card shadow-card p-5">
          <TrendingUp size={20} className="text-emergency mb-2" />
          <p className="text-2xl font-bold text-foreground">{formatK(monthlyExpenses)}</p>
          <p className="text-sm text-emergency mt-0.5">Monthly Expenses</p>
        </div>
        <div className="rounded-2xl bg-card shadow-card p-5">
          <AlertCircle size={20} className={deficit >= 0 ? 'text-vitality' : 'text-emergency'} style={{ marginBottom: 8 }} />
          <p className={`text-2xl font-bold ${deficit >= 0 ? 'text-foreground' : 'text-emergency'}`}>{formatK(deficit)}</p>
          <p className={`text-sm mt-0.5 ${deficit >= 0 ? 'text-vitality' : 'text-emergency'}`}>{deficit >= 0 ? 'Surplus' : 'Deficit'}</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="rounded-2xl bg-card shadow-card mb-5">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Expense Breakdown</h3>
        </div>
        <div className="p-5 space-y-5">
          {categories.map((cat) => {
            const spent = cat.spent || 0;
            const budget = cat.budget || 1;
            const pct = Math.min((spent / budget) * 100, 100);
            const over = spent > budget;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatK(spent)} / {formatK(budget)}
                    </span>
                    <button onClick={() => openEdit(cat)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                      <Pencil size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="relative w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  {over ? (
                    <div className="absolute left-0 top-0 h-full rounded-full bg-emergency/40 btn-press transition-expo" style={{ width: '100%' }} />
                  ) : (
                    <>
                      <div className="absolute left-0 top-0 h-full rounded-full bg-amber" style={{ width: `${pct}%` }} />
                      <div className="absolute right-0 top-0 h-full rounded-full bg-vitality/60 btn-press transition-expo" style={{ width: `${100 - pct}%` }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No expense categories yet. Click "+ Add Expense" to create one.</p>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="rounded-2xl bg-card shadow-card">
        <div className="p-5 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Monthly Trends</h3>
        </div>
        <div className="p-5 space-y-5">
          {trends.map(({ month, income, expenses: exp }) => (
            <div key={month} className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground w-8 shrink-0">{month}</span>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-vitality font-medium w-14 shrink-0">Income</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-vitality btn-press transition-expo" style={{ width: `${Math.max((income / maxTrend) * 100, 2)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground w-14 text-right shrink-0">{formatK(income)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emergency font-medium w-14 shrink-0">Expenses</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-emergency/40 btn-press transition-expo" style={{ width: `${Math.max((exp / maxTrend) * 100, 2)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground w-14 text-right shrink-0">{formatK(exp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAdd && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowAdd(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-base font-bold text-foreground">Add Expense</h2>
                <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-muted rounded-full"><X size={18} className="text-foreground" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category Name</label>
                  <input type="text" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Transportation"
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/40 outline-none ring-2 ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Monthly Budget (Rs.)</label>
                  <input type="number" value={addForm.budget} onChange={e => setAddForm(f => ({ ...f, budget: e.target.value }))}
                    placeholder="e.g., 10000"
                    className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm btn-press transition-expo">
                    {saving ? 'Adding...' : 'Add Expense'}
                  </button>
                  <button onClick={() => setShowAdd(false)} className="flex-1 bg-card border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Expense Modal */}
      {editCat && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setEditCat(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-base font-bold text-foreground">Edit Expense</h2>
                <button onClick={() => setEditCat(null)} className="p-1 hover:bg-muted rounded-full"><X size={18} className="text-foreground" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/40 outline-none ring-2 ring-primary/20 text-sm text-foreground bg-card" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Budget (Rs.)</label>
                  <input type="number" value={editForm.budget} onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Spent (Rs.)</label>
                  <input type="number" value={editForm.spent} onChange={e => setEditForm(f => ({ ...f, spent: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleEdit} disabled={saving}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm btn-press transition-expo">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditCat(null)} className="flex-1 bg-card border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Suggest Improvement Modal */}
      {showSuggest && (
        <>
          <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setShowSuggest(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-sm shadow-elevated">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  <h2 className="text-base font-bold text-foreground">Suggest an Improvement</h2>
                </div>
                <button onClick={() => setShowSuggest(false)} className="p-1 hover:bg-muted rounded-full"><X size={18} className="text-foreground" /></button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">Have an idea to optimize shelter finances? Share it with the team.</p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Your Suggestion</label>
                  <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)} rows={4}
                    placeholder="e.g., Partner with local vet clinics for discounted care..."
                    className="w-full px-4 py-2.5 rounded-xl border border-primary/40 outline-none ring-2 ring-primary/20 text-sm text-foreground bg-card placeholder:text-muted-foreground resize-y" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSuggest} disabled={saving || !suggestion.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm btn-press transition-expo">
                    {saving ? 'Submitting...' : 'Submit Suggestion'}
                  </button>
                  <button onClick={() => setShowSuggest(false)} className="flex-1 bg-card border border-border hover:bg-muted text-foreground font-semibold py-2.5 rounded-xl text-sm transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
