import React, { useEffect, useState } from 'react';
import { Bell, X, Check, MessageCircle, Home, Heart, ShieldCheck, DollarSign } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, writeBatch, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface NotificationProps {
    onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationProps) {
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [auth.currentUser]);

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        notifications.filter(n => !n.read).forEach(n => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
        });
        await batch.commit();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageCircle size={16} className="text-luxury-citrus" />;
            case 'saved': return <Heart size={16} className="text-pink-500" />;
            case 'property': return <Home size={16} className="text-blue-500" />;
            case 'security': return <ShieldCheck size={16} className="text-red-500" />;
            default: return <Bell size={16} className="text-luxury-text" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-md z-50 flex justify-end">
            <div className="w-full max-w-md bg-luxury-bg border-l border-luxury-border h-full flex flex-col shadow-2xl">
                <div className="p-4 border-b border-luxury-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-luxury-cream">Notifications ({notifications.filter(n => !n.read).length})</h2>
                    <div className="flex gap-2">
                        <button onClick={markAllAsRead} className="text-xs text-luxury-citrus hover:underline">Mark all read</button>
                        <button onClick={onClose}><X className="text-luxury-text" /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-luxury-text/50">
                            <Bell size={48} className="mb-4 opacity-50" />
                            <p>No new activity yet</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-luxury-border flex gap-3 ${n.read ? 'bg-transparent' : 'bg-luxury-surface/30'}`}>
                                <div className="mt-1">{getIcon(n.type)}</div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-luxury-cream">{n.title}</h4>
                                    <p className="text-xs text-luxury-text">{n.body}</p>
                                    <span className="text-[10px] text-luxury-text/50">{n.createdAt?.toDate().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
