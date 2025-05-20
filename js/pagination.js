// pagination.js
;(function () {
  /*───────────────────────────────────────────
   * ①  ページ一覧をここだけに定義
   *     追加・順序変更はこの配列を編集
   *───────────────────────────────────────────*/
  const pages = [
    "index.html",
    "02.html",
    // "03.html",
    // …
  ];

  /*───────────────────────────────────────────
   * ②  現在ページ名を取得
   *     ルート ( …/aikw.slide/ ) で開かれた場合は
   *     空文字 → 'index.html' に補正
   *───────────────────────────────────────────*/
  let current = location.pathname.split("/").pop();
  if (!current) current = "index.html";

  let idx = pages.indexOf(current);
  if (idx === -1) return;           // 配列に無ければ何もしない

  /*───────────────────────────────────────────
   * ③  キーボード左右でページ送り
   *───────────────────────────────────────────*/
  function go(delta) {
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= pages.length) return; // 範囲外は無視
    location.href = pages[nextIdx];
  }

  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":  // ←
      case "PageUp":
        go(-1);
        break;
      case "ArrowRight": // →
      case "PageDown":
        go(1);
        break;
      default:
        return;
    }
    e.preventDefault(); // デフォルトのスクロールなどを抑制
  }, { passive: false });

  /*───────────────────────────────────────────
   * ④  画面には何も挿入しない（ナビバー非表示）
   *───────────────────────────────────────────*/
})();
