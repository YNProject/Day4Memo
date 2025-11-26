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
    "オーシャンS": { pushup: 20, squat: 20, pullup: 10, legraise: 20, calf: 30 },
    "中京記念": { pushup: 30, squat: 20, pullup: 10, legraise: 30, calf: 40 },
    "新潟記念": { pushup: 20, squat: 30, pullup: 20, legraise: 20, calf: 20 },
    "京都記念": { pushup: 40, squat: 40, pullup: 40, legraise: 40, calf: 40 },
    "京王杯スプリングC": { pushup: 80, squat: 30, pullup: 20, legraise: 30, calf: 30 },
    "ステイヤーズS": { pushup: 20, squat: 100, pullup: 50, legraise: 20, calf: 100 },
    "日本ダービー": { pushup: 70, squat: 120, pullup: 70, legraise: 100, calf: 120 },
    "マイルチャンピオンシップ": { pushup: 120, squat: 70, pullup: 120, legraise: 70, calf: 70 },
    "有馬記念": { pushup: 100, squat: 100, pullup: 100, legraise: 100, calf: 100 }
  };

  // 進捗データ（累計）
  let progress = { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };
  let chart;
  let isRaceResultShown = false; // レース結果表示中フラグ

  // 馬名取得・保存
  function getHorseName() {
    return localStorage.getItem("horseName") || "";
  }
  $("#horse-name").on("change", function() {
    const name = $(this).val().trim();
    localStorage.setItem("horseName", name);
  });

  // セリフ表示（馬名呼び掛け形式）
  function speakWithHorse(message) {
    const horseName = getHorseName();
    if (horseName) {
      $(".speech-below").text(`${horseName}！${message}`);
    } else {
      $(".speech-below").text(message);
    }
  }

  // trainer画像＋セリフ切り替え（結果表示中は無効）
  function switchTrainerGif(message) {
    if (isRaceResultShown) return;
    speakWithHorse(message);
    $("#trainer-image").attr("src", "movie/trainergif.gif");
    setTimeout(() => {
      if (isRaceResultShown) return;
      $("#trainer-image").attr("src", "img/trainer1.png");
    }, 3000);
  }

  // レーダーチャート更新
  function updateChart(raceGoals, progress) {
    const labels = ["腕立て", "スクワット", "懸垂", "レッグレイズ", "カーフ"];
    const keyMap = { "腕立て": "pushup", "スクワット": "squat", "懸垂": "pullup", "レッグレイズ": "legraise", "カーフ": "calf" };
    const targetData = labels.map(l => raceGoals[keyMap[l]] || 0);
    const currentData = labels.map(l => progress[keyMap[l]] || 0);

    const data = {
      labels: labels,
      datasets: [
        { label: "目標値", data: targetData, borderColor: "blue", backgroundColor: "rgba(0,0,255,0.2)" },
        { label: "現在値", data: currentData, borderColor: "red", backgroundColor: "rgba(255,0,0,0.2)" }
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
            ticks: { display: false },
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
            grid: { color: "rgba(255,255,255,1)" },
            angleLines: { color: "rgba(255,255,255,1)" }
          }
        },
        plugins: { legend: { display: false } }
      }
    };

    if (chart) chart.destroy();
    chart = new Chart(document.getElementById("progressChart"), config);
  }

  // 戦績保存＆表示
  function saveRaceResult(raceName, resultText) {
    const history = JSON.parse(localStorage.getItem("raceHistory")) || [];
    const timestamp = new Date().toLocaleString("ja-JP");
    const horseName = getHorseName();
    history.unshift({ date: timestamp, race: raceName, horse: horseName, result: resultText });
    localStorage.setItem("raceHistory", JSON.stringify(history));
    renderHistory();
  }
  function renderHistory() {
    const history = JSON.parse(localStorage.getItem("raceHistory")) || [];
    $("#history-list").empty();
    history.forEach(entry => {
      $("#history-list").append(
        `<div class="history-entry">${entry.date}　${entry.horse || "馬名未設定"}　${entry.race}　${entry.result}</div>`
      );
    });
  }

  // 出走取り消しボタン（運動ログのみリセット）
  $("#reset-button").on("click", function() {
    localStorage.removeItem("progress");
    localStorage.removeItem("workoutLogs");
    progress = { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };
    $("#log-list").empty();
    updateChart(JSON.parse(localStorage.getItem("raceGoals")) || {}, progress);
    speakWithHorse("運動ログをリセットしました。レース設定や戦績は残っています！");
  });

  // 戦績リセットボタン（すべてリセット）
  $("#history-reset-button").on("click", function() {
    localStorage.clear();
    progress = { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };
    $("#log-list").empty();
    $("#history-list").empty();
    $("#race-date-display").text("");
    $("#horse-name").val("");
    updateChart({}, progress);
    $("#race-button").show();
    $("#next-race-button").hide();
    isRaceResultShown = false;
    $("#race-form :input").prop("disabled", false);
    $("#workout-form :input").prop("disabled", false);
    $("#reset-button").prop("disabled", false);
    $("#horse-name").prop("disabled", false);
    speakWithHorse("戦績をリセットしました。新しい挑戦を始めましょう！");
  });

  // レース選択処理
  $("#race-form").on("submit", function(e) {
    e.preventDefault();
    const raceName = $("#race").val();
    const days = parseInt($("#days").val());
    const dailyGoals = dailyRaceGoals[raceName];
    const raceGoals = {};
    for (const menu in dailyGoals) raceGoals[menu] = dailyGoals[menu] * days;

    const currentDate = new Date();
    const raceEnd = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    localStorage.setItem("selectedRace", raceName);
    localStorage.setItem("raceDays", days);
    localStorage.setItem("raceGoals", JSON.stringify(raceGoals));
    localStorage.setItem("raceEnd", raceEnd.toISOString());

    const formatted = raceEnd.toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric",weekday:"short"});
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
    localStorage.setItem("progress", JSON.stringify(progress));

    const raceGoals = JSON.parse(localStorage.getItem("raceGoals")) || {};
    const timestamp = new Date().toLocaleString("ja-JP");
    const menuLabel = $("#menu option:selected").text();
    const entry = `${timestamp}　${menuLabel}　${count}回`;
    $("#log-list").prepend(`<div class="log-entry">${entry}</div>`);

    const logs = JSON.parse(localStorage.getItem("workoutLogs")) || [];
    logs.unshift(entry);
    localStorage.setItem("workoutLogs", JSON.stringify(logs));

    switchTrainerGif("トレーニングお疲れ様！レースまでもう少し頑張ろう！");
    updateChart(raceGoals, progress);
  });

  // レース出走ボタン
  $("#race-button").on("click", function() {
    const raceGoals = JSON.parse(localStorage.getItem("raceGoals"));
    const raceName = localStorage.getItem("selectedRace");
    if (!raceGoals) {
      speakWithHorse("まずは目標レースを設定してください！");
      return;
    }

    let allClear = true;
    let allOver105 = true;

    for (const key in raceGoals) {
      const goal = raceGoals[key];
      const actual = progress[key] || 0;
      if (actual < goal) allClear = false;
      if (actual <= goal * 1.05) allOver105 = false;
    }

    let resultText = "";
    if (allOver105) {
      resultText = "完璧な仕上がり！見事1着！";
    } else if (allClear) {
      resultText = "しっかり仕上がったね！3着以内に入ったよ！";
    } else {
      const rank = Math.floor(Math.random() * 15) + 4; // 4〜18着
      resultText = `仕上がり不足…残念ながら${rank}着でした。`;
    }

    speakWithHorse(resultText);
    isRaceResultShown = true;
    $("#race-button").hide();
    $("#next-race-button").show();

    // 戦績保存
    saveRaceResult(raceName, resultText);

    // 出走後はフォームを無効化
    $("#race-form :input").prop("disabled", true);
    $("#workout-form :input").prop("disabled", true);
    $("#reset-button").prop("disabled", true);
    $("#horse-name").prop("disabled", true);

    // 出走済みフラグ＋セリフ保存
    localStorage.setItem("raceFinished", "true");
    localStorage.setItem("raceResultText", resultText);
  });

  // 「次のレースへ」ボタンでリセット
  $("#next-race-button").on("click", function() {
    localStorage.removeItem("selectedRace");
    localStorage.removeItem("raceDays");
    localStorage.removeItem("raceGoals");
    localStorage.removeItem("raceEnd");
    progress = { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };
    localStorage.removeItem("progress");
    localStorage.removeItem("workoutLogs");
    $("#log-list").empty();
    $("#race-date-display").text("");
    speakWithHorse("次の目標レースを設定しましょう！");
    updateChart({}, progress);

    $("#race-button").show();
    $("#next-race-button").hide();
    isRaceResultShown = false;

    // フォームを再び有効化
    $("#race-form :input").prop("disabled", false);
    $("#workout-form :input").prop("disabled", false);
    $("#reset-button").prop("disabled", false);
    $("#horse-name").prop("disabled", false);

    // 出走済みフラグ＋セリフ削除
    localStorage.removeItem("raceFinished");
    localStorage.removeItem("raceResultText");
  });

  // ページ読み込み時の復元処理
  const savedRaceGoals = JSON.parse(localStorage.getItem("raceGoals")) || {};
  const savedProgress = JSON.parse(localStorage.getItem("progress")) || { pushup: 0, squat: 0, pullup: 0, legraise: 0, calf: 0 };
  progress = savedProgress;
  updateChart(savedRaceGoals, progress);

  const savedLogs = JSON.parse(localStorage.getItem("workoutLogs")) || [];
  savedLogs.forEach(entry => {
    $("#log-list").append(`<div class="log-entry">${entry}</div>`);
  });

  renderHistory();

  // レース選択復元
  const savedRace = localStorage.getItem("selectedRace");
  if (savedRace) {
    $("#race").val(savedRace);
  }

  // 馬名復元
  const savedHorseName = localStorage.getItem("horseName");
  if (savedHorseName) {
    $("#horse-name").val(savedHorseName);
  }

  // レース日復元
  const raceEndStr = localStorage.getItem("raceEnd");
  if (raceEndStr) {
    const raceEnd = new Date(raceEndStr);
    const formatted = raceEnd.toLocaleDateString("ja-JP", {
      year: "numeric", month: "long", day: "numeric", weekday: "short"
    });
    $("#race-date-display").text(`→ レース日: ${formatted}`);

    const now = new Date();
    if (now >= raceEnd) {
      speakWithHorse("レース日になりました！出走ボタンを押して結果を確認しましょう！");
    } else {
      speakWithHorse("目標レースまでもう少し！頑張ろう！");
    }
  } else {
    speakWithHorse("目標レースを設定しましょう！");
  }

  // 出走済み状態の復元
  const raceFinished = localStorage.getItem("raceFinished");
  if (raceFinished) {
    const resultText = localStorage.getItem("raceResultText");
    if (resultText) speakWithHorse(resultText);

    $("#race-form :input").prop("disabled", true);
    $("#workout-form :input").prop("disabled", true);
    $("#reset-button").prop("disabled", true);
    $("#horse-name").prop("disabled", true);
    $("#race-button").hide();
    $("#next-race-button").show();
    isRaceResultShown = true;
  }
});
