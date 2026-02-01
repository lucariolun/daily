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
  const key = "time_" + formatDate(currentDate);
  const saved = JSON.parse(localStorage.getItem(key)) || {};

  const container = document.getElementById("time-container");
  container.innerHTML = "";

  // 2列レイアウト用のラッパー
  const row = document.createElement("div");
  row.className = "time-row";

  timeItems.forEach(name => {
    const minutes = saved[name] || 0;

    // 2列用の半分幅ボタン
    const wrapper = document.createElement("div");
    wrapper.className = "task-btn time-block half-width";

    const label = document.createElement("span");
    label.className = "time-label";
    label.textContent = name;

    const value = document.createElement("span");
    value.className = "time-value";
    value.textContent = `${minutes}分`;

    const plusBtn = document.createElement("button");
    plusBtn.className = "circle-btn plus";
    plusBtn.textContent = "＋";
    plusBtn.onclick = () => {
      saved[name] = (saved[name] || 0) + 10;
      localStorage.setItem(key, JSON.stringify(saved));
      loadTimeCounters();
    };

    const minusBtn = document.createElement("button");
    minusBtn.className = "circle-btn minus";
    minusBtn.textContent = "−";
    minusBtn.onclick = () => {
      saved[name] = Math.max(0, (saved[name] || 0) - 10);
      localStorage.setItem(key, JSON.stringify(saved));
      loadTimeCounters();
    };

    wrapper.appendChild(label);
    wrapper.appendChild(value);
    wrapper.appendChild(plusBtn);
    wrapper.appendChild(minusBtn);

    row.appendChild(wrapper);
  });

  container.appendChild(row);
}