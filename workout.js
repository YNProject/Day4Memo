$(function() {
  // 日付表示
  const now = new Date();
  $("#date-display").text("現在の日付: " + now.toLocaleString());

  // 回数プルダウン生成（1～100）
  const countSelect = $("#count");
  for (let i = 1; i <= 100; i++) {
    countSelect.append(`<option value="${i}">${i}回</option>`);
  }

  // 1日分の目標値
  const dailyRaceGoals = {
    "オーシャンS": { pushup: 30, squat: 30, pullup: 10, legraise: 40, calf: 30 },
    "中京記念": { pushup: 30, squat: 40, pullup: 10, legraise: 30, calf: 40 },
    "新潟記念": { pushup: 40, squat: 30, pullup: 10, legraise: 30, calf: 30 },
    "京都記念": { pushup: 50, squat: 50, pullup: 10, legraise: 50, calf: 50 },
    "京王杯スプリングC": { pushup: 60, squat: 50, pullup: 10, legraise: 40, calf: 50 },
    "ステイヤーズS": { pushup: 40, squat: 60, pullup: 10, legraise: 50, calf: 60 },
    "日本ダービー": { pushup: 70, squat: 100, pullup: 20, legraise: 80, calf: 120 },
    "マイルチャンピオンシップ": { pushup: 90, squat: 80, pullup: 20, legraise: 90, calf: 90 },
    "有馬記念": { pushup: 80, squat: 100, pullup: 20, legraise: 80, calf: 100 }
  };

  // 進捗データ（累計）
  let progress = { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };

  // Chart.js レーダーチャート用変数
  let chart;

  // 共通：画像＋セリフ切り替え関数
  function switchTrainerGif(message) {
    $(".speech-below").text(message);
    $("#trainer-image").attr("src", "movie/trainergif.gif");
    setTimeout(() => {
      $("#trainer-image").attr("src", "img/trainer1.png");
      // 🟡 レース設定済みかどうかを判定
      const raceName = localStorage.getItem("selectedRace");
      if (raceName) {
        $(".speech-below").text("目標レースまでもう少し！頑張ろう！");
      } else {
        $(".speech-below").text("目標レースを設定しましょう！");
      }
    }, 3000);
  }

  // レーダーチャート更新関数
  function updateChart(raceGoals, progress) {
    const labels = ["腕立て", "スクワット", "懸垂", "レッグレイズ", "カーフ"];
    const keyMap = {
      "腕立て": "pushup",
      "スクワット": "squat",
      "懸垂": "pullup",
      "レッグレイズ": "legraise",
      "カーフ": "calf"
    };

    const targetData = labels.map(l => raceGoals[keyMap[l]] || 0);
    const currentData = labels.map(l => progress[keyMap[l]] || 0);

    const data = {
      labels: labels,
      datasets: [
        {
          label: "目標値",
          data: targetData,
          borderColor: "blue",
          backgroundColor: "rgba(0,0,255,0.2)"
        },
        {
          label: "現在値",
          data: currentData,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.2)"
        }
      ]
    };

    const config = {
      type: "radar",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              display: false,
              color: "#fff",
              font: { size: 12, weight: "bold" }
            },
            pointLabels: {
              color: "#fff",
              font: { size: 16 },
              callback: function(label) {
                const key = keyMap[label];
                const target = raceGoals[key] || 0;
                const current = progress[key] || 0;
                const percent = target > 0 ? Math.floor((current / target) * 100) : 0;
                return `${label} (${percent}% ${current}/${target})`;
              }
            },
            grid: {
              color: "rgba(255, 255, 255, 1)"
            },
            angleLines: {
              color: "rgba(255, 255, 255, 1)"
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("progressChart"), config);
  }

  // レース選択処理
  $("#race-form").on("submit", function(e) {
    e.preventDefault();
    const raceName = $("#race").val();
    const days = parseInt($("#days").val());
    const dailyGoals = dailyRaceGoals[raceName];

    const raceGoals = {};
    for (const menu in dailyGoals) {
      raceGoals[menu] = dailyGoals[menu] * days;
    }

    const currentDate = new Date();
    const raceEnd = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    localStorage.setItem("selectedRace", raceName);
    localStorage.setItem("raceDays", days);
    localStorage.setItem("raceGoals", JSON.stringify(raceGoals));
    localStorage.setItem("raceEnd", raceEnd.toISOString());

    // レース終了日を表示
    const formatted = raceEnd.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    });
    $("#race-date-display").text(`→ レース日: ${formatted}`);

    switchTrainerGif("目標レースが決まったね！頑張ろう！");
    updateChart(raceGoals, progress);
  });

  // 運動記録処理
  $("#workout-form").on("submit", function(e) {
    e.preventDefault();
    const menu = $("#menu").val();
    const count = parseInt($("#count").val());

    progress[menu] = (progress[menu] || 0) + count;
    const raceGoals = JSON.parse(localStorage.getItem("raceGoals")) || {};

    // ログ追加
    const timestamp = new Date().toLocaleString("ja-JP");
    const menuLabel = $("#menu option:selected").text();
    $("#log-list").prepend(
      `<div class="log-entry">${timestamp}　${menuLabel}　${count}回</div>`
    );

    switchTrainerGif("トレーニングお疲れ様！レースまでもう少し頑張ろう！");
    updateChart(raceGoals, progress);
  });

  // 初期表示（空グラフ）
  updateChart({}, progress);
});
