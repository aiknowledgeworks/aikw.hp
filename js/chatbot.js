// chatbot.js - AIナレッジワークス シンプルチャットボット
class AIKWChatbot {
  constructor() {
    this.apiUrl = 'https://aikwbot.skume-bioinfo.workers.dev';
    this.isOpen = false;
    this.conversationId = null;
    this.userId = this.generateUserId();
    this.currentTab = 0;

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
  init() {
    try {
      this.createChatbotUI();
      this.bindEvents();
    } catch (error) {
      // 初期化エラーは無視（UIは作成済み）
    }
  }

  // ユーザーIDの生成
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // チャットボットUIの作成
  createChatbotUI() {
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
              <input type="text" id="aikw-chat-input" placeholder="メッセージを入力...">
              <button id="aikw-chat-send">送信</button>
            </div>
            <div class="aikw-chat-actions">
              <button id="aikw-back-to-options" class="aikw-back-button" style="display: none;">質問選択に戻る</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    this.renderQuestionOptions();
  }

  // 質問選択肢の描画
  renderQuestionOptions() {
    const tabContent = document.getElementById('aikw-tab-content');
    this.currentTab = 0;
    tabContent.classList.add('collapsed');
    tabContent.innerHTML = '';
    this.bindTabEvents();
  }

  // イベントのバインド
  bindEvents() {
    const chatButton = document.getElementById('aikw-chatbot-button');
    const closeButton = document.getElementById('aikw-chatbot-close');
    const sendButton = document.getElementById('aikw-chat-send');
    const chatInput = document.getElementById('aikw-chat-input');
    const backButton = document.getElementById('aikw-back-to-options');
    const clearButton = document.getElementById('aikw-clear-chat');

    // チャットボタンクリック
    if (chatButton) {
      chatButton.addEventListener('click', () => this.toggleChatbot());
    }

    // 閉じるボタン
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeChatbot());
    }

    // 質問選択肢クリック
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('aikw-question-btn')) {
        const question = e.target.getAttribute('data-question');
        this.selectQuestion(question);
      }
    });

    // 送信ボタン
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }

    // Enterキーで送信
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // 戻るボタン
    if (backButton) {
      backButton.addEventListener('click', () => this.showQuestionOptions());
    }

    // 履歴削除ボタン
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (confirm('チャット履歴を削除してもよろしいですか？')) {
          this.clearChatHistory();
        }
      });
    }

    // ウィンドウ外クリックで閉じる
    const chatWindow = document.getElementById('aikw-chatbot-window');
    document.addEventListener('click', (e) => {
      if (this.isOpen && chatWindow && !chatWindow.contains(e.target) && !chatButton.contains(e.target)) {
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

    if (chatWindow && chatButton) {
      chatWindow.style.display = 'flex';
      setTimeout(() => {
        chatWindow.classList.add('aikw-open');
        chatButton.classList.add('aikw-hidden');
      }, 10);
      this.isOpen = true;
    }
  }

  // チャットボット閉じる
  closeChatbot() {
    const chatWindow = document.getElementById('aikw-chatbot-window');
    const chatButton = document.getElementById('aikw-chatbot-button');

    if (chatWindow && chatButton) {
      chatWindow.classList.remove('aikw-open');
      chatButton.classList.remove('aikw-hidden');

      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);

      this.isOpen = false;
    }
  }

  // 質問選択
  async selectQuestion(question) {
    this.addUserMessage(question);
    this.hideQuestionOptionsTemporarily();
    await this.getBotResponse(question);
  }

  // ユーザーメッセージの追加
  addUserMessage(message) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (!messagesContainer) return;

    const formattedMessage = this.formatMessage(message);
    const messageHTML = `
      <div class="aikw-message aikw-user-message aikw-new-user-message">
        <div class="aikw-message-content">
          ${formattedMessage}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    
    // 新しいメッセージ要素を取得
    const newMessage = messagesContainer.lastElementChild;
    
    // ユーザーメッセージを即座にウィンドウ最上部に表示して視認性を向上
    this.scrollUserMessageToTop();
    
    // 確実にスクロールさせるために少し待ってからもう一度実行
    setTimeout(() => {
      this.scrollUserMessageToTop();
    }, 50);
    
    // ハイライトアニメーション終了後にクラスを削除
    if (newMessage) {
      setTimeout(() => {
        newMessage.classList.remove('aikw-new-user-message');
      }, 2000);
    }
  }

  // ボットメッセージの追加
  addBotMessage(message, isLoading = false) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (!messagesContainer) return null;

    const messageId = 'bot-msg-' + Date.now();
    const formattedMessage = isLoading ?
      '<div class="aikw-typing-indicator"><span></span><span></span><span></span></div>' :
      this.formatMessage(message);

    // ローディング中でない実際のメッセージにはハイライトアニメーションを追加
    const highlightClass = (!isLoading) ? ' aikw-new-message' : '';
    
    const messageHTML = `
      <div id="${messageId}" class="aikw-message aikw-bot-message${highlightClass}">
        <div class="aikw-message-content">
          ${formattedMessage}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    
    // 新しいメッセージ要素を取得
    const newMessage = messagesContainer.lastElementChild;
    
    // ボットメッセージが表示された後のスクロール制御
    if (isLoading) {
      // ローディングアニメーションの場合は通常のスクロール
      this.scrollToBottom();
    } else {
      // 実際のメッセージの場合は自動スクロールを無効にして固定位置を維持
      // アウトプットが長い場合にチャットが流れないように自動スクロールしない
      
      // ハイライトアニメーション終了後にクラスを削除
      if (newMessage) {
        setTimeout(() => {
          newMessage.classList.remove('aikw-new-message');
        }, 2000);
      }
    }
    
    return messageId;
  }

  // 質問選択肢を一時的に隠す
  hideQuestionOptionsTemporarily() {
    const optionsContainer = document.getElementById('aikw-question-options');
    const backButton = document.getElementById('aikw-back-to-options');

    if (optionsContainer) optionsContainer.style.display = 'none';
    if (backButton) backButton.style.display = 'inline-block';
    
    // 自動再表示タイマーを削除（手動で制御するため）
  }

  // 質問選択肢を表示
  showQuestionOptions() {
    const optionsContainer = document.getElementById('aikw-question-options');
    const backButton = document.getElementById('aikw-back-to-options');

    if (optionsContainer) optionsContainer.style.display = 'block';
    if (backButton) backButton.style.display = 'none';

    this.collapseAllCategories();
  }
  
  // ボット応答後に質問選択肢を表示
  showQuestionOptionsAfterResponse() {
    const optionsContainer = document.getElementById('aikw-question-options');
    const backButton = document.getElementById('aikw-back-to-options');

    if (optionsContainer) {
      optionsContainer.style.display = 'block';
      // タブを初期状態（折りたたまれた状態）で表示
      this.collapseAllCategories();
    }
    if (backButton) backButton.style.display = 'none';
  }

  // メッセージ送信
  async sendMessage() {
    const chatInput = document.getElementById('aikw-chat-input');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    chatInput.value = '';
    
    // メッセージ送信時に選択肢を隠す
    this.hideQuestionOptionsTemporarily();

    await this.getBotResponse(message);
  }

  // ボットの応答取得
  async getBotResponse(message) {
    const loadingMessageId = this.addBotMessage('', true);

    try {
      const requestData = {
        inputs: {},
        query: message,
        response_mode: 'blocking',
        conversation_id: this.conversationId,
        user: this.userId,
        auto_generate_name: false
      };

      // file://プロトコル検出とフォールバック処理
      const isFileProtocol = window.location.protocol === 'file:';

      if (isFileProtocol) {
        // file://環境では代替手段を使用
        return await this.getBotResponseAlternative(message, requestData, loadingMessageId);
      }

      const response = await fetch(`${this.apiUrl}/v1/chat-messages`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API エラー: ${response.status} - ${response.statusText}`);
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`JSON パースエラー: ${parseError.message}`);
      }

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
      const botAnswer = data.answer || 'すみません、応答を取得できませんでした。';
      this.addBotMessage(botAnswer);
      
      // ボット応答後に選択肢を表示（少し遅延を入れる）
      setTimeout(() => {
        this.showQuestionOptionsAfterResponse();
      }, 1000);

    } catch (error) {
      // ローディングメッセージを削除
      const loadingMessage = document.getElementById(loadingMessageId);
      if (loadingMessage) {
        loadingMessage.remove();
      }

      // エラーの種類を分析
      let userFriendlyMessage = '';

      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        userFriendlyMessage = 'インターネット接続を確認してください。';
      } else if (error.message.includes('API エラー:')) {
        userFriendlyMessage = 'サーバーで問題が発生しています。';
      } else if (error.message.includes('JSON パースエラー:')) {
        userFriendlyMessage = 'サーバーからの応答に問題があります。';
      } else if (error.message.includes('CORS')) {
        userFriendlyMessage = 'ブラウザのセキュリティ制限により接続できません。';
      } else {
        userFriendlyMessage = '予期しないエラーが発生しました。';
      }

      // ユーザーに表示するメッセージ
      const displayMessage = `申し訳ございません。${userFriendlyMessage}

お手数ですが、後ほど再度お試しいただくか、直接お問い合わせください。

詳しいお問い合わせは **otoiawase20250416@aiknowledgeworks.net** までお願いいたします。`;

      this.addBotMessage(displayMessage);
      
      // エラー後も選択肢を表示
      setTimeout(() => {
        this.showQuestionOptionsAfterResponse();
      }, 1000);
    }
  }

  // file://プロトコル対応の代替API通信方法
  async getBotResponseAlternative(message, requestData, loadingMessageId) {
    try {
      // 1. script要素を使ったJSONPライクな方法を試行
      const result = await this.jsonpRequest(requestData);

      if (result && result.answer) {
        // 成功時の処理
        if (result.conversation_id) {
          this.conversationId = result.conversation_id;
        }

        const loadingMessage = document.getElementById(loadingMessageId);
        if (loadingMessage) {
          loadingMessage.remove();
        }

        this.addBotMessage(result.answer);
        
        // 代替API成功後も選択肢を表示
        setTimeout(() => {
          this.showQuestionOptionsAfterResponse();
        }, 1000);
        
        return;
      }

      throw new Error('代替通信方法での応答取得失敗');
    } catch (altError) {
      // 代替方法も失敗した場合のフォールバック
      return this.handleFileProtocolFallback(message, loadingMessageId);
    }
  }

  // JSONP風リクエスト（file://プロトコル用）
  async jsonpRequest(requestData) {
    return new Promise((resolve, reject) => {
      // グローバルコールバック関数を作成
      const callbackName = 'aikw_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      // クリーンアップ関数
      const cleanup = () => {
        delete window[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      // タイムアウト設定
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP request timeout'));
      }, 15000);

      // script要素を作成してリクエスト送信を試行
      const script = document.createElement('script');

      // URLパラメータとしてデータを送信
      const params = new URLSearchParams({
        callback: callbackName,
        query: requestData.query,
        user: requestData.user,
        conversation_id: requestData.conversation_id || '',
        response_mode: requestData.response_mode
      });

      script.src = `${this.apiUrl}/v1/chat-messages?${params.toString()}`;
      script.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error('JSONP script load error'));
      };

      document.head.appendChild(script);
    });
  }

  // file://プロトコル環境でのフォールバック処理
  handleFileProtocolFallback(message, loadingMessageId) {
    const loadingMessage = document.getElementById(loadingMessageId);
    if (loadingMessage) {
      loadingMessage.remove();
    }

    // file://環境での標準エラーメッセージ
    const fallbackMessage = `申し訳ございません。現在システムに問題が発生しております。

お手数ですが、後ほど再度お試しいただくか、直接お問い合わせください。

詳しいお問い合わせは **otoiawase20250416@aiknowledgeworks.net** までお願いいたします。`;

    this.addBotMessage(fallbackMessage);
    
    // フォールバック後も選択肢を表示
    setTimeout(() => {
      this.showQuestionOptionsAfterResponse();
    }, 1000);
  }

  // メッセージのフォーマット
  formatMessage(message) {
    // HTMLエスケープ
    let escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // Markdownの基本的なフォーマット
    escaped = escaped.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/`([^`]+?)`/g, '<code>$1</code>');

    // 改行を<br>タグに変換
    return escaped.replace(/\n/g, '<br>');
  }

  // チャット履歴をクリア
  clearChatHistory() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (!messagesContainer) return;

    // 初期メッセージ以外をクリア
    const messages = messagesContainer.querySelectorAll('.aikw-message');
    messages.forEach((message, index) => {
      if (index > 0) { // 最初の挨拶メッセージは残す
        message.remove();
      }
    });

    // 会話IDをリセット
    this.conversationId = null;

    // 選択肢を再表示
    this.showQuestionOptions();
  }

  // タブコンテンツの展開
  expandTabContent(tabIndex) {
    const tabContent = document.getElementById('aikw-tab-content');
    const category = this.predefinedQuestions[tabIndex];

    if (!category || !tabContent) return;

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
    if (!tabContent) return;

    tabContent.classList.remove('expanded');
    tabContent.classList.add('collapsed');
    tabContent.innerHTML = '';
  }

  // タブイベントをバインド
  bindTabEvents() {
    const tabButtons = document.querySelectorAll('.aikw-tab-btn');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabIndex = parseInt(button.getAttribute('data-tab'));
        const tabContent = document.getElementById('aikw-tab-content');
        const isCurrentlyExpanded = tabContent && tabContent.classList.contains('expanded') && this.currentTab === tabIndex;

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

  // 全カテゴリを折りたたみ
  collapseAllCategories() {
    this.currentTab = 0;
    const tabButtons = document.querySelectorAll('.aikw-tab-btn');

    // アクティブタブをリセット
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // コンテンツを折りたたみ状態に
    this.collapseTabContent();
  }

  // チャット履歴の最下部にスクロール（最新のメッセージを表示）
  scrollToBottom() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (messagesContainer) {
      // スムーズスクロールで最新メッセージを表示
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
  
  // ユーザーメッセージを強調表示するために最新メッセージにフォーカス
  scrollToLatestMessage() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (messagesContainer) {
      const messages = messagesContainer.querySelectorAll('.aikw-message');
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage) {
        // 最新メッセージが見える位置までスクロール
        latestMessage.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }
    }
  }
  
  // ユーザーメッセージをウィンドウ最上部に固定表示
  scrollUserMessageToTop() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (messagesContainer) {
      const messages = messagesContainer.querySelectorAll('.aikw-message');
      const latestMessage = messages[messages.length - 1];
      
      if (latestMessage) {
        // ユーザーメッセージの位置を取得
        const messageOffsetTop = latestMessage.offsetTop;
        
        // メッセージをコンテナの最上部に配置
        messagesContainer.scrollTo({
          top: messageOffsetTop,
          behavior: 'smooth'
        });
      }
    }
  }
}

// DOMが読み込まれたらチャットボットを初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    const chatbot = new AIKWChatbot();
    window.aikwChatbot = chatbot;
  } catch (error) {
    // 初期化失敗時も基本UIは表示される
  }
});