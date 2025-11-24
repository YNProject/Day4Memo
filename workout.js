$(function() {
  // 日付表示
  const now = new Date();
  $("#date-display").text("現在の日付: " + now.toLocaleString());

  // レースごとの目標値
  const raceGoals = {
    "オーシャンS": { pushup: 180, squat: 200, pullup: 40, legraise: 220, calf: 200 },
    "中京記念": { pushup: 200, squat: 240, pullup: 40, legraise: 200, calf: 260 },
    "新潟記念": { pushup: 240, squat: 200, pullup: 50, legraise: 180, calf: 200 },
    "京都記念": { pushup: 300, squat: 340, pullup: 70, legraise: 300, calf: 350 },
    "京王杯スプリングC": { pushup: 360, squat: 300, pullup: 70, legraise: 260, calf: 320 },
    "ステイヤーズS": { pushup: 280, squat: 380, pullup: 60, legraise: 300, calf: 420 },
    "日本ダービー": { pushup: 450, squat: 700, pullup: 100, legraise: 500, calf: 800 },
    "マイルチャンピオンシップ": { pushup: 600, squat: 550, pullup: 110, legraise: 600, calf: 600 },
    "有馬記念": { pushup: 500, squat: 650, pullup: 120, legraise: 500, calf: 650 }
  };

  // レース選択処理
  $("#race-form").on("submit", function(e) {
    e.preventDefault();
    const raceName = $("#race").val();
    const goals = raceGoals[raceName];

    // 目標値をテキスト化
    let goalText = "【" + raceName + " の目標】\n";
    goalText += "腕立て: " + goals.pushup + "回\n";
    goalText += "スクワット: " + goals.squat + "回\n";
    goalText += "懸垂: " + goals.pullup + "回\n";
    goalText += "レッグレイズ: " + goals.legraise + "回\n";
    goalText += "ふくらはぎ: " + goals.calf + "回\n";

    // 表示
    $("#result").text(goalText);
  });
});
