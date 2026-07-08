# Mangalist — Operations

Tracking for order fulfillment, purchase/supplier status, and customer satisfaction with received products. Owned by the COO subagent (`.claude/agents/coo.md`), in support of the twins who physically handle orders, deliveries, and supplier deals — not a replacement for that work.

## Purchases / supplier orders
_(none yet — no supplier deals closed)_

## Delivery tracking
_(none yet — no orders exist)_

## Customer satisfaction
_(none yet — no products delivered)_

## Product/technical reference — Char-Broil model specs (2026-07-04)
Compiled at CIO's request as **placeholder seed data** for the new database-backed catalog (Phase 1 build). Not tied to any signed supplier deal — Explore (Char-Broil's Israeli importer) has not been contacted yet (see `suppliers.md`). No real pricing/SKU/availability exists; figures below are general/approximate public specs recalled from knowledge of Char-Broil's typical lineup, not scraped or copied from manufacturer/retailer copy, and have **not been re-verified against a live source in this session** (no web access available to this agent run) — CIO/twins should spot-check against charbroil.com or Explore once contacted before treating any figure as final.

7 representative Char-Broil gas grill models spanning entry to upper-mid tier, in my own words (not manufacturer copy):

| Model (representative name) | Approx. size (W x D x H) | Burners | Notable features | Price tier (USD, US retail reference — NOT our pricing, no ILS/import figure exists) |
|---|---|---|---|---|
| Classic 4-Burner | ~132 x 61 x 114 cm | 4 | Basic open-flame burners, porcelain-coated grates, piezo ignition, side shelves | Budget, ~$200-280 |
| Advantage Series 4-Burner | ~130 x 60 x 113 cm | 4 | Value/easy-assembly line, porcelain grates, side shelves | Entry-mid, ~$250-350 |
| Performance 4-Burner | ~132 x 61 x 114 cm | 4 (+ side burner on some trims) | Porcelain-coated cast-iron grates, cabinet base for tank storage | Entry-mid, ~$300-400 |
| Professional TRU-Infrared 3-Burner (compact) | ~117 x 56 x 112 cm | 3 | TRU-Infrared emitter plate under grates (reduces flare-ups, more even heat) — smaller footprint suited to balconies/small patios, relevant to Israeli apartment living | Mid, ~$300-400 |
| Signature TRU-Infrared 4-Burner | ~132 x 61 x 114 cm | 4 | TRU-Infrared system, porcelain-coated grates | Mid, ~$350-450 |
| Performance 5-Burner | ~152 x 61 x 114 cm | 5 (incl. side burner) | Larger cooking area (~600+ sq in), same Performance-line build | Mid, ~$400-500 |
| Commercial TRU-Infrared 4-Burner | ~140 x 61 x 114 cm | 4 (+ side burner) | TRU-Infrared, stainless-steel lid/front panel (higher-end finish than painted-steel trims) | Upper-mid, ~$450-600 |

**Imagery/copy flag (IP risk):** Do not source or reuse Char-Broil's or any retailer's product photography or marketing copy for the live site — no reseller relationship exists yet, so their copyrighted images/copy are off-limits. Use generic/stock imagery clearly marked as temporary/placeholder in the catalog UI until either (a) a reseller agreement with Explore is signed (these typically include rights to brand marketing assets), or (b) the twins commission their own product photos once they have physical units. This is a CIO-facing note for how the seed data should render — flagging here since it accompanies the seed data, not a site/tech decision itself.

## Notes
- Financial terms of any purchase (pricing, cost impact) are tracked in `finance.md` by the CFO — this file tracks the operational side (status, timing, satisfaction), not the money.
- Product/technical evaluation of grill models (quality, specs, safety) to support the twins before closing a supplier deal falls under the COO's remit — log findings here or in `suppliers.md` as relevant.
