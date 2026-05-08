/* slide-nav.js ───────────────────────────────────────────
   - ページ送りは「← / → キー」または「右下 Back / Next ボタン」のみ
   - 画面をタップ／クリックしてもページ送りしない（誤作動防止）
   - 縦横スクロールは PC / モバイル共通で自由
   - HTML 変更不要。JS だけで UI を注入
   - PDF変換機能（ブラウザの印刷機能を使用）
   ------------------------------------------------------ */


(() => {
  /* ===== スライド定義 ===== */
  const slides = ["AppDev_01.html", "AppDev_02.html", "AppDev_03.html", "AppDev_04.html", "AppDev_05.html", "AppDev_06.html", "AppDev_07.html", "AppDev_08.html", "AppDev_09.html", "AppDev_10.html"];

  /* ===== 現在ページを判定（末尾 / のアクセスも index.html 扱い） ===== */
  let curName = location.pathname.split("/").pop();
  if (!curName || !curName.includes(".")) curName = "index.html";
  const curIdx = slides.indexOf(curName);

  const goTo = (i) => {
    if (i < 0 || i >= slides.length) return;       // 範囲外は無視
    const dir = location.pathname.replace(/[^/]*$/, "");
    location.href = dir + slides[i];
  };

  /* ── キーボード ← / → ───────────────────────────── */
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(curIdx + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); goTo(curIdx - 1); }
  });

  /* ── スクロール許可（縦横とも）────────────────────── */
  const html = document.documentElement;
  html.style.overflowX = "auto";
  html.style.overflowY = "auto";
  const body = document.body;
  body.style.overflowX = "auto";
  body.style.overflowY = "auto";

  /* ===== viewport メタタグ（モバイル最適化＋ピンチズーム許可） ===== */
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=0.25, user-scalable=yes";
    document.head.appendChild(meta);
  }

  /* ===== 右下 Back / Next ボタン＋ズーム＋PDF追加 ===== */
  const navBox = document.createElement("div");
  navBox.innerHTML = `
    <button id="gs-back">Back</button>
    <button id="gs-next">Next</button>
    <button id="gs-zoom-in" title="拡大">＋</button>
    <button id="gs-zoom-out" title="縮小">−</button>
    <button id="gs-pdf-download" title="このページをPDF">📄</button>
  `;
  Object.assign(navBox.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    display: "flex",
    gap: "8px",
    zIndex: 9999,
    pointerEvents: "auto",
  });

  /* ボタン基本スタイル + 印刷用CSS */
  const css = `
    #gs-back, #gs-next, #gs-zoom-in, #gs-zoom-out, #gs-pdf-download {
      padding: 8px 14px;
      font: 14px/1 sans-serif;
      border: 1px solid #666;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      opacity: .85;
      touch-action: manipulation;
    }
    #gs-back:hover, #gs-next:hover, #gs-zoom-in:hover, #gs-zoom-out:hover, #gs-pdf-download:hover { opacity: 1; }
    #gs-pdf-download { background: #007bff; color: white; }
    #gs-pdf-download:disabled { background: #ccc; cursor: not-allowed; }
    
    /* 印刷用CSS */
    @media print {
      /* ナビゲーションボタンを非表示 */
      [style*="position: fixed"] {
        display: none !important;
      }
      
      /* ページサイズとマージンを設定 */
      @page {
        size: 1280px 720px;
        margin: 0;
      }
      
      /* body全体の設定 */
      body {
        margin: 0;
        padding: 0;
        width: 1280px;
        height: 720px;
        overflow: hidden;
        transform: none !important;
        transform-origin: unset !important;
        min-width: unset !important;
      }
      
      html {
        overflow: hidden;
        min-width: unset !important;
      }
      
      /* スライドコンテナの設定 */
      .slide-container {
        width: 1280px !important;
        height: 720px !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      /* ズーム効果をリセット */
      * {
        transform: none !important;
        zoom: 1 !important;
      }
      
      /* 全スライド表示用のスタイル */
      .all-slides-container {
        width: 1280px !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .all-slides-container .slide-page {
        width: 1280px !important;
        height: 720px !important;
        margin: 0 !important;
        padding: 0 !important;
        page-break-after: always;
        overflow: hidden !important;
      }
      
      .all-slides-container .slide-page:last-child {
        page-break-after: avoid;
      }
  `;
  const styleTag = document.createElement("style");
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* クリックイベントはバブリングさせず誤作動を回避 */
  navBox.addEventListener("click", (e) => e.stopPropagation());
  document.body.appendChild(navBox);

  document.getElementById("gs-back").addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(curIdx - 1);
  });
  document.getElementById("gs-next").addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(curIdx + 1);
  });

  // --- ここからズーム制御だけ追加 ---
  let zoom = 1.0;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.0;
  const ZOOM_STEP = 0.1;

function applyZoom() {
  document.body.style.transform = `scale(${zoom})`;
  document.body.style.transformOrigin = "0 0";
  // ★ スライドの本体ラッパーを優先して取得（.slide > #main > body）
  const slideElem =
    document.querySelector('.slide') ||
    document.getElementById('main') ||
    document.body;

  const slideWidth = slideElem.scrollWidth;
  document.body.style.minWidth = (slideWidth * zoom) + "px";
  document.documentElement.style.minWidth = (slideWidth * zoom) + "px";
}

  document.getElementById("gs-zoom-in").addEventListener("click", (e) => {
    e.stopPropagation();
    if (zoom < ZOOM_MAX) {
      zoom = Math.round((zoom + ZOOM_STEP) * 100) / 100;
      if (zoom > ZOOM_MAX) zoom = ZOOM_MAX;
      applyZoom();
    }
  });

  document.getElementById("gs-zoom-out").addEventListener("click", (e) => {
    e.stopPropagation();
    if (zoom > ZOOM_MIN) {
      zoom = Math.round((zoom - ZOOM_STEP) * 100) / 100;
      if (zoom < ZOOM_MIN) zoom = ZOOM_MIN;
      applyZoom();
    }
  });
  // --- ズーム追加はここまで ---

  // --- PDF変換機能 ---

  // Print API を使用したPDF生成機能（単体スライド）
  const generatePDF = () => {
    const pdfButton = document.getElementById('gs-pdf-download');
    pdfButton.disabled = true;
    
    // 現在のスライド番号を取得
    const currentSlideNum = slides.indexOf(location.pathname.split("/").pop()) + 1;
    
    // 印刷用のタイトルを設定
    const originalTitle = document.title;
    document.title = `AppDev_slide_${currentSlideNum.toString().padStart(2, '0')}`;
    
    // 印刷ダイアログを開く
    window.print();
    
    // タイトルを元に戻す
    setTimeout(() => {
      document.title = originalTitle;
      pdfButton.disabled = false;
    }, 1000);
  };



  // PDFダウンロードボタンのイベントリスナー
  document.getElementById("gs-pdf-download").addEventListener("click", (e) => {
    e.stopPropagation();
    generatePDF();
  });


})();
