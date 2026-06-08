import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronLeft, Phone, Video, MoreVertical, Send, Mic, Image as ImageIcon, Smile, Check, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const MOCK_CHATS = [
  { id: '1', seller: 'Rajesh Kumar', lastMessage: 'Is this still available?', unread: 2, online: true, property: 'Luxury Apartment in Andheri West' },
  { id: '2', seller: 'Priya Sharma', lastMessage: 'Can you show it tomorrow?', unread: 0, online: false, property: 'Independent Villa in Whitefield' },
  { id: '3', seller: 'Amit Patel', lastMessage: 'Great location!', unread: 5, online: true, property: 'Cozy Studio in Koramangala' },
];

export default function CommunicationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-96 h-full sm:h-[600px] bg-luxury-bg border border-luxury-border sm:rounded-3xl shadow-2xl z-[200] flex flex-col overflow-hidden"
        >
          {view === 'list' ? (
            <ChatList onViewChat={(id) => { setActiveChatId(id); setView('chat'); }} onClose={onClose} />
          ) : (
            <ChatInterface chatId={activeChatId!} onClose={() => setView('list')} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

function ChatList({ onViewChat, onClose }: { onViewChat: (id: string) => void; onClose: () => void }) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', auth.currentUser.uid), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full bg-luxury-bg text-luxury-cream">
      <div className="p-4 border-b border-luxury-border flex justify-between items-center bg-luxury-surface">
        <h2 className="font-bold text-lg">Inbox</h2>
        <button onClick={onClose} className="p-2 text-luxury-text"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <button key={chat.id} onClick={() => onViewChat(chat.id)} className="w-full flex items-center gap-3 p-4 hover:bg-luxury-surface transition-colors border-b border-luxury-border/30">
            <div className="w-12 h-12 rounded-full bg-luxury-citrus flex items-center justify-center font-bold text-luxury-bg">C</div>
            <div className="flex-1 text-left">
              <div className="font-semibold">{chat.id}</div>
              <div className="text-xs text-luxury-text truncate">Conversation</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatInterface({ chatId, onClose }: { chatId: string; onClose: () => void }) {
    const chat = MOCK_CHATS.find(c => c.id === chatId)!;
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const q = query(collection(db, `conversations/${chatId}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [chatId]);

    const getSeparators = (messages: any[]) => {
      const grouped: { [key: string]: any[] } = {};
      messages.forEach(msg => {
        const date = msg.timestamp?.toDate().toDateString() || new Date().toDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(msg);
      });
      return grouped;
    };

    const groupedMessages = getSeparators(messages);

    const getLabel = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString();
    };

    const sendMessage = async () => {
        if (!input.trim() || !auth.currentUser) return;
        const msg = {
            text: input,
            senderId: auth.currentUser.uid,
            timestamp: serverTimestamp(),
            status: 'sent'
        };
        await addDoc(collection(db, `conversations/${chatId}/messages`), msg);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-luxury-bg">
            <div className="p-3 border-b border-luxury-border flex items-center gap-3 bg-luxury-surface">
                <button onClick={onClose} className="text-luxury-text"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-full bg-luxury-citrus flex items-center justify-center font-bold text-luxury-bg">{chatId[0].toUpperCase()}</div>
                <div className="flex-1">
                    <div className="font-semibold text-luxury-cream text-sm">{chatId}</div>
                    <div className="text-xs text-green-500">Online</div>
                </div>
                <button className="text-luxury-citrus"><Phone size={18} /></button>
                <button className="text-luxury-citrus"><Video size={18} /></button>
                <button className="text-luxury-text"><MoreVertical size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center text-xs text-luxury-text py-2">{getLabel(date)}</div>
                    {msgs.map(msg => (
                        <div key={msg.id} className={`flex ${msg.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'} my-3`}>
                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${msg.senderId === auth.currentUser?.uid ? 'bg-luxury-citrus text-[#121212] rounded-tr-none' : 'bg-luxury-surface text-luxury-cream rounded-tl-none'}`}>
                                {msg.text}
                                {msg.senderId === auth.currentUser?.uid && (
                                    <span className="ml-2 opacity-70">
                                        {msg.status === 'seen' ? <CheckCheck size={12} className="inline"/> : <Check size={12} className="inline"/>}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                  </div>
                ))}
            </div>
            <div className="p-3 border-t border-luxury-border flex items-center gap-2 bg-luxury-surface">
                <button className="text-luxury-citrus"><ImageIcon size={20}/></button>
                <button className="text-luxury-citrus"><Mic size={20}/></button>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-luxury-bg text-luxury-cream p-2 rounded-xl text-sm border border-luxury-border"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                    onClick={sendMessage}                
                    className="text-luxury-citrus"
                ><Send size={20} /></button>
            </div>
        </div>
    );
}
