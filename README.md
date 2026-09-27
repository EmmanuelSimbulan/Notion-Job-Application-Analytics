# Trajectory — Notion Job Application Analytics

A private local React dashboard with an Express server. React provides shared filtering and interactive charts; the small Node server isolates credentials and caches paginated Notion data. Node 22.12+ recommended.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`. Tests: `npm test`.

The initial `.data/snapshot.json` is REAL tracker data retrieved through the connected Notion account, verified against a total-count query (100 records). It is excluded from source control and served only by the local API. It is not sample data. If absent, the app displays an empty state until a successful sync. Do not distribute this private snapshot.

## Secure live refresh

1. Create an internal integration at https://www.notion.so/profile/integrations with **Read content** only. Disable insert/update capabilities.
2. Open the tracker in Notion → Connections → add your integration.
3. Copy `.env.example` to `.env`, set `NOTION_TOKEN` locally, and restart the server. Do not paste credentials into chat or browser fields.
4. Click **Refresh data**. The Settings screen includes these steps.

`NOTION_DATA_SOURCE_ID=6d3f39ca-c69b-8270-ae9f-07471fc585b6` is the verified **data source** ID, not the tracker landing page ID. The server uses Notion API version `2026-03-11`, GET data-source schema and POST read-only data-source queries with opaque cursor pagination. No Notion mutation endpoints are implemented. Documentation: https://developers.notion.com/reference/versioning and https://developers.notion.com/reference/query-a-data-source.

The existing conversational connector cannot transfer its OAuth credential to a standalone app. Connection/schema/data access was verified through that connector; direct API refresh needs your own environment token. Missing credentials and failed requests preserve the prior snapshot and its sync time. Refresh requests are coalesced; 429/5xx and network errors retry up to five attempts with backoff and Retry-After. Reads use the cached snapshot; refresh is manual. The app binds to loopback, rejects foreign API hosts/origins, and does not log tokens. Do not expose it publicly without adding authentication.

## Actual schema and metrics

Company → company; Position → role; Status → status (multi-select); Application Date → applied date; City & Country → locations (multi-select); Salary → raw salary; Match Score → score; Next Action → action. Website Link and Contact Employer appear in record details.

- **Total applications:** records mapped to Applied, Interviewed, Offer, Accepted, Rejected, or Withdrawn. Draft, blocked/not submitted, empty and conflicting status groups do not enter denominators. They remain in the directory.
- **Active:** Applied + Interviewed + Offer. Accepted is closed.
- **Awaiting response:** Applied without a recorded response date. This is status-based evidence, not inbox verification.
- **Response rate:** records with Interviewed/Offer/Accepted/Rejected status or a mapped response date ÷ submitted applications.
- **Interview status rate:** currently Interviewed ÷ submitted applications. This is not a lifetime interview conversion rate.
- **Offer rate:** Offer + Accepted ÷ submitted applications. No prior interviews are inferred.
- **Time filters:** application date, inclusive. Undated rows remain in unfiltered totals but not dated charts. Date-only values retain their calendar day; timestamps use the selected time zone. Monday starts each week. Week/month metrics are current period to date.
- **Seven-day comparison:** today plus previous six days vs preceding seven days. All current filters apply, including any date range, so a restrictive date filter can intentionally remove baseline records.
- **No-response watchlist:** still Applied, no response date, application age strictly greater than the threshold (default 14 days). This is not an overdue follow-up deadline.
- Multi-location/status breakdowns count each distinct label; totals may exceed record counts. Unknown/conflicting groups remain visible.

Every chart/table/metric uses the same filtered selection. Chart clicks set filters; Reset clears them. Table search covers raw properties; CSV exports all filtered results, not just the visible page, and neutralizes spreadsheet formula prefixes. Settings are browser-local and never change Notion.

## Data limitations and optional improvements

The inspected schema has **no dedicated application source, industry, work arrangement, currency, salary period, follow-up deadline, interview/offer/rejection event date, first-response date, or stage history**. The dashboard does not infer these from website URLs, location names, page creation dates, or Next Action labels. Add and map those properties yourself if wanted; this application never alters the tracker.

Salary has euro display formatting, but that is not evidence of each record's currency, and pay periods are unknown. Individual raw values are retained; aggregate salary distributions are withheld. Current stage counts are not a historical funnel. Historical conversion and time-between-stage reporting require a separate dated stage-event history and are not implemented for this schema. Source outcome analysis and salary distributions are unavailable for the current data. Optional mapped event dates support event counts, upcoming dates, overdue active follow-ups, and average first-response timing.

The initial connector SQL snapshot flattens rich text; it is used only for analytics, never as a basis for editing source content. Notion API sync replaces it with current property values.
