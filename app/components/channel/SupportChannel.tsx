'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  PlusCircle,
  Filter,
  Search,
  User,
  Tag,
  MessageSquare,
  BarChart3
} from 'lucide-react';

// Tip tanımlamaları
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    avatar: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatar: string;
  };
  messages: TicketMessage[];
  tags: string[];
}

interface TicketMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    isAdmin: boolean;
  };
}

interface SupportChannelProps {
  channelId: string;
  channelName: string;
  topic?: string;
  isAdmin?: boolean;
}

// Örnek veriler
const SAMPLE_TICKETS: Ticket[] = Array(10).fill(null).map((_, index) => ({
  id: String(index + 1),
  title: `Destek Talebi #${index + 1}`,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  status: ['open', 'in_progress', 'closed'][Math.floor(Math.random() * 3)] as Ticket['status'],
  priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as Ticket['priority'],
  category: ['Teknik', 'Finansal', 'Genel'][Math.floor(Math.random() * 3)],
  createdAt: new Date(2025, 3, index + 1).toISOString(),
  updatedAt: new Date(2025, 3, index + 1).toISOString(),
  createdBy: {
    id: String(Math.floor(Math.random() * 100)),
    name: `Kullanıcı ${index + 1}`,
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100`
  },
  assignedTo: Math.random() > 0.5 ? {
    id: 'admin1',
    name: 'Destek Ekibi',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100`
  } : undefined,
  messages: Array(Math.floor(Math.random() * 5) + 1).fill(null).map((_, i) => ({
    id: `${index}-${i}`,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    createdAt: new Date(2025, 3, index + 1, i).toISOString(),
    sender: Math.random() > 0.5 ? {
      id: String(Math.floor(Math.random() * 100)),
      name: `Kullanıcı ${index + 1}`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100`,
      isAdmin: false
    } : {
      id: 'admin1',
      name: 'Destek Ekibi',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100`,
      isAdmin: true
    }
  })),
  tags: ['önemli', 'acil', 'bug'].sort(() => Math.random() - 0.5).slice(0, 2)
}));

export default function SupportChannel({ channelId, channelName, topic, isAdmin = false }: SupportChannelProps) {
  // State yönetimi
  const [tickets, setTickets] = useState<Ticket[]>(SAMPLE_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Ticket['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // İstatistikler
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    avgResponseTime: '2.5 saat',
    satisfaction: '95%'
  };

  // Filtreleme fonksiyonu
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
      searchQuery === '' ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Talep durumu güncelleme
  const updateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  // Talep atama
  const assignTicket = (ticketId: string, assignee: { id: string; name: string; avatar: string; }) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, assignedTo: assignee } : ticket
    ));
  };

  // Talebe cevap verme
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (ticketId: string) => {
    if (!newMessage.trim()) return;

    const message: TicketMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      sender: isAdmin ? {
        id: 'admin1',
        name: 'Destek Ekibi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100',
        isAdmin: true
      } : {
        id: 'user1',
        name: 'Kullanıcı',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100',
        isAdmin: false
      }
    };

    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? {
        ...ticket,
        messages: [...ticket.messages, message],
        updatedAt: new Date().toISOString(),
        status: ticket.status === 'closed' ? 'open' : ticket.status
      } : ticket
    ));

    setNewMessage('');
  };

    // Yeni talep oluşturma
    const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'createdBy'>) => {
      const newTicket: Ticket = {
        ...ticketData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'user1',
          name: 'Kullanıcı',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100'
        },
        messages: []
      };
  
      setTickets([newTicket, ...tickets]);
      setShowNewTicketModal(false);
    };

  return (
    <div className="flex h-full">
      {/* Ana İçerik */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {/* Kanal Başlığı */}
        <div className="h-14 flex items-center sticky top-0 justify-between px-4 bg-[var(--surface)] border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--primary)] bg-opacity-10">
              <MessageCircle className="w-5 h-5 text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
                {channelName}
              </h1>
              {topic && (
                <p className="text-xs text-[var(--text-secondary)]">{topic}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--card)] text-[var(--text-secondary)]">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Taleplerde ara"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 bg-transparent border-none outline-none text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-colors rounded-lg text-white text-sm"
            >
              <PlusCircle size={16} />
              <span>Yeni Talep</span>
            </button>
          </div>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* İstatistikler (Admin için) */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[var(--surface)] rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Talep Durumu</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.open}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Bekleyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.inProgress}</div>
                    <div className="text-xs text-[var(--text-secondary)]">İşlemde</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.closed}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Kapanan</div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Yanıtlama Hızı</h3>
                <div className="flex items-center justify-center h-16">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.avgResponseTime}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Ortalama</div>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface)] rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Memnuniyet Oranı</h3>
                <div className="flex items-center justify-center h-16">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.satisfaction}</div>
                    <div className="text-xs text-[var(--text-secondary)]">Memnuniyet</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kullanıcı İstatistikleri */}
          {!isAdmin && (
            <div className="bg-[var(--surface)] rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Taleplerim</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {tickets.filter(t => t.status === 'open').length}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Bekleyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">İşlemde</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-primary)]">
                    {tickets.filter(t => t.status === 'closed').length}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">Tamamlanan</div>
                </div>
              </div>
            </div>
          )}

          {/* Filtreler */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'all' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--text-secondary)]'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilterStatus('open')}
              className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'open' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--text-secondary)]'}`}
            >
              Bekleyen
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'in_progress' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--text-secondary)]'}`}
            >
              İşlemde
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'closed' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--text-secondary)]'}`}
            >
              Kapanan
            </button>
          </div>

          {/* Talep Listesi */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-xl p-4 cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${{
                        open: 'bg-yellow-500/10 text-yellow-500',
                        in_progress: 'bg-blue-500/10 text-blue-500',
                        closed: 'bg-green-500/10 text-green-500'
                      }[ticket.status]}`}>
                        {{
                          open: 'Bekliyor',
                          in_progress: 'İşlemde',
                          closed: 'Kapandı'
                        }[ticket.status]}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${{
                        low: 'bg-gray-500/10 text-gray-500',
                        medium: 'bg-yellow-500/10 text-yellow-500',
                        high: 'bg-red-500/10 text-red-500'
                      }[ticket.priority]}`}>
                        {{
                          low: 'Düşük',
                          medium: 'Orta',
                          high: 'Yüksek'
                        }[ticket.priority]}
                      </span>
                      {ticket.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs bg-[var(--card)] text-[var(--text-secondary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-[var(--text-primary)] font-medium mb-1">{ticket.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-[var(--text-secondary)]">
                      {new Date(ticket.updatedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--text-secondary)]">{ticket.messages.length}</span>
                      <MessageSquare size={14} className="text-[var(--text-secondary)]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ Panel - Talep Detayları */}
      {selectedTicket && (
        <div className="w-[400px] h-full border-l border-white/5 bg-[var(--surface)] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedTicket.title}</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Talep Bilgileri */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">{selectedTicket.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">{selectedTicket.createdBy.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {new Date(selectedTicket.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="space-y-4 mb-6">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender.isAdmin ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={message.sender.avatar}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`flex-1 ${message.sender.isAdmin ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-[var(--text-secondary)]">
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Yanıt Formu */}
            <div className="sticky bottom-0 bg-[var(--surface)] pt-4">
              <textarea
                placeholder="Mesajınızı yazın..."
                className="w-full h-20 px-3 py-2 text-sm bg-[var(--card)] text-[var(--text-primary)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <div className="flex items-center justify-between gap-2 mt-2">
                {isAdmin && (
                  <select
                    className="px-3 py-1.5 text-sm bg-[var(--card)] text-[var(--text-secondary)] rounded-lg focus:outline-none"
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as Ticket['status'])}
                  >
                    <option value="open">Bekliyor</option>
                    <option value="in_progress">İşlemde</option>
                    <option value="closed">Kapandı</option>
                  </select>
                )}
                <button className="px-4 py-1.5 bg-[var(--primary)] text-white text-sm rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}