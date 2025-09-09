/**
 * AES-GCM 256bit暗号化ユーティリティ
 * 静的サイトでの安全なデータ暗号化
 */

class SecureStorage {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  /**
   * パスワードからAES-GCMキーを導出
   * @param {string} password - ユーザーのパスワード
   * @param {Uint8Array} salt - ソルト
   * @returns {Promise<CryptoKey>}
   */
  async deriveKey(password, salt) {
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      this.encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * データを暗号化
   * @param {string} plaintext - 暗号化するテキスト
   * @param {string} password - パスワード
   * @returns {Promise<string>} Base64エンコードされた暗号化データ
   */
  async encrypt(plaintext, password) {
    try {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const key = await this.deriveKey(password, salt);
      const data = this.encoder.encode(plaintext);
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        data
      );

      // salt + iv + 暗号化データを結合
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Base64エンコードして返す
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('暗号化エラー:', error);
      throw new Error('データの暗号化に失敗しました');
    }
  }

  /**
   * データを復号化
   * @param {string} encryptedData - Base64エンコードされた暗号化データ
   * @param {string} password - パスワード
   * @returns {Promise<string>} 復号化されたテキスト
   */
  async decrypt(encryptedData, password) {
    try {
      // Base64デコード
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      // salt、iv、暗号化データを分離
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      const key = await this.deriveKey(password, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encrypted
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      console.error('復号化エラー:', error);
      throw new Error('データの復号化に失敗しました（パスワードが間違っているかデータが破損しています）');
    }
  }

  /**
   * セキュアなローカルストレージへの保存
   * @param {string} key - ストレージキー
   * @param {string} data - 保存するデータ
   * @param {string} password - 暗号化パスワード
   */
  async secureStore(key, data, password) {
    const encrypted = await this.encrypt(data, password);
    localStorage.setItem(`secure_${key}`, encrypted);
  }

  /**
   * セキュアなローカルストレージからの取得
   * @param {string} key - ストレージキー
   * @param {string} password - 復号化パスワード
   * @returns {Promise<string|null>}
   */
  async secureRetrieve(key, password) {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    
    try {
      return await this.decrypt(encrypted, password);
    } catch (error) {
      console.error('データ取得エラー:', error);
      return null;
    }
  }
}

// 使用例
const storage = new SecureStorage();

// データを暗号化して保存
async function saveUserData(userData, userPassword) {
  try {
    await storage.secureStore('user_preferences', JSON.stringify(userData), userPassword);
    console.log('データが安全に保存されました');
  } catch (error) {
    console.error('保存エラー:', error);
  }
}

// データを復号化して取得
async function loadUserData(userPassword) {
  try {
    const data = await storage.secureRetrieve('user_preferences', userPassword);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('取得エラー:', error);
    return null;
  }
}

// グローバルに公開
window.SecureStorage = SecureStorage;
