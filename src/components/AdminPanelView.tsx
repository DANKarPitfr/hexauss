import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Building, ShieldCheck, MessageSquare, AlertTriangle, Settings, Check, X, Clock } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Property } from '../constants';

export function AdminPanelView({ onClose }: { onClose: () => void }) {
    const [activeTab, setActiveTab] = useState('verification');
    const [pendingProperties, setPendingProperties] = useState<Property[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'properties'), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
            setPendingProperties(props);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = async (id: string) => {
        await updateDoc(doc(db, 'properties', id), { status: 'live' });
    };

    const handleReject = async (id: string) => {
        await deleteDoc(doc(db, 'properties', id));
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'properties', label: 'Properties', icon: Building },
        { id: 'verification', label: 'Verifications', icon: ShieldCheck },
        { id: 'reports', label: 'Reports', icon: AlertTriangle },
    ];

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-luxury-surface border-r border-luxury-border p-4 flex flex-col">
                <div className="text-luxury-citrus font-bold text-xl mb-8">HexaEstates Admin</div>
                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-luxury-citrus text-[#101010]' : 'text-luxury-cream hover:bg-luxury-bg'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <button onClick={onClose} className="text-luxury-text p-3">Close Admin</button>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold text-luxury-cream mb-6">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                
                {activeTab === 'verification' ? (
                    <div className="space-y-4">
                        {pendingProperties.length === 0 && <p className="text-luxury-text">No pending verifications.</p>}
                        {pendingProperties.map(p => (
                            <div key={p.id} className="bg-luxury-surface/50 p-6 rounded-2xl border border-luxury-border flex items-center justify-between">
                                <div>
                                    <h3 className="text-luxury-cream font-bold">{p.title}</h3>
                                    <p className="text-sm text-luxury-text">{p.location}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(p.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"><Check size={18} /></button>
                                    <button onClick={() => handleReject(p.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-luxury-surface/50 p-6 rounded-2xl border border-luxury-border">
                        <p className="text-luxury-text">Dashboard content for {activeTab} will be implemented here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
