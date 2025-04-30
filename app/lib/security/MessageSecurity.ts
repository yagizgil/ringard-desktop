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
  public static encryptMessage(message: string, senderId: string, recipientId: string): string {
    // Mesajı JSON string'e çevir (newline'ları korumak için)
    const messageObj = {
      content: message,
      timestamp: new Date().toISOString()
    };
    const messageJson = JSON.stringify(messageObj);

    // Gönderen için şifrele
    const senderKey = this.ENCRYPTION_PREFIX + CryptoJS.MD5(senderId).toString() + this.ENCRYPTION_SUFFIX;
    const senderEncrypted = CryptoJS.AES.encrypt(messageJson, senderKey).toString();

    // Alıcı için şifrele
    const recipientKey = this.ENCRYPTION_PREFIX + CryptoJS.MD5(recipientId).toString() + this.ENCRYPTION_SUFFIX;
    const recipientEncrypted = CryptoJS.AES.encrypt(messageJson, recipientKey).toString();

    // İmza oluştur
    const signature = CryptoJS.MD5(messageJson).toString();

    // Sonucu JSON olarak döndür
    return JSON.stringify({
      senderEncrypted,
      recipientEncrypted,
      signature,
      timestamp: new Date().toISOString(),
      senderId,
      recipientId
    });
  }

  // Çözme ana fonksiyonu
  public static decryptMessage(encryptedMessage: string, userId: string): string | null {
    try {
      // JSON'u parse et
      const messageData = JSON.parse(encryptedMessage);
      
      // Kullanıcı ID'sine göre doğru şifreli mesajı seç
      const encryptedContent = userId === messageData.senderId 
        ? messageData.senderEncrypted 
        : messageData.recipientEncrypted;

      // Şifre çözme anahtarını oluştur
      const key = this.ENCRYPTION_PREFIX + CryptoJS.MD5(userId).toString() + this.ENCRYPTION_SUFFIX;
      
      // Mesajı çöz
      const bytes = CryptoJS.AES.decrypt(encryptedContent, key);
      const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
      
      // JSON'u parse et ve içeriği döndür
      const messageObj = JSON.parse(decryptedJson);
      return messageObj.content;
    } catch (error) {
      console.error('Mesaj çözme hatası:', error);
      return null;
    }
  }
} 