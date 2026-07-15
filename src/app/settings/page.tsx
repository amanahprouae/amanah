'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [newProName, setNewProName] = useState('');

  // Fetch PROs
  const { data: pros, isLoading } = useQuery({
    queryKey: ['all-pros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pros')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Add PRO Mutation
  const addProMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('pros')
        .insert([{ name }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pros'] });
      setNewProName('');
    },
  });

  // Remove PRO Mutation
  const removeProMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pros')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-pros'] });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-lg">
        {/* Page Header */}
        <div>
          <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">Portal Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure portal operations, alert parameters, email integrations, and system-wide default options.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-start">
          {/* Configurations Form */}
          <div className="bg-white p-lg rounded-2xl border border-border-subtle shadow-sm space-y-6">
            <h3 className="text-title-lg font-bold border-b border-border-subtle pb-3">General Settings</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1.5">Portal System Name</label>
                  <input
                    type="text"
                    defaultValue="UAE PRO Services Portal"
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg text-sm bg-bg-subtle focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1.5">System Alert Email</label>
                  <input
                    type="email"
                    defaultValue="alerts@proportal.ae"
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg text-sm bg-bg-subtle focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1.5">Notifications Grace Period (Days)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg text-sm bg-bg-subtle focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1.5">Support WhatsApp Number</label>
                  <input
                    type="text"
                    defaultValue="+971 50 000 0000"
                    className="w-full px-4 py-2 border border-border-subtle rounded-lg text-sm bg-bg-subtle focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="px-lg py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-colors cursor-pointer">
                  Save Configurations
                </button>
              </div>
            </div>
          </div>

          {/* Manage PROs Card */}
          <div className="bg-white p-lg rounded-2xl border border-border-subtle shadow-sm space-y-6">
            <h3 className="text-title-lg font-bold border-b border-border-subtle pb-3">Manage Assigned PROs</h3>
            
            <div className="space-y-4">
              {/* Add PRO Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newProName.trim()) return;
                  addProMutation.mutate(newProName.trim());
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Enter PRO Name (e.g. Sarah Jenkins)"
                  value={newProName}
                  onChange={(e) => setNewProName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg text-sm bg-bg-subtle focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addProMutation.isPending}
                  className="px-md py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:brightness-110 disabled:bg-primary/50 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Add PRO</span>
                </button>
              </form>

              {/* PROs List */}
              <div className="border border-border-subtle rounded-xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <p className="p-4 text-center text-sm text-on-surface-variant animate-pulse">Loading PROs...</p>
                ) : pros && pros.length > 0 ? (
                  <ul className="divide-y divide-border-subtle">
                    {pros.map((pro: any) => (
                      <li key={pro.id} className="flex justify-between items-center p-md hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                            {pro.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">{pro.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${pro.name}?`)) {
                              removeProMutation.mutate(pro.id);
                            }
                          }}
                          className="p-1 rounded-full text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          title="Remove PRO"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-md text-center text-sm text-on-surface-variant">No PROs configured in the system.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
