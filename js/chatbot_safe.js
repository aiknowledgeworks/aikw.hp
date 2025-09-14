// chatbot_safe.js - AIナレッジワークス 安全なチャットボット
class AIKWChatbot {
  constructor() {
    console.log('🔄 チャットボット初期化開始...');
    this.apiUrl = 'https://api.dify.ai/v1';
    this.isOpen = false;
    this.conversationId = null;
    this.userId = this.generateUserId();
    this.currentTab = 0;
    this.isDevelopmentMode = true; // 安全モードを有効
    
    // 事前定義された質問選択肢（簡素化）
    this.predefinedQuestions = [
      {
        category: "サービスについて",
        questions: [
          "企業向けAI研修について教えてください",
          "子ども向けAI研修はどのような内容ですか？"
        ]
      }
    ];
    
    // エラーハンドリングを強化して初期化
    try {
      this.createChatbotUI();
      this.bindEvents();
      console.log('✅ チャットボット初期化完了！');
    } catch (error) {
      console.error('❌ チャットボット初期化エラー:', error);
      this.disableChatbot();
    }
  }
  
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
  
  createChatbotUI() {
    console.log('🎨 UIを作成中...');
    
    // チャットボタンのHTML
    const chatbotHTML = `
      <div id="aikw-chatbot-button" class="aikw-chatbot-button">
        <div class="aikw-chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z"/>
          </svg>
        </div>
      </div>
      
      <div id="aikw-chatbot-window" class="aikw-chatbot-window">
        <div class="aikw-chatbot-header">
          <div class="aikw-chatbot-title">
            <img src="logo/AIナレッジワークス_logo_transparen.png" alt="AIKW Logo" class="aikw-chatbot-logo">
            AIKWチャット
          </div>
          <div class="aikw-header-actions">
            <button id="aikw-clear-chat" class="aikw-clear-button">Clear</button>
            <button id="aikw-chatbot-close" class="aikw-chatbot-close">×</button>
          </div>
        </div>
        
        <div class="aikw-chatbot-body">
          <div id="aikw-chat-messages" class="aikw-chat-messages">
            <div class="aikw-message aikw-bot-message">
              <div class="aikw-message-content">
                こんにちは！AIナレッジワークスです。<br>
                ご質問をお選びいただくか、直接入力してください。
              </div>
            </div>
          </div>
          
          <div id="aikw-chat-input-area" class="aikw-chat-input-area">
            <div class="aikw-chat-input-container">
              <input type="text" id="aikw-chat-input" placeholder="メッセージを入力..." maxlength="500">
              <button id="aikw-send-button">送信</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // DOMに追加
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);
  }
  
  bindEvents() {
    console.log('🔗 イベントをバインド中...');
    
    // チャットボタンクリックイベント
    const chatButton = document.getElementById('aikw-chatbot-button');
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const closeButton = document.getElementById('aikw-chatbot-close');
    
    if (chatButton && chatWindow && closeButton) {
      chatButton.addEventListener('click', () => this.toggleChat());
      closeButton.addEventListener('click', () => this.closeChat());
      
      // 送信ボタンのイベント
      const sendButton = document.getElementById('aikw-send-button');
      const chatInput = document.getElementById('aikw-chat-input');
      
      if (sendButton && chatInput) {
        sendButton.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.sendMessage();
        });
      }
      
      console.log('✅ イベントバインド完了');
    } else {
      throw new Error('必要なDOM要素が見つかりません');
    }
  }
  
  toggleChat() {
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const chatButton = document.getElementById('aikw-chatbot-button');
    
    if (this.isOpen) {
      this.closeChat();
    } else {
      chatWindow.style.display = 'flex';
      setTimeout(() => {
        chatWindow.classList.add('aikw-open');
        chatButton.classList.add('aikw-hidden');
      }, 10);
      this.isOpen = true;
    }
  }
  
  closeChat() {
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const chatButton = document.getElementById('aikw-chatbot-button');
    
    chatWindow.classList.remove('aikw-open');
    chatButton.classList.remove('aikw-hidden');
    
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 250);
    
    this.isOpen = false;
  }
  
  sendMessage() {
    const input = document.getElementById('aikw-chat-input');
    const message = input.value.trim();
    
    if (message) {
      this.addMessage(message, 'user');
      input.value = '';
      
      // 開発モードでは自動応答
      setTimeout(() => {
        this.addMessage('申し訳ございませんが、現在チャットボットは開発モードです。お問い合わせは直接メールでご連絡ください。', 'bot');
      }, 1000);
    }
  }
  
  addMessage(text, sender) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `aikw-message aikw-${sender}-message`;
    
    const contentElement = document.createElement('div');
    contentElement.className = 'aikw-message-content';
    contentElement.innerHTML = text.replace(/\n/g, '<br>');
    
    messageElement.appendChild(contentElement);
    messagesContainer.appendChild(messageElement);
    
    // 最下部にスクロール
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  disableChatbot() {
    console.warn('⚠️ チャットボットが無効化されました。');
    const chatButton = document.getElementById('aikw-chatbot-button');
    if (chatButton) {
      chatButton.style.display = 'none';
    }
  }
}

// DOMが読み込まれたらチャットボットを初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('🚀 Initializing AIKW Safe Chatbot...');
    const chatbot = new AIKWChatbot();
    window.aikwChatbot = chatbot;
  } catch (error) {
    console.error('❌ Failed to initialize safe chatbot:', error);
  }
});