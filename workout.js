$(function() {
  // 日付表示
  const now = new Date();
  $("#date-display").text("現在の日付: " + now.toLocaleString());

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

  // レース選択処理
  $("#race-form").on("submit", function(e) {
    e.preventDefault();
    const raceName = $("#race").val();
    const days = parseInt($("#days").val());

    const dailyGoals = dailyRaceGoals[raceName];

    // 日数に応じた目標値を保存
    const raceGoals = {};
    for (const menu in dailyGoals) {
      raceGoals[menu] = dailyGoals[menu] * days;
    }

    localStorage.setItem("selectedRace", raceName);
    localStorage.setItem("raceDays", days);
    localStorage.setItem("raceGoals", JSON.stringify(raceGoals));

    // レース終了日時
    const now = new Date();
    const raceEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    localStorage.setItem("raceEnd", raceEnd.toISOString());

    // 表示
    let goalText = `【${raceName} の目標 (${days}日分)】\n`;
    for (const menu in raceGoals) {
      goalText += `${menu}: ${raceGoals[menu]}回\n`;
    }
    goalText += `\nレース終了日時: ${raceEnd.toLocaleString()}`;
    $("#result").text(goalText);
  });

  // 運動記録処理
  $("#workout-form").on("submit", function(e) {
    e.preventDefault();
    const menu = $("#menu").val();
    const count = parseInt($("#count").val());

    // 累計更新
    progress[menu] = (progress[menu] || 0) + count;

    // 目標値を取得
    const raceGoals = JSON.parse(localStorage.getItem("raceGoals")) || {};

    // 表示テキスト作成
    let resultText = `今回: ${menu} を ${count} 回 記録しました！\n\n`;
    resultText += "【進捗状況】\n";

    for (const m in progress) {
      const done = progress[m];
      const target = raceGoals[m] || 0;
      const remain = target - done;
      const percent = target > 0 ? Math.floor((done / target) * 100) : 0;
      resultText += `${m}: 目標 ${target}回 / 現在 ${done}回 / 残り ${remain > 0 ? remain : 0}回 / 達成率 ${percent}%\n`;
    }

    $("#result").text(resultText);
  });
});
