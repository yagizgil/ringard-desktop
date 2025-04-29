import { create } from 'zustand';

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: any[];
  connect: (userId: string, username: string) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  sendDirectMessage: (recipientId: string, content: string) => void;
}

// WebSocket bağlantısını global olarak saklayalım
let globalSocket: WebSocket | null = null;
let globalReconnectAttempts = 0;
let globalReconnectTimeout: NodeJS.Timeout | null = null;

export const useWebSocket = create<WebSocketState>((set: any, get: any) => ({
  socket: null,
  isConnected: false,
  messages: [],
  connect: (userId: string, username: string) => {
    // Eğer zaten bağlıysa, yeni bağlantı kurma
    if (get().isConnected) {
      console.log('WebSocket zaten bağlı');
      return;
    }

    // Eğer global socket varsa ve bağlıysa, onu kullan
    if (globalSocket && globalSocket.readyState === WebSocket.OPEN) {
      console.log('Global WebSocket bağlantısı kullanılıyor');
      set({ isConnected: true, socket: globalSocket });
      return;
    }

    try {
      // Önceki bağlantıyı temizle
      if (globalSocket) {
        globalSocket.close();
        globalSocket = null;
      }

      // Önceki yeniden bağlanma zamanlayıcısını temizle
      if (globalReconnectTimeout) {
        clearTimeout(globalReconnectTimeout);
        globalReconnectTimeout = null;
      }

      const socket = new WebSocket('wss://ringard.com.tr');
      globalSocket = socket;
      
      const maxReconnectAttempts = 5;
      const reconnectDelay = 3000; // 3 saniye
      
      socket.onopen = () => {
        console.log('WebSocket bağlantısı kuruldu');
        // Kullanıcı bilgilerini gönder
        socket.send(JSON.stringify({ user_id: userId, username: username }));
        set({ isConnected: true, socket });
        globalReconnectAttempts = 0; // Bağlantı başarılı olduğunda sayacı sıfırla
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket mesajı alındı:', message);
          set((state: WebSocketState) => ({ 
            messages: [...state.messages, message] 
          }));
        } catch (error) {
          console.error('WebSocket mesajı işlenirken hata:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket bağlantısı kapandı');
        set({ isConnected: false, socket: null });
        
        // Yeniden bağlanma mantığı
        if (globalReconnectAttempts < maxReconnectAttempts) {
          globalReconnectAttempts++;
          console.log(`WebSocket yeniden bağlanıyor... (Deneme ${globalReconnectAttempts}/${maxReconnectAttempts})`);
          
          // Önceki zamanlayıcıyı temizle
          if (globalReconnectTimeout) {
            clearTimeout(globalReconnectTimeout);
          }
          
          globalReconnectTimeout = setTimeout(() => {
            if (!get().isConnected) {
              get().connect(userId, username);
            }
          }, reconnectDelay * globalReconnectAttempts); // Her denemede bekleme süresini artır
        } else {
          console.log('Maksimum yeniden bağlanma denemesi aşıldı. Lütfen sayfayı yenileyin.');
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };
    } catch (error) {
      console.error('WebSocket bağlantısı kurulurken hata:', error);
    }
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ isConnected: false, socket: null });
    }
  },
  sendMessage: (message: any) => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket bağlantısı yok veya açık değil');
    }
  },
  sendDirectMessage: (recipientId: string, content: string) => {
    const { socket } = get();
    if (socket && socket.readyState === WebSocket.OPEN) {
      const dm = {
        recipient_id: recipientId,
        content: content
      };
      socket.send('dm:' + JSON.stringify(dm));
    } else {
      console.error('WebSocket bağlantısı yok veya açık değil');
    }
  }
})); 