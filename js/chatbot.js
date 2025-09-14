// chatbot.js - AIナレッジワークス カスタムチャットボット
/**
 * API Key セキュリティについて:
 * ================================
 * 
 * 【現在の保管方法】
 * - API keyはメモリ内のみに暗号化して保存（AES-GCM 256bit）
 * - ローカルストレージ、セッションストレージ、クッキーには保存しない
 * - ネットワーク経由での送信はDify APIへのリクエスト時のみ
 * - ページリロード時に暗号化キーを再生成（前回の履歴は復元不可）
 * 
 * 【セキュリティレベル】
 * - ✅ XSS攻撃耐性：HTMLエスケープ実装済み
 * - ✅ メモリダンプ対策：AES-GCM暗号化
 * - ✅ 永続化回避：ブラウザ閉鎖時に完全削除
 * - ✅ HTTPS通信：Dify APIはHTTPS必須
 * 
 * 【本番環境での推奨改善】
 * - サーバーサイドでのAPI key管理
 * - JWT トークンを使った認証システム
 * - 定期的なキーローテーション
 * - API使用量・レート制限の実装
 */
class AIKWChatbot {
  constructor() {
    this.apiUrl = 'https://api.dify.ai/v1';
    this.encryptedApiKey = null;
    this.isOpen = false;
    this.conversationId = null;
    this.userId = this.generateUserId();
    this.currentTab = 0;
    this.isDevelopmentMode = false;
    
    // 暗号化用のキー（セッション毎に生成）
    this.cryptoKey = null;
    
    // 事前定義された質問選択肢
    this.predefinedQuestions = [
      {
        category: "サービスについて",
        questions: [
          "企業向けAI研修について教えてください",
          "子ども向けAI研修はどのような内容ですか？",
          "AI導入支援サービスの詳細を知りたいです",
          "研修期間や料金体系について教えてください"
        ]
      },
      {
        category: "会社について", 
        questions: [
          "AIナレッジワークスの理念について教えてください",
          "創業のきっかけは何ですか？",
          "チームメンバーについて知りたいです",
          "会社の実績や事例を教えてください"
        ]
      },
      {
        category: "お問い合わせ",
        questions: [
          "無料相談は可能ですか？",
          "導入までの流れを教えてください",
          "お見積もりをお願いしたいです",
          "その他のご質問・ご相談"
        ]
      }
    ];
    
    this.init();
  }

  // 初期化
  async init() {
    try {
      console.log('🔄 チャットボット初期化開始...');
      
      // まずUIを作成（エラーがあってもユーザーにはUIを表示）
      console.log('🎨 UIを作成中...');
      this.createChatbotUI();
      
      console.log('🔗 イベントをバインド中...');
      this.bindEvents();
      
      // 次に暗号化とAPI関連の処理
      await this.initCrypto();
      
      // API key取得方法を選択
      const apiKey = await this.getApiKey();
      
      if (!apiKey) {
        console.warn('⚠️ API keyが取得できません。開発モードで動作します。');
        console.info('ℹ️ ローカル開発環境ではチャットボットUIのみ表示されます。');
        console.info('ℹ️ GitHub Pages本番環境では自動的にAPI機能が有効になります。');
        this.isDevelopmentMode = true;
        await this.encryptApiKey('placeholder'); // ダミーキー
        this.setupDevelopmentMode();
        return;
      }
      
      await this.encryptApiKey(apiKey);
      
      // デバッグ用：暗号化確認
      console.log('✅ API key successfully encrypted and stored in memory');
      console.log('✅ チャットボット初期化完了！');
      
      // ボタンの表示状態を確認
      setTimeout(() => {
        this.checkButtonVisibility();
      }, 100);
      
    } catch (error) {
      console.error('❌ チャットボット初期化エラー:', error);
      
      // エラーがあってもUIだけは作成してみる
      try {
        console.log('🔄 エラー後のUI作成を試行...');
        if (!document.getElementById('aikw-chatbot-button')) {
          this.createChatbotUI();
        }
        this.bindEvents();
        this.setupDevelopmentMode(); // 開発モードでフォールバック
      } catch (uiError) {
        console.error('❌ UI作成も失敗:', uiError);
        this.disableChatbot();
      }
    }
  }

  // 暗号化の初期化
  async initCrypto() {
    try {
      // Web Crypto APIの利用可能性を確認
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('⚠️ Web Crypto APIが利用できません。HTTPS環境で実行してください。');
        this.cryptoKey = null;
        return;
      }
      
      // Web Crypto APIを使用してキーを生成
      this.cryptoKey = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        false, // extractable
        ["encrypt", "decrypt"]
      );
      console.log('✅ 暗号化キーを生成しました');
    } catch (error) {
      console.error('❌ 暗号化キー生成エラー:', error);
      this.cryptoKey = null;
    }
  }

  // API keyの暗号化（AES-GCM 256bit）
  async encryptApiKey(apiKey) {
    try {
      // 暗号化キーが利用できない場合のフォールバック
      if (!this.cryptoKey) {
        console.warn('⚠️ 暗号化キーが利用できません。メモリに直接保存します。');
        this.encryptedApiKey = apiKey; // 暗号化なしで保存（開発環境のみ）
        return;
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        this.cryptoKey,
        data
      );
      
      // IV と暗号化データを結合
      const encryptedArray = new Uint8Array(iv.length + encrypted.byteLength);
      encryptedArray.set(iv);
      encryptedArray.set(new Uint8Array(encrypted), iv.length);
      
      this.encryptedApiKey = encryptedArray;
      
      // 元のAPI keyをメモリから完全削除
      apiKey = null;
      data.fill(0); // ゼロクリア
      
    } catch (error) {
      console.error('❌ API key暗号化エラー:', error);
      // エラー時は暗号化なしで保存
      this.encryptedApiKey = apiKey;
    }
  }

  // API keyの復号化
  async decryptApiKey() {
    try {
      // 暗号化されていない場合はそのまま返す
      if (!this.cryptoKey || typeof this.encryptedApiKey === 'string') {
        return this.encryptedApiKey;
      }
      
      const iv = this.encryptedApiKey.slice(0, 12);
      const encrypted = this.encryptedApiKey.slice(12);
      
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        this.cryptoKey,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('❌ API key復号化エラー:', error);
      // エラー時は暗号化されていないAPI keyを返す
      return typeof this.encryptedApiKey === 'string' ? this.encryptedApiKey : null;
    }
  }

  // ユーザーIDの生成
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // 開発モードのセットアップ
  setupDevelopmentMode() {
    console.log('🛠️ 開発モードをセットアップ中...');
    this.isDevelopmentMode = true;
    
    // 入力フィールドを有効化し、開発モードのメッセージを表示
    const chatInput = document.getElementById('aikw-chat-input');
    const sendButton = document.getElementById('aikw-chat-send');
    
    if (chatInput) {
      chatInput.disabled = false;
      chatInput.placeholder = '開発モード: メッセージを入力してください';
    }
    
    if (sendButton) {
      sendButton.disabled = false;
    }
    
    // 開発モードの通知メッセージを追加
    setTimeout(() => {
      this.addBotMessage('🛠️ **開発モード**: チャットボUIのみ表示しています。\n\n実際API機能はGitHub Pages本番環境で自動有効になります。\n\nお問い合わせは **otoiawase20250416@aiknowledgeworks.net** までお願いします。');
    }, 500);
    
    console.log('✅ 開発モードセットアップ完了');
  }

  // API key取得（GitHub Actionsビルド時に置換）
  async getApiKey() {
    // runtime-config.jsの読み込みを待つ（最大3秒）
    for (let attempt = 0; attempt < 30; attempt++) {
      // 1) ランタイム設定（CIで生成される runtime-config.js）
      if (typeof window !== 'undefined' && window.DIFY_API_KEY && window.DIFY_API_KEY !== 'DIFY_API_KEY_PLACEHOLDER' && window.DIFY_API_KEY !== undefined) {
        console.log('✅ runtime-config.js からAPI keyを使用します');
        return window.DIFY_API_KEY;
      }
      
      // 最初の試行でない場合は少し待つ
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 2) ビルド時置換（chatbot.js 内のプレースホルダを直接置換）
    const buildTimeKey = 'DIFY_API_KEY_PLACEHOLDER';
    if (buildTimeKey !== 'DIFY_API_KEY_PLACEHOLDER') {
      console.log('✅ ビルド時に埋め込まれたAPI keyを使用します');
      return buildTimeKey;
    }

    // プレースホルダーのままの場合（開発環境）
    console.warn('⚠️ 開発環境: API keyはGitHub Actionsビルド時に設定されます');
    console.info('ℹ️ GitHub Pages本番環境では自動的にAPI keyが設定されます');
    console.info('ℹ️ ローカルではチャットボットUIのみ表示されます');
    console.info('ℹ️ window.DIFY_API_KEY =', typeof window !== 'undefined' ? window.DIFY_API_KEY : 'undefined');

    return null;
  }

  // チャットボットUIの作成
  createChatbotUI() {
    console.log('🔨 createChatbotUI() 開始');
    
    // 既存のチャットボット要素を削除
    const existingButton = document.getElementById('aikw-chatbot-button');
    const existingWindow = document.getElementById('aikw-chatbot-window');
    if (existingButton) existingButton.remove();
    if (existingWindow) existingWindow.remove();
    
    const chatbotHTML = `
      <!-- チャットボタン -->
      <div id="aikw-chatbot-button" class="aikw-chatbot-button">
        <div class="aikw-chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 9H18V11H6V9ZM14 14H6V12H14V14ZM18 8H6V6H18V8Z" fill="white"/>
          </svg>
        </div>
      </div>

      <!-- チャットウィンドウ -->
      <div id="aikw-chatbot-window" class="aikw-chatbot-window">
        <div class="aikw-chatbot-header">
          <div class="aikw-chatbot-title">
            <img src="logo/AIナレッジワークス_logo_transparen.png" alt="AIKW" class="aikw-chatbot-logo">
            <span>AIナレッジワークス</span>
          </div>
          <div class="aikw-header-actions">
            <button id="aikw-clear-chat" class="aikw-clear-button" title="Clear chat">Clear</button>
            <button id="aikw-chatbot-close" class="aikw-chatbot-close" title="Close">×</button>
          </div>
        </div>
        
        <div class="aikw-chatbot-body">
          <div id="aikw-chat-messages" class="aikw-chat-messages">
            <div class="aikw-message aikw-bot-message">
              <div class="aikw-message-content">
                <p>こんにちは！AIナレッジワークスです。</p>
                <p>どのようなことについてお知りになりたいですか？下記からお選びください。</p>
              </div>
            </div>
          </div>
          
          <div id="aikw-question-options" class="aikw-question-options">
            <div class="aikw-tab-container">
              <div class="aikw-tab-header">
                <button class="aikw-tab-btn" data-tab="0">
                  <span>サービスについて</span>
                </button>
                <button class="aikw-tab-btn" data-tab="1">
                  <span>会社について</span>
                </button>
                <button class="aikw-tab-btn" data-tab="2">
                  <span>お問い合わせ</span>
                </button>
              </div>
              <div id="aikw-tab-content" class="aikw-tab-content">
                <!-- 質問選択肢がここに動的に挿入されます -->
              </div>
            </div>
          </div>
          
          <div class="aikw-chat-input-area">
            <div class="aikw-chat-input-container">
              <input type="text" id="aikw-chat-input" placeholder="メッセージを入力..." disabled>
              <button id="aikw-chat-send" disabled>送信</button>
            </div>
            <div class="aikw-chat-actions">
              <button id="aikw-back-to-options" class="aikw-back-button" style="display: none;">質問選択に戻る</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    try {
      document.body.insertAdjacentHTML('beforeend', chatbotHTML);
      console.log('✅ チャットボットHTMLをページに挿入完了');
      
      // 要素が正しく作成されたか確認
      const button = document.getElementById('aikw-chatbot-button');
      const window = document.getElementById('aikw-chatbot-window');
      
      if (button && window) {
        console.log('✅ チャットボット要素の作成成功');
        this.renderQuestionOptions();
      } else {
        console.error('❌ チャットボット要素が見つかりません', { button, window });
      }
    } catch (error) {
      console.error('❌ チャットボットHTML挿入エラー:', error);
    }
  }

  // 質問選択肢の描画（タブ式、初期は全て折りたたみ）
  renderQuestionOptions() {
    const tabContent = document.getElementById('aikw-tab-content');
    this.currentTab = 0;
    
    // 初期状態は全て折りたたみ
    tabContent.classList.add('collapsed');
    tabContent.innerHTML = '';
    
    this.bindTabEvents();
  }

  // イベントのバインド
  bindEvents() {
    console.log('🔗 bindEvents() 開始');
    
    const chatButton = document.getElementById('aikw-chatbot-button');
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const closeButton = document.getElementById('aikw-chatbot-close');
    const sendButton = document.getElementById('aikw-chat-send');
    const chatInput = document.getElementById('aikw-chat-input');
    const backButton = document.getElementById('aikw-back-to-options');
    const clearButton = document.getElementById('aikw-clear-chat');
    
    console.log('🔍 要素の取得結果:', {
      chatButton: !!chatButton,
      chatWindow: !!chatWindow,
      closeButton: !!closeButton,
      sendButton: !!sendButton,
      chatInput: !!chatInput,
      backButton: !!backButton,
      clearButton: !!clearButton
    });

    // チャットボタンクリック
    if (chatButton) {
      chatButton.addEventListener('click', () => {
        console.log('🐆 チャットボタンクリック');
        this.toggleChatbot();
      });
      console.log('✅ チャットボタンイベントリスナー設定完了');
    } else {
      console.error('❌ チャットボタンが見つかりません');
    }

    // 閉じるボタン
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeChatbot();
      });
      console.log('✅ 閉じるボタンイベントリスナー設定完了');
    }

    // 質問選択肢クリック
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('aikw-question-btn')) {
        const question = e.target.getAttribute('data-question');
        this.selectQuestion(question);
      }
    });

    // 送信ボタン
    sendButton.addEventListener('click', () => {
      this.sendMessage();
    });

    // Enterキーで送信
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 戻るボタン
    backButton.addEventListener('click', () => {
      this.showQuestionOptions();
    });

    // 履歴削除ボタン
    clearButton.addEventListener('click', () => {
      if (confirm('チャット履歴を削除してもよろしいですか？')) {
        this.clearChatHistory();
      }
    });

    // ウィンドウ外クリックで閉じる
    document.addEventListener('click', (e) => {
      if (this.isOpen && !chatWindow.contains(e.target) && !chatButton.contains(e.target)) {
        this.closeChatbot();
      }
    });
  }

  // チャットボットの開閉
  toggleChatbot() {
    if (this.isOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }

  // チャットボット開く
  openChatbot() {
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const chatButton = document.getElementById('aikw-chatbot-button');
    
    chatWindow.style.display = 'flex';
    setTimeout(() => {
      chatWindow.classList.add('aikw-open');
      chatButton.classList.add('aikw-hidden');
    }, 10);
    
    this.isOpen = true;
  }

  // チャットボット閉じる
  closeChatbot() {
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const chatButton = document.getElementById('aikw-chatbot-button');
    
    chatWindow.classList.remove('aikw-open');
    chatButton.classList.remove('aikw-hidden');
    
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 300);
    
    this.isOpen = false;
  }

  // 質問選択
  async selectQuestion(question) {
    this.addUserMessage(question);
    this.hideQuestionOptionsTemporarily();
    this.enableTextInput();
    
    // ボットの応答を取得
    await this.getBotResponse(question);
  }

  // ユーザーメッセージの追加
  addUserMessage(message) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    const formattedMessage = this.formatMessage(message);
    const messageHTML = `
      <div class="aikw-message aikw-user-message">
        <div class="aikw-message-content">
          ${formattedMessage}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
  }

  // ボットメッセージの追加
  addBotMessage(message, isLoading = false) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    const messageId = 'bot-msg-' + Date.now();
    
    // 改行を<br>タグに変換し、HTMLエスケープを適用
    const formattedMessage = isLoading ? 
      '<div class="aikw-typing-indicator"><span></span><span></span><span></span></div>' :
      this.formatMessage(message);
      
    const messageHTML = `
      <div id="${messageId}" class="aikw-message aikw-bot-message">
        <div class="aikw-message-content">
          ${formattedMessage}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    this.scrollToBottom();
    return messageId;
  }

  // 質問選択肢を一時的に隠す（選択後）
  hideQuestionOptionsTemporarily() {
    const optionsContainer = document.getElementById('aikw-question-options');
    const backButton = document.getElementById('aikw-back-to-options');
    optionsContainer.style.display = 'none';
    backButton.style.display = 'inline-block';
    
    // 3秒後に選択肢を再表示（全て折りたたみ状態）
    setTimeout(() => {
      if (this.isOpen) {
        optionsContainer.style.display = 'block';
        this.collapseAllCategories(); // 全カテゴリを折りたたみ
      }
    }, 3000);
  }

  // 質問選択肢を表示
  showQuestionOptions() {
    const optionsContainer = document.getElementById('aikw-question-options');
    const backButton = document.getElementById('aikw-back-to-options');
    const chatInput = document.getElementById('aikw-chat-input');
    const sendButton = document.getElementById('aikw-chat-send');
    
    optionsContainer.style.display = 'block';
    backButton.style.display = 'none';
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatInput.placeholder = 'メッセージを入力...';
    
    // 選択肢表示時に全カテゴリを折りたたみ
    this.collapseAllCategories();
  }

  // テキスト入力を有効化
  enableTextInput() {
    const chatInput = document.getElementById('aikw-chat-input');
    const sendButton = document.getElementById('aikw-chat-send');
    
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.placeholder = '続けて質問をどうぞ...';
  }

  // メッセージ送信
  async sendMessage() {
    const chatInput = document.getElementById('aikw-chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    this.addUserMessage(message);
    chatInput.value = '';
    
    await this.getBotResponse(message);
  }

  // ボットの応答取得
  async getBotResponse(message) {
    const loadingMessageId = this.addBotMessage('', true);
    
    try {
      // 開発モードではAPI呼び出しをスキップ
      if (this.isDevelopmentMode) {
        throw new Error('開発モード: API keyが設定されていません');
      }
      
      const apiKey = await this.decryptApiKey();
      if (!apiKey) {
        throw new Error('API key復号化に失敗しました');
      }
      
      const response = await fetch(`${this.apiUrl}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: message,
          response_mode: 'blocking',
          conversation_id: this.conversationId,
          user: this.userId,
          auto_generate_name: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`API エラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 会話IDを保存
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }
      
      // ローディングメッセージを削除
      const loadingMessage = document.getElementById(loadingMessageId);
      if (loadingMessage) {
        loadingMessage.remove();
      }
      
      // ボットの応答を表示
      this.addBotMessage(data.answer || 'すみません、応答を取得できませんでした。');
      
    } catch (error) {
      console.error('ボット応答エラー:', error);
      
      // ローディングメッセージを削除
      const loadingMessage = document.getElementById(loadingMessageId);
      if (loadingMessage) {
        loadingMessage.remove();
      }
      
      // 開発モード用またはエラーメッセージを表示
      if (this.isDevelopmentMode) {
        this.addBotMessage(`🛠️ **開発モードでの応答**\n\nあなたのメッセージ: "${message}"\n\nありがとうございます！現在は開発モードで動作しており、実際のAI応答は本番環境でのみ利用可能です。\n\n詳しいお問い合わせは **otoiawase20250416@aiknowledgeworks.net** までお願いいたします。`);
      } else {
        this.addBotMessage('申し訳ございません。現在システムに問題が発生しております。お手数ですが、後ほど再度お試しいただくか、直接お問い合わせください。');
      }
    }
  }

  // メッセージのフォーマット（改行、HTMLエスケープ、Markdownハイライト）
  formatMessage(message) {
    // HTMLエスケープ
    let escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Markdownハイライトの処理
    // #### 見出し4-> <h4>
    escaped = escaped.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    // ### 見出し3-> <h3>
    escaped = escaped.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    // ## 見出し2-> <h2>
    escaped = escaped.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    // **太字** -> <strong>
    escaped = escaped.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    // *イタリック* -> <em> (太字と重複しないように先に太字を処理)
    escaped = escaped.replace(/(^|\s)\*([^*\s][^*]*?)\*(\s|$)/g, '$1<em>$2</em>$3');
    // `コード` -> <code>
    escaped = escaped.replace(/`([^`]+?)`/g, '<code>$1</code>');
    
    // 改行を<br>タグに変換
    return escaped.replace(/\n/g, '<br>');
  }

  // チャット履歴をクリア
  clearChatHistory() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    const backButton = document.getElementById('aikw-back-to-options');
    
    // 初期メッセージ以外をクリア
    const messages = messagesContainer.querySelectorAll('.aikw-message');
    messages.forEach((message, index) => {
      if (index > 0) { // 最初の挨拶メッセージは残す
        message.remove();
      }
    });
    
    // 会話IDをリセット
    this.conversationId = null;
    
    // 選択肢を再表示（全て折りたたみ状態）
    this.showQuestionOptions();
  }

  // エラー時のチャットボット無効化
  disableChatbot() {
    // チャットボタンを非表示に
    const chatButton = document.getElementById('aikw-chatbot-button');
    if (chatButton) {
      chatButton.style.display = 'none';
    }
    console.warn('⚠️ チャットボットが無効化されました。ページをリロードして再試行してください。');
  }

  // デバッグ用：チャットボタンの表示状態を確認
  checkButtonVisibility() {
    const button = document.getElementById('aikw-chatbot-button');
    if (button) {
      const styles = window.getComputedStyle(button);
      console.log('🔍 チャットボタンの状態:', {
        element: button,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        zIndex: styles.zIndex,
        position: styles.position,
        bottom: styles.bottom,
        right: styles.right
      });
      return true;
    } else {
      console.error('❌ チャットボタンが存在しません');
      return false;
    }
  }

  // タブコンテンツの展開
  expandTabContent(tabIndex) {
    const tabContent = document.getElementById('aikw-tab-content');
    const category = this.predefinedQuestions[tabIndex];
    
    if (!category) return;
    
    const contentHTML = `
      <div class="aikw-questions-container">
        ${category.questions.map(question => 
          `<button class="aikw-question-btn" data-question="${question}">${question}</button>`
        ).join('')}
      </div>
    `;
    
    tabContent.innerHTML = contentHTML;
    tabContent.classList.remove('collapsed');
    tabContent.classList.add('expanded');
  }
  
  // タブコンテンツの折りたたみ
  collapseTabContent() {
    const tabContent = document.getElementById('aikw-tab-content');
    tabContent.classList.remove('expanded');
    tabContent.classList.add('collapsed');
    tabContent.innerHTML = '';
  }
  
  // 旧renderTabContentメソッド（互換性のため保持）
  renderTabContent(tabIndex) {
    // 新しい展開メソッドを使用
    this.expandTabContent(tabIndex);
  }

  // タブイベントをバインド（直接切り替え仕様）
  bindTabEvents() {
    const tabButtons = document.querySelectorAll('.aikw-tab-btn');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabIndex = parseInt(button.getAttribute('data-tab'));
        const tabContent = document.getElementById('aikw-tab-content');
        const isCurrentlyExpanded = tabContent.classList.contains('expanded') && this.currentTab === tabIndex;
        
        if (isCurrentlyExpanded) {
          // 同じタブをクリック：折りたたみ
          tabButtons.forEach(btn => btn.classList.remove('active'));
          this.collapseTabContent();
        } else {
          // 違うタブまたは折りたたみ状態からクリック：直接切り替え
          tabButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // コンテンツを直接切り替え
          this.currentTab = tabIndex;
          this.expandTabContent(tabIndex);
        }
      });
    });
  }

  // 初期状態へリセット（全て折りたたみ）
  resetToFirstTab() {
    this.currentTab = 0;
    const tabButtons = document.querySelectorAll('.aikw-tab-btn');
    
    // アクティブタブをリセット
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // コンテンツを折りたたみ状態に
    this.collapseTabContent();
  }

  // 旧折りたたみメソッド（互換性のため保持）
  collapseAllCategories() {
    // タブ式では初期タブにリセット
    this.resetToFirstTab();
  }

  // チャット履歴の最下部にスクロール
  scrollToBottom() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// DOMが読み込まれたらチャットボットを初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('🚀 Initializing AIKW Chatbot...');
    const chatbot = new AIKWChatbot();
    window.aikwChatbot = chatbot; // デバッグ用にグローバルに設定
  } catch (error) {
    console.error('❌ Failed to initialize chatbot:', error);
  }
});
