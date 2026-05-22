# Worker Productivity Module

This document describes the current worker productivity implementation in the DMS Dashboard.

## What Changed Recently

- Productivity logic now runs on **PostgreSQL data through Prisma**.
- Worker IDs shown in the UI (`WP001`, `WP002`, etc.) are generated from SQL `Worker_id` values.
- Contributions are recalculated from raw measurements and persisted in `Worker_contributions`.
- Stock and sales are integrated, so productivity and availability are aligned.

## Core Concepts

### Worker Identifier

- Display ID format: `WP###`
- Source: `Workers.Worker_id`
- No separate persisted `wastepicker_id` column is required.

### Measurement Source

Raw data comes from `Measurments` (table name keeps legacy spelling).

Important fields:
- `Wastepicker`
- `Material`
- `Time_stamp`
- `Weight_KG`
- `Bag_filled`

### Recalculation Logic

`POST /api/recalculate-contributions` applies the following rules:

1. Group measurements by worker + material + date.
2. For each group:
   - if a `Bag_filled = true` record exists, use that bag completion weight rule
   - otherwise use the highest measured weight of the day
3. Convert daily contributions into ISO-like weekly buckets.
4. Persist weekly totals to `Worker_contributions` using a SQL `daterange` period.

## Related Endpoints

### Main Productivity Endpoint

`GET /api/worker-productivity`

Query params:
- `worker_id` (required, accepts numeric or `WP###` style)
- `weeks` (optional, default `12`)

Returns:
- weekly contributions by material
- summary stats (total, average weekly, best week, top materials)

### Worker Collections Ranking

`GET /api/worker-collections`

Query params:
- `worker_id` (optional)
- `material_id` (optional, supports `group_<name>`)
- `period_type` (`weekly`, `monthly`, `yearly`)

Returns:
- top workers by collected weight
- yearly grouped mode with per-material worker breakdown

### Contribution Rebuild

`POST /api/recalculate-contributions`

Use this when:
- historical measurements were corrected
- seed data changed
- totals are inconsistent

Returns processing statistics:
- measurements processed
- daily and weekly contributions generated
- workers/materials covered
- total calculated weight

### Worker ID Assignment Endpoint

`POST /api/users/assign-wastepicker-ids`

Current behavior in SQL mode:
- returns generated `WP###` mappings
- does not perform DB writes
- exists as migration compatibility endpoint

## Dashboard Integration

The module is surfaced in two places:

### `/worker-productivity` page

- worker selector
- 4 to 52 week window
- weekly bar chart + per-material trend chart
- detailed weekly cards

### `/` main dashboard

- worker collection comparisons
- earnings comparison
- stock and price trend context
- admin tool to trigger recalculation

## Data Dependencies

Productivity calculations depend on:
- `Workers`
- `Materials`
- `Measurments`
- `Worker_contributions`
- `Stock`
- `Sales`

If one of these tables is empty, charts can return `noData` responses.

## Operational Checklist

1. Ensure workers and materials exist.
2. Ensure measurement records exist in `Measurments`.
3. Run `POST /api/recalculate-contributions` after major data imports.
4. Check `GET /api/worker-productivity` for expected weekly output.

## Troubleshooting

### No worker appears in selector

Check:
- `GET /api/users` (only worker-type users are returned)
- `Workers.User_type` values (`1`, `W`, `C` are treated as workers)

### Worker has no productivity data

Check:
- measurement date range vs selected `weeks`
- worker ID mapping (numeric id vs `WP###`)
- whether measurements are linked to that worker

### Mismatch between raw measurements and weekly totals

Run:
- `POST /api/recalculate-contributions`

Then re-open:
- `/worker-productivity`
