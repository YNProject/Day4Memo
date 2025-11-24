$(function() {
  // 日付表示
  const now = new Date();
  $("#date-display").text("現在の日付: " + now.toLocaleString());

  // フォーム送信処理
  $("#workout-form").on("submit", function(e) {
    e.preventDefault();
    const menu = $("#menu").val();
    $("#result").text(menu + " を記録しました！");
  });
});
