# Mangalist — Finance Ledger

**All entries here are drafts/recommendations from the virtual CEO. No spend happens until the parent explicitly approves it — see Approval Rules in `../CLAUDE.md`.**

## Budget
- Starting budget: 30,000–50,000 NIS (as of 2026-07-04). Exact figure not yet pinned down — confirm with parent before treating either end of the range as committed.

## Spend log
_(none yet — no spend has occurred)_

| Date | Item | Amount (NIS) | Approved by | Notes |
|------|------|--------------|-------------|-------|

## Pending recommendations

### 2026-07-04 — Tech build budget sizing (Phase 1 marketing/sales site)
**Status: PENDING — recommendation only, nothing spent, no vendor selected.**
Parent approved building a real database-backed marketing/sales site funded from the existing 30–50k NIS pool (no new funding). CFO recommendation on how to split that pool:
- Recommended one-time tech setup cost: **800–2,500 NIS** (domain if not already covered/renewal, minimal paid tooling/templates; assumes CIO builds it rather than hiring outside devs).
- Recommended ongoing recurring cost: **150–450 NIS/month** (hosting + managed DB + domain renewal amortized + any paid tool), i.e. roughly **900–2,700 NIS for a 6-month runway**.
- **Total tech allocation cap recommended: ~3,000–5,000 NIS** of the pool (one-time + ~6 months recurring), i.e. **under ~15% of the low end (30k) / ~10% of the high end (50k)** of the pool.
- **Recommend reserving the remaining ~85–90% (roughly 25,000–45,000 NIS depending on which end of the range is confirmed)** unspent for: (a) supplier-side MOQ/setup costs once Char-Broil/Napoleon terms come back from the twins (unknown amount — flagged as an open risk, see `suppliers.md`), and (b) marketing/launch spend (to be sized with Marketing once site is closer to live).
- Nothing here is decided — vendor/stack selection is CIO's call; this is financial sizing only. Any actual hosting/DB signup (even free-tier requiring a card) or domain payment is a real financial commitment requiring the parent's explicit sign-off before it's executed, per `../CLAUDE.md` Approval Rules.
- Awaiting: parent decision on (1) confirmed total budget figure within 30–50k, (2) sign-off on this tech cap, (3) CIO's actual vendor pick within the approved band.

### 2026-07-04 — CIO stack recommendation (within CFO's tech budget cap above)
**Status: PENDING — recommendation only, nothing provisioned or paid for.**
Original recommendation: Supabase (managed Postgres, free tier) as the database/API layer + free static hosting (Netlify or Cloudflare Pages). Estimated cost: 0 NIS/month on free tiers, up to ~90 NIS/month (~$25) if usage outgrows the free tier.

**Revised 2026-07-04 — parent wants local-first build, AWS as eventual deploy target (not Netlify/Cloudflare/hosted Supabase).** CIO compared (a) self-hosted Supabase via Docker locally → same docker-compose later on a single AWS EC2 instance, vs. (b) a fully custom AWS-native stack (custom API + hand-built admin panel, targeting RDS/EC2/S3/CloudFront). **Recommends (a).** Estimated AWS run-rate once actually deployed: **~60–150 NIS/month** (one EC2 instance sized to run the full stack, e.g. t3.small/t3.medium — no managed RDS, no ALB/NAT gateway to keep cost down), still inside the CFO's 150–450 NIS/month cap above. No RDS-style managed backups in this design — CIO's plan includes a scheduled Postgres backup job (pg_dump → S3) as part of the build, not an optional extra. Fully AWS-native (b) was assessed as somewhat cheaper in steady-state AWS dollars but a poor fit for this stage — it requires the CIO to hand-build the admin UI, auth, and access-control layer that self-hosted Supabase provides out of the box (Studio + PostgREST + RLS), for a 2-person team with no orders yet. Nothing provisioned or paid for — Docker Desktop, any EC2 instance, storage, etc. all require the parent's explicit sign-off before setup begins. Full comparison given to the CEO for review before this goes to the parent for sign-off.

## Revenue / margin tracking
_(none yet — no sales have occurred)_

## Notes
- No payment gateway is integrated yet. Do not commit any payment provider API keys or credentials to this repo — use environment variables once a provider is chosen.
