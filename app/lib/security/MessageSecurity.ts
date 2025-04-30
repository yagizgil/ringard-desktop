import CryptoJS from 'crypto-js';

export class MessageSecurity {
  private static readonly ENCRYPTION_PREFIX = 'RING_';
  private static readonly ENCRYPTION_SUFFIX = '_APP';
  private static readonly KEY_ROTATION_INTERVAL = 3600000; // 1 saat

  // Kullanıcı bazlı anahtar oluşturma
  private static generateUserKey(userId: string, timestamp: number): string {
    const timeBlock = Math.floor(timestamp / this.KEY_ROTATION_INTERVAL);
    const baseKey = this.ENCRYPTION_PREFIX + userId + this.ENCRYPTION_SUFFIX;
    return CryptoJS.SHA256(baseKey + timeBlock.toString()).toString();
  }

  // Mesaj imzalama
  private static signMessage(message: string, userId: string, timestamp: number): string {
    return CryptoJS.HmacSHA256(
      message + timestamp.toString(),
      this.generateUserKey(userId, timestamp)
    ).toString();
  }

  // Mesajı parçalara bölme
  private static splitMessage(message: string): string[] {
    return message.match(/.{1,16}/g) || [];
  }

  // Her parçayı farklı bir yöntemle şifreleme
  private static encryptParts(parts: string[], userId: string, timestamp: number): string[] {
    return parts.map((part, index) => {
      const partKey = this.generateUserKey(userId + index, timestamp);
      return CryptoJS.AES.encrypt(part, partKey).toString();
    });
  }

  // Şifreleme ana fonksiyonu
  public static encryptMessage(message: string, senderId: string, receiverId: string): string {
    const timestamp = Date.now();
    
    // Mesajı parçalara böl
    const parts = this.splitMessage(message);
    
    // Her parçayı hem gönderen hem alıcı için şifrele
    const senderEncrypted = this.encryptParts(parts, senderId, timestamp);
    const receiverEncrypted = this.encryptParts(parts, receiverId, timestamp);
    
    // İmza oluştur
    const signature = this.signMessage(message, senderId, timestamp);
    
    // Tüm veriyi birleştir
    return JSON.stringify({
      senderEncrypted,
      receiverEncrypted,
      signature,
      timestamp,
      senderId,
      receiverId
    });
  }

  // Çözme ana fonksiyonu
  public static decryptMessage(encryptedData: string, userId: string): string | null {
    try {
      const data = JSON.parse(encryptedData);
      const { senderEncrypted, receiverEncrypted, signature, timestamp, senderId, receiverId } = data;
      
      // Kullanıcının hangi şifreli parçaları kullanacağını belirle
      const encryptedParts = userId === senderId ? senderEncrypted : receiverEncrypted;
      
      // Parçaları çöz
      const decryptedParts = encryptedParts.map((part: string, index: number) => {
        const partKey = this.generateUserKey(userId + index, timestamp);
        return CryptoJS.AES.decrypt(part, partKey).toString(CryptoJS.enc.Utf8);
      });
      
      // Parçaları birleştir
      const decryptedMessage = decryptedParts.join('');
      
      // İmzayı doğrula
      const expectedSignature = this.signMessage(decryptedMessage, senderId, timestamp);
      if (expectedSignature !== signature) {
        console.error('Message integrity check failed');
        return null;
      }
      
      return decryptedMessage;
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
} 