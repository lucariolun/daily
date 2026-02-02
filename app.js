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

// UTCズレ防止のために手動フォーマット
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderDate() {
  const d = currentDate;
  const ymd = formatDate(d);

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const w = weekdays[d.getDay()];

  document.getElementById("date").textContent = `${ymd}（${w}）`;
}

// ------------------------------
// ★ 過去30日＋当日の達成を集計
// ------------------------------
function getMonthlyStars(taskName) {
  const stars = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) { // ← 当日も含める
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const key = "tasks_" + formatDate(d);
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    if (saved[taskName]) {
      stars.push("★");
    }
  }

  return stars.reverse(); // 古い順に並べる
}

// ------------------------------
// タスク描画（★つき）
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

    const row = document.createElement("div");
    row.className = "category-row";

    categories[category].forEach(task => {
      const btn = document.createElement("button");
      btn.className = "task-btn";
      btn.style.background = color;
      btn.style.position = "relative"; // ★を中に置くため

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

      // ★の表示
      const stars = getMonthlyStars(task);
      const starRow = document.createElement("div");
      starRow.className = "star-row";
      starRow.style.position = "absolute";
      starRow.style.top = "-20px";
      starRow.style.left= "0";
      //starRow.style.left = "50%";
      //starRow.style.transform = "translateX(-50%)";

      stars.forEach(() => {
        const span = document.createElement("span");
        span.textContent = "★";
        span.style.color = color;
        starRow.appendChild(span);
      });

      btn.appendChild(starRow);
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
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (diff < -80) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  renderDate();
  loadTasks();
  loadTimeCounters();
});

// ------------------------------
// 初期表示
// ------------------------------
renderDate();
loadTasks();
loadTimeCounters();

// ---------------------------------------------
// 時間カウンター
// ---------------------------------------------
function loadTimeCounters() {
  const key = "time_" + formatDate(currentDate);
  const saved = JSON.parse(localStorage.getItem(key)) || {};

  const container = document.getElementById("time-container");
  container.innerHTML = "";

  const row = document.createElement("div");
  row.className = "time-row";

  timeItems.forEach(name => {
    const minutes = saved[name] || 0;

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