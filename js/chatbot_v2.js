// chatbot_v2.js - AIナレッジワークス 会社概要専用チャットボット（選択肢ベース）
class AIKWCompanyChatbot {
  constructor() {
    this.isOpen = false;
    this.currentQuestionId = 'welcome';
    this.lastClickTime = 0;
    this.clickCooldown = 500; // 500ms のクールダウン時間
    this.lastClickedOption = null; // 最後にクリックしたオプションを記録
    
    // 会社概要に特化した質問・回答データベース
    this.questionDatabase = {
      'welcome': {
        answer: 'こんにちは！AIナレッジワークス合同会社について、どちらについてお知りになりたいですか？',
        options: [
          { id: 'company-overview', text: '会社の基本情報' },
          { id: 'philosophy', text: '経営理念・ビジョン' },
          { id: 'staff', text: '社員紹介' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' }
        ]
      },
      
      // 会社の基本情報
      'company-overview': {
        answer: `
**AIナレッジワークス合同会社** は、**"好き"を信じ合える運命共同体**です。

私たちは大阪を拠点として、AI技術の普及と活用支援に取り組んでいます。本店住所は**大阪府大阪市浪速区湊町2丁目2番5号 2119号室**、資本金は**10万円**、**2025年4月16日**設立です。

社員は**3名**で、内堀代表、会長（元・理研研究員）、康平くん（天才エンジニア）の異なるバックグラウンドを3人が「**AIでエリート専用の武器を大衆の手に届ける**」という一点でタッグを組んでいます。`,
        options: [
          { id: 'company-basic', text: '会社名・所在地・資本金' },
          { id: 'company-purpose', text: '事業目的' },
          { id: 'company-members', text: '社員数・組織構成' },
          { id: 'back-to-main', text: 'メインメニューに戻る' }
        ]
      },
      
      'company-basic': {
        answer: `
**会社名**: AIナレッジワークス合同会社
**本店住所**: 大阪府大阪市浪速区湊町2丁目2番5号 2119号室
**資本金**: 10万円
**設立**: 2025年4月16日

私たちは大阪を拠点として、AI技術の普及と活用支援に取り組んでいます。`,
        options: [
          { id: 'company-purpose', text: '事業目的について詳しく' },
          { id: 'company-members', text: '社員構成について' },
          { id: 'company-overview', text: '会社基本情報メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'company-purpose': {
        answer: `
当社の事業目的は以下の通りです：

**主要事業**:
• AI技術を活用したソフトウェア及びシステムの研究、企画、開発、販売、保守及びコンサルティング
• AIを活用した教育、研修、セミナー及びコンサルティング業務
• AI・データ分析を活用した市場調査及びコンサルティング業務

私たちは「**"好き"を信じ合える運命共同体を育てる**」という理念のもと、AI技術を通じて個人と企業の自己実現を支援しています。`,
        options: [
          { id: 'philosophy', text: '経営理念について詳しく' },
          { id: 'why-choose', text: 'なぜ当社を選ぶべきか' },
          { id: 'company-overview', text: '会社基本情報メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'company-members': {
        answer: `
**社員数**: 3名

**組織構成**:
• **内堀 善史** - 代表社員（社長）
• **会長** - 博士号を持つ元・理化学研究所研究員
• **康平くん** - 特別顧問・天才エンジニア（Finding AIサークル代表）

まったく毛色の違う3人が、「**AIでエリート専用の武器を大衆の手に届ける**」という一点でタッグを組んでいます。`,
        options: [
          { id: 'staff', text: '社員紹介について詳しく' },
          { id: 'uchibori-story', text: '内堀代表の経歴' },
          { id: 'company-overview', text: '会社基本情報メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      // 経営理念・ビジョン
      'philosophy': {
        answer: `
**AIナレッジワークスの経営理念**

**ミッション**: 自己実現の大量生産 ─ 自分の**"好き"**が実現しまくる社会をつくる

**ビジョン**: "余裕"が連鎖する未来 ─ 誰もが**"好き"**を起点に生きられる世界

**コアバリュー**:
♥ **Self First** - まず自分を幸せに。その幸せを社会へ。
★ **Live from "好き"** - "やりたい"を人生の起点に。
? **Curiosity is Power** - 好奇心が可能性をひらく。
∞ **Be Fluid, Not Fixed** - 変わり続けることを恐れない。
⟳ **Go at Your Own Pace** - 速さより納得感。
✓ **Trust the Process** - 結果だけでなく、過程を信じる。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' },
          { id: 'company-overview', text: '会社の基本情報を見る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'mission': {
        answer: `
**ミッション**: 自己実現の大量生産 ─ 自分の**"好き"**が実現しまくる社会をつくる

私たちは、AI技術を活用することで、一人ひとりが自分の**"好き"**なことを実現できる社会の構築を目指しています。

従来はエリート層だけが持てた強力なツールを、AI技術を通じて多くの人が使えるようにし、誰もが自己実現できる世界を作ることが私たちの使命です。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' },
          { id: 'philosophy', text: '経営理念メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'vision': {
        answer: `
**ビジョン**: "余裕"が連鎖する未来 ─ 誰もが**"好き"**を起点に生きられる世界

私たちが目指すのは、AI技術によって業務効率が飛躍的に向上し、人々に「余裕」が生まれる未来です。

その「余裕」が次の人の「余裕」を生み出し、連鎖的に広がることで、誰もが自分の**"好き"**なことを起点として生きられる世界を実現したいと考えています。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' },
          { id: 'philosophy', text: '経営理念メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'core-values': {
        answer: `
私たちのコアバリュー（価値観）：

**♥ Self First** - まず自分を幸せに。その幸せを社会へ。
**★ Live from "好き"** - "やりたい"を人生の起点に。
**? Curiosity is Power** - 好奇心が可能性をひらく。
**∞ Be Fluid, Not Fixed** - 変わり続けることを恐れない。
**⟳ Go at Your Own Pace** - 速さより納得感。
**✓ Trust the Process** - 結果だけでなく、過程を信じる。

これらの価値観を大切にして、お客様との関係性を築いています。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' },
          { id: 'philosophy', text: '経営理念メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      // 社員紹介
      'staff': {
        answer: `
**人生をかけてAI革命に挑む仲間たち**

**内堀 善史**（代表社員・社長）
テーマ: 視力0.02から見えた "AI革命"
20年間の零細企業経営で培った現場感覚と泥臭い営業力が強み。

**会長**（元・理化学研究所研究員）
博士号を持ち、10年以上AI研究に携わる本格的な研究者。学会から講演依頼が舞い込む「研究×実装」の求道者。

**康平くん**（特別顧問・天才エンジニア）
同志社大学理工学部出身。Finding AIサークル代表で、動画生成界隈で密かに有名。狂気のイケメン AI中毒者。`,
        options: [
          { id: 'uchibori-story', text: '内堀 善史（代表社員）' },
          { id: 'president', text: '会長（元・理研研究員）' },
          { id: 'kohei', text: '康平くん（天才エンジニア）' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'uchibori-story': {
        answer: `
**内堀 善史**（代表社員・社長）
テーマ: 視力0.02から見えた "AI革命"

2018年からAI学習に取り組むも、視力が右0.02/左0.03まで悪化し一度断念。しかし2024年、ChatGPTの威力を目の当たりにし、「視力を理由にAIを諦めるのは言い訳だ」と確信。

あらゆる生成AIツールを駆使し、「アイデアさえあれば視力なんて関係ない」ことを実証。20年間の零細企業経営で培った現場感覚と営業力が強みです。`,
        options: [
          { id: 'uchibori-journey', text: 'AI挑戦の詳しい経緯' },
          { id: 'uchibori-vision', text: '内堀代表の想い' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'uchibori-journey': {
        answer: `
**内堀代表のAI挑戦の軌跡**:

**2018年**: Aidemy全講座修了、ディープラーニングにのめり込むもケンブリッジ大学院生に個別指導を依頼するほど苦戦

**2024年**: デザイナーから「AIで仕事が9割削減、品質10倍向上」と聞き二重の衝撃

**2024年末〜**: ChatGPT、Midjourney、Claude等を使い倒し、イラスト生成から文章執筆まで"視力0.02"でも実現

**2025年1月**: 大阪の生成AIもくもく会で会長と運命的出会い

**2025年4月**: AIナレッジワークス設立`,
        options: [
          { id: 'uchibori-vision', text: '内堀代表の想い・メッセージ' },
          { id: 'president', text: '会長について' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'uchibori-vision': {
        answer: `
**内堀代表からのメッセージ**:

「AIツールの急激な進化は、**多数派が少数派のエリートに勝てる時代**を切り拓きつつあります。

• プログラミングができなくても、発想を形にできる
• 資本や学歴に頼らなくても、世界に挑戦できる

私たちは、この流れを本気で加速させるために人生を賭けています。

AIを"見て見ぬふり"するのは、今日で終わりにしませんか？
私たちと一緒に、次の歴史をつくりましょう。」`,
        options: [
          { id: 'president', text: '会長について詳しく' },
          { id: 'kohei', text: '康平くんについて詳しく' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'president': {
        answer: `
**会長**（元・理化学研究所研究員）

博士号を持ち、10年以上AI研究に携わる本格的な研究者。学会から講演依頼が舞い込む「研究×実装」の求道者です。

初対面で「そのうちプログラマーは不要になりますよ」とさらり。「AIで知の格差・資本格差をなくしたい」という志を持っています。

実は5年前にシングルマザーと駆け落ち婚して親と絶縁という破天荒エピソードも！`,
        options: [
          { id: 'kohei', text: '康平くんについて' },
          { id: 'uchibori-story', text: '内堀代表について' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'kohei': {
        answer: `
**康平くん**（特別顧問・天才エンジニア）

同志社大学理工学部出身（参画時2回生・当時20歳）。Finding AIサークル代表で、動画生成界隈で密かに有名。

モデル級のルックスとは裏腹に、AIの話になると"満月を見たオオカミ男"のごとく目が光るAI中毒者です（笑）

「技術も情熱も全部ぶっ込みます！」と二つ返事で参画。7月のNotion公式セミナーでは満員御礼&アンケート1位を獲得しました。`,
        options: [
          { id: 'team-synergy', text: '3人のチーム力について' },
          { id: 'uchibori-story', text: '内堀代表について' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'team-synergy': {
        answer: `
**3人のユニークなチームワーク**:

• **会長**: 学術的な研究力と深い洞察
• **康平くん**: 最新技術への感度と実装力
• **内堀**: 現場感覚と営業・経営経験

まったく毛色の違う3人が、「**AIでエリート専用の武器を大衆の手に届ける**」という一点で結束。

それぞれの強みを活かしながら、お客様に最適なAIソリューションを提供しています。`,
        options: [
          { id: 'why-choose', text: 'なぜ当社を選ぶべきか' },
          { id: 'philosophy', text: '経営理念について' },
          { id: 'staff', text: '社員紹介メニューに戻る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      // なぜ当社を選ぶのか
      'why-choose': {
        answer: `
**"好き"を起点としたAI活用支援**

**実践重視のアプローチ**: 単なる技術説明ではなく、実際の業務に即座に活用できる実践的な内容をお届けします。

**継続的なサポート**: 導入後も継続的にサポート。AI活用の定着から発展的な活用まで、長期的なパートナーとして伴走します。

**カスタマイズ対応**: 業界や企業規模、課題に応じて研修内容や導入支援をカスタマイズ。

**セキュアな環境構築**: 機密情報を扱う企業様にも安心。オンプレミス環境でのAI活用やセキュアな運用方法もご提案可能です。`,
        options: [
          { id: 'practical-approach', text: '実践重視のアプローチ' },
          { id: 'continuous-support', text: '継続的なサポート体制' },
          { id: 'customization', text: 'カスタマイズ対応' },
          { id: 'security', text: 'セキュアな環境構築' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'practical-approach': {
        answer: `
**実践重視のアプローチ**

単なる技術説明ではなく、実際の業務に即座に活用できる実践的な内容をお届けします。

• 受講後すぐに効果を実感していただけます
• 理論より実用性を重視した研修内容
• 現場で本当に使えるスキルの習得
• ROI（投資対効果）を重視した提案

「明日から使える」を合言葉に、実務に直結するAI活用法をお教えします。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'philosophy', text: '経営理念を見る' },
          { id: 'company-overview', text: '会社の基本情報を見る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'continuous-support': {
        answer: `
**継続的なサポート体制**

導入後も継続的にサポート。AI活用の定着から発展的な活用まで、長期的なパートナーとして伴走します。

• 導入後のフォローアップ
• 定期的な活用状況のチェック
• 新しいAIツールの情報提供
• 課題解決のための個別相談
• 社内AI活用の文化醸成支援

「導入して終わり」ではなく、継続的な成長を支援します。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'philosophy', text: '経営理念を見る' },
          { id: 'company-overview', text: '会社の基本情報を見る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'customization': {
        answer: `
**カスタマイズ対応**

業界や企業規模、課題に応じて研修内容や導入支援をカスタマイズ。お客様にとって最適なソリューションを提供します。

• 業界特有のニーズに対応
• 企業規模に応じた段階的導入
• 既存システムとの連携考慮
• 予算に応じた柔軟なプラン設計
• 社内リソースに合わせた実装支援

「一社一社、オーダーメイド」の精神で対応いたします。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'philosophy', text: '経営理念を見る' },
          { id: 'company-overview', text: '会社の基本情報を見る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      'security': {
        answer: `
**セキュアな環境構築**

機密情報を扱う企業様にも安心。オンプレミス環境でのAI活用やセキュアな運用方法もご提案可能です。

• オンプレミス環境でのAI導入支援
• セキュリティポリシーに準拠した運用設計
• 機密データを外部に送信しない仕組み構築
• 社内セキュリティ基準に適合した導入
• コンプライアンス対応の支援

「安全第一」で、お客様の大切な情報を守りながらAI活用を推進します。`,
        options: [
          { id: 'staff', text: '社員紹介を見る' },
          { id: 'philosophy', text: '経営理念を見る' },
          { id: 'company-overview', text: '会社の基本情報を見る' },
          { id: 'welcome', text: 'メインメニューに戻る' }
        ]
      },
      
      // 共通の戻るオプション
      'back-to-main': {
        answer: 'メインメニューに戻ります。どちらについてお知りになりたいですか？',
        options: [
          { id: 'company-overview', text: '会社の基本情報' },
          { id: 'philosophy', text: '経営理念・ビジョン' },
          { id: 'staff', text: '社員紹介' },
          { id: 'why-choose', text: 'なぜ当社を選ぶのか' }
        ]
      }
    };
    
    this.init();
  }

  // 初期化
  init() {
    try {
      this.createChatbotUI();
      this.bindEvents();
      this.showQuestion('welcome');
    } catch (error) {
      console.error('Chatbot initialization error:', error);
    }
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
            <!-- メッセージがここに動的に追加されます -->
          </div>

          <div id="aikw-question-options" class="aikw-question-options">
            <!-- 質問選択肢がここに動的に追加されます -->
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  }

  // イベントのバインド
  bindEvents() {
    const chatButton = document.getElementById('aikw-chatbot-button');
    const closeButton = document.getElementById('aikw-chatbot-close');
    const clearButton = document.getElementById('aikw-clear-chat');

    // チャットボタンクリック
    if (chatButton) {
      chatButton.addEventListener('click', () => this.toggleChatbot());
    }

    // 閉じるボタン
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeChatbot());
    }

    // 履歴削除ボタン
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        if (confirm('チャット履歴を削除してもよろしいですか？')) {
          this.clearChatHistory();
        }
      });
    }

    // 選択肢クリック
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('aikw-question-option-btn')) {
        e.stopPropagation(); // イベント伝播を停止
        e.preventDefault();
        const questionId = e.target.getAttribute('data-question-id');
        this.selectOption(questionId);
      }
    });

    // ウィンドウ外クリックで閉じる
    const chatWindow = document.getElementById('aikw-chatbot-window');
    document.addEventListener('click', (e) => {
      // オプションボタンのクリックは除外
      if (e.target.classList.contains('aikw-question-option-btn')) {
        return;
      }
      
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

  // 選択肢を選択
  selectOption(questionId) {
    // 重複クリック防止 - 短時間での連続クリックをブロック
    const currentTime = Date.now();
    if (currentTime - this.lastClickTime < this.clickCooldown) {
      console.log('重複クリックを検出しました。無視されます。');
      return;
    }
    
    // 同一オプションの連続クリック防止
    if (this.lastClickedOption === questionId) {
      console.log('同一オプションの連続クリックです。無視されます。');
      return;
    }
    
    this.lastClickTime = currentTime;
    this.lastClickedOption = questionId;
    
    // 連続クリック防止
    const optionsContainer = document.getElementById('aikw-question-options');
    if (optionsContainer) {
      const buttons = optionsContainer.querySelectorAll('.aikw-question-option-btn');
      buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      });
    }

    // ユーザーの選択を表示
    const selectedQuestion = this.findQuestionText(questionId);
    if (selectedQuestion) {
      this.addUserMessage(selectedQuestion);
    }

    // ボットの回答と次の選択肢を表示
    setTimeout(() => {
      this.showQuestion(questionId);
      
      // スクロール調整
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 300); // 少し遅延させて連続クリックを防止
  }

  // 質問IDから選択肢のテキストを取得
  findQuestionText(questionId) {
    for (const [key, data] of Object.entries(this.questionDatabase)) {
      const option = data.options?.find(opt => opt.id === questionId);
      if (option) {
        return option.text;
      }
    }
    return null;
  }

  // 質問を表示
  showQuestion(questionId) {
    const questionData = this.questionDatabase[questionId];
    if (!questionData) return;

    this.currentQuestionId = questionId;
    
    // ボットの回答を表示
    this.addBotMessage(questionData.answer);
    
    // 選択肢を表示
    this.showOptions(questionData.options);
  }

  // ユーザーメッセージを追加
  addUserMessage(message) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (!messagesContainer) return;

    const messageHTML = `
      <div class="aikw-message aikw-user-message">
        <div class="aikw-message-content">
          ${this.formatMessage(message)}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
  }

  // ボットメッセージを追加
  addBotMessage(message) {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (!messagesContainer) return;

    const formattedMessage = this.formatMessage(message);
    const messageHTML = `
      <div class="aikw-message aikw-bot-message aikw-new-message">
        <div class="aikw-message-content">
          ${formattedMessage}
        </div>
      </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);

    // アニメーション後にクラス削除
    const newMessage = messagesContainer.lastElementChild;
    setTimeout(() => {
      newMessage.classList.remove('aikw-new-message');
    }, 2000);
  }

  // 選択肢を表示
  showOptions(options) {
    const optionsContainer = document.getElementById('aikw-question-options');
    if (!optionsContainer || !options) return;
    
    // 新しい選択肢が表示される時に前回のクリックオプションをリセット
    this.lastClickedOption = null;

    const optionsHTML = options.map(option => `
      <button class="aikw-question-option-btn" data-question-id="${option.id}" style="opacity: 1; cursor: pointer;">
        ${option.text}
      </button>
    `).join('');

    optionsContainer.innerHTML = `
      <div class="aikw-options-container">
        ${optionsHTML}
      </div>
    `;
    
    // ボタンの状態を正常化
    setTimeout(() => {
      const buttons = optionsContainer.querySelectorAll('.aikw-question-option-btn');
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      });
    }, 100);
  }

  // メッセージのフォーマット
  formatMessage(message) {
    // HTMLエスケープ
    let escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
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
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    
    // ウェルカムメッセージに戻る
    this.showQuestion('welcome');
  }

  // 最下部にスクロール
  scrollToBottom() {
    const messagesContainer = document.getElementById('aikw-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}

// DOMが読み込まれたらチャットボットを初期化（company.htmlのみ）
document.addEventListener('DOMContentLoaded', () => {
  // company.htmlでのみ動作するように制限
  const isCompanyPage = window.location.pathname.includes('company.html') || 
                       document.title.includes('会社概要');
  
  if (isCompanyPage) {
    try {
      const chatbot = new AIKWCompanyChatbot();
      window.aikwCompanyChatbot = chatbot;
      console.log('AIナレッジワークス 会社概要チャットボット初期化完了');
    } catch (error) {
      console.error('Company chatbot initialization failed:', error);
    }
  }
});
