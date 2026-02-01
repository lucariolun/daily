// ------------------------------
// タスク分類
// ------------------------------
const categories = {
  "プリント": ["算数", "国語", "右脳", "理科", "社会", "右脳ドリル", "算数ドリル"],
  "勉強系": ["宿題", "英単語", "子ども新聞", "読書", "将棋"],
  "その他": ["ピアノ", "カエル", "腹筋", "ストレッチ", "1分そうじ"]
};

const timeItems = ["テレビ", "Youtube", "ゲーム", "スマホ"];

const colors = {
  "プリント": "#AEE1F9",
  "勉強系": "#C7F5C4",
  "その他": "#FFF5B7"
};

// ------------------------------
// 日付管理
// ------------------------------
let currentDate = new Date();

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function renderDate() {
  const d = currentDate;
  const ymd = formatDate(d);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const w = weekdays[d.getDay()];

  document.getElementById("date").textContent = `${ymd}（${w}）`;
}

// ------------------------------
// タスク描画
// ------------------------------
function loadTasks() {
  const key = "tasks_" + formatDate(currentDate);
  const saved = JSON.parse(localStorage.getItem(key)) || {};

  const container = document.getElementById("task-container");
  container.innerHTML = "";

  const today = formatDate(new Date());
  const isPast = formatDate(currentDate) < today;

  for (const category in categories) {
    const color = colors[category];

    // ★ 分類ごとの横並びコンテナ
    const row = document.createElement("div");
    row.className = "category-row";

    categories[category].forEach(task => {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.style.background = color;

      const checked = saved[task] === true;

      btn.textContent = checked ? "✓" : task;
      if (checked) btn.classList.add("checked");
      if (isPast) btn.classList.add("past-day");

      btn.onclick = () => {
        if (isPast) return;
        saved[task] = !checked;
        localStorage.setItem(key, JSON.stringify(saved));
        loadTasks();
      };

      row.appendChild(btn);
    });

    container.appendChild(row);
  }
}

// ------------------------------
// スワイプ操作
// ------------------------------
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (diff > 80) {
    // 右スワイプ → 前日
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (diff < -80) {
    // 左スワイプ → 翌日
    currentDate.setDate(currentDate.getDate() + 1);
  }

  renderDate();
  loadTasks();
});

// ------------------------------
// 初期表示
// ------------------------------
renderDate();
loadTasks();
loadTimeCounters(); 

// ---------------------------------------------
// 時間カウンターを読み込んで表示する関数
// ・日付ごとに localStorage に保存
// ・1つの大きなボタンの中に「名前・時間・＋・−」を配置
// ---------------------------------------------
function loadTimeCounters() {
  // 今日の日付をキーにする（例：time_2026-02-01）
  const key = "time_" + formatDate(currentDate);

  // 保存されているデータを読み込む（なければ空オブジェクト）
  const saved = JSON.parse(localStorage.getItem(key)) || {};

  // 表示エリアを取得して中身を空にする
  const container = document.getElementById("time-container");
  container.innerHTML = "";

  // 各項目（テレビ・Youtube など）を順番に表示
  timeItems.forEach(name => {
    // 保存されている時間（分）を取得。なければ0分。
    const minutes = saved[name] || 0;

    // 1つの大きなボタン枠（task-btn と同じ見た目）
    const wrapper = document.createElement("div");
    wrapper.className = "task-btn time-block";

    // 左側：項目名（テレビなど）
    const label = document.createElement("span");
    label.className = "time-label";
    label.textContent = name;

    // 中央：現在の合計時間（例：30分）
    const value = document.createElement("span");
    value.className = "time-value";
    value.textContent = `${minutes}分`;

    // 右側：＋ボタン（10分増える）
    const plusBtn = document.createElement("button");
    plusBtn.className = "circle-btn plus";
    plusBtn.textContent = "＋";

    // ＋ボタンを押したときの処理
    plusBtn.onclick = () => {
      saved[name] = (saved[name] || 0) + 10; // 10分追加
      localStorage.setItem(key, JSON.stringify(saved)); // 保存
      loadTimeCounters(); // 再描画
    };

    // 右側：−ボタン（10分減る）
    const minusBtn = document.createElement("button");
    minusBtn.className = "circle-btn minus";
    minusBtn.textContent = "−";

    // −ボタンを押したときの処理
    minusBtn.onclick = () => {
      // 0分より下にはならないようにする
      saved[name] = Math.max(0, (saved[name] || 0) - 10);
      localStorage.setItem(key, JSON.stringify(saved)); // 保存
      loadTimeCounters(); // 再描画
    };

    // ボタン枠にパーツを追加
    wrapper.appendChild(label);
    wrapper.appendChild(value);
    wrapper.appendChild(plusBtn);
    wrapper.appendChild(minusBtn);

    // 全体の表示エリアに追加
    container.appendChild(wrapper);
  });
}
