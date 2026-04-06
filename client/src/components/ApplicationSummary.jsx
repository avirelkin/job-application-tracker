import { SUMMARY_ITEMS } from '../constants/applicationConstants';

export default function ApplicationSummary({
  statusCounts,
  statusSort,
  setStatusSort,
}) {
  return (
    <div className="summary">
      {SUMMARY_ITEMS.map(({ key, icon, cls }) => {
        const idx = statusSort.indexOf(key);
        const active = idx !== -1;

        return (
          <button
            key={key}
            type="button"
            className={`summary-pill badge ${cls} ${
              active ? 'active-pill' : ''
            }`}
            onClick={() =>
              setStatusSort((cur) =>
                cur.includes(key)
                  ? cur.filter((s) => s !== key)
                  : [...cur, key],
              )
            }
            title={
              active
                ? `Sort priority #${idx + 1} (click to remove)`
                : 'Click to add sort priority'
            }
          >
            <span>{icon}</span>
            <span>{key}</span>
            <strong>{statusCounts[key]}</strong>
            {active && <em className="pill-order">{idx + 1}</em>}
          </button>
        );
      })}

      <div className="summary-pill">
        Total: <strong>{statusCounts.Total}</strong>
      </div>
    </div>
  );
}
