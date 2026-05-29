export default function StatsPanel({
  completionRate,
  correctCount,
  resultsCount,
  wrongCount,
  wrongIdsCount,
  onReset,
}: {
  completionRate: number;
  correctCount: number;
  resultsCount: number;
  wrongCount: number;
  wrongIdsCount: number;
  onReset: () => void;
}) {
  return (
    <article className="panel">
      <h2>Thống kê học tập</h2>
      <div className="statsGrid">
        <div>
          <span>Đã trả lời</span>
          <strong>{resultsCount}</strong>
        </div>
        <div>
          <span>Đúng</span>
          <strong>{correctCount}</strong>
        </div>
        <div>
          <span>Sai</span>
          <strong>{wrongCount}</strong>
        </div>
        <div>
          <span>Tỷ lệ đúng</span>
          <strong>{completionRate}%</strong>
        </div>
      </div>
      <div className="progressTrack">
        <span style={{ width: `${completionRate}%` }} />
      </div>
      <p className="muted">Đang lưu {wrongIdsCount} câu sai trong LocalStorage để ôn lại.</p>
      <button className="secondaryButton" type="button" onClick={onReset}>
        Xóa tiến độ
      </button>
    </article>
  );
}
