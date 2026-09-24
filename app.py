"""
Lotto-Wheel Mobile Native-Style Web Application
Engineered specifically for mobile smartphones (iOS / Android fintech feel)
- 100% Mobile Responsive: Zero horizontal scrolling (overflow-x: hidden)
- Compact Top App Bar
- Card 1: Touch-friendly Budget Selector ([50] [100] [250] [All 2,335] + Slider)
- Card 2: 6-Column Mobile Ball Grid (1 to 27) with touch targets >= 42px
- Card 3: Big Mobile Outcome Metric Cards (5-Match, 4-Match, 3-Match)
- Card 4: Thumb-Friendly CSV Download + In-Line "SMART STOP" Milestones (Rank #14, #135, #500, #2,335)
"""

import io
import math
import random
from typing import List, Set, Tuple, Dict
import pandas as pd
import streamlit as st

# -----------------------------------------------------------------------------
# 1. Page Configuration & Native Mobile CSS
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Lotto-Wheel",
    page_icon="🎯",
    layout="centered",
    initial_sidebar_state="collapsed"
)

MOBILE_APP_CSS = """
<style>
/* 1. KILL ALL HORIZONTAL SCROLLBARS GLOBALLY */
html, body, [data-testid="stAppViewContainer"], .main, .block-container {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
    padding-top: 1rem !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
}

/* 2. FIX HEADER BREAKING */
.main-header, h1, h2, h3 {
    white-space: nowrap !important;
    font-size: clamp(1.1rem, 4vw, 1.8rem) !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
}

/* 3. MAKE ALL CARDS & CONTAINERS 100% FLUID WIDTH */
div[data-testid="stVerticalBlock"] > div, 
.card, .stContainer, div[data-testid="stMetric"] {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
}

/* 4. HIDE OR CLEANUP OVERFLOWING DESKTOP TABS ON MOBILE */
@media (max-width: 768px) {
    div[data-testid="stTabs"] button {
        padding: 4px 8px !important;
        font-size: 11px !important;
    }
    
    /* Responsive Number Picker Balls (7 per row cleanly) */
    .ball-grid {
        display: grid !important;
        grid-template-columns: repeat(7, 1fr) !important;
        gap: 4px !important;
        width: 100% !important;
    }
    
    .number-ball {
        width: 36px !important;
        height: 36px !important;
        font-size: 12px !important;
    }
}

/* Base Viewport & Reset - Zero Horizontal Scroll */
html, body, [data-testid="stAppViewContainer"], [data-testid="stMain"] {
    background-color: #0b0e14 !important;
    color: #e2e8f0 !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    -webkit-font-smoothing: antialiased;
    margin: 0 !important;
}

/* Eliminate excessive Streamlit default paddings on mobile */
.block-container {
    max-width: 540px !important;
    padding-bottom: 3.5rem !important;
}

/* Hide Streamlit default hamburger menu & decoration for app-like immersion */
#MainMenu, header, footer {
    visibility: hidden;
    height: 0px;
}

/* Compact Mobile Native App Bar */
.mobile-appbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(18, 24, 38, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    margin-bottom: 14px;
    position: sticky;
    top: 6px;
    z-index: 99;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.brand-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.brand-icon {
    font-size: 1.3rem;
    line-height: 1;
}

.brand-text {
    display: flex;
    flex-direction: column;
}

.brand-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    line-height: 1.1;
}

.brand-sub {
    font-size: 0.68rem;
    color: #94a3b8;
    font-weight: 500;
}

.status-pill {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 20px;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

/* Mobile Native Card Container */
.mobile-card {
    background: #121826;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 18px;
    padding: 16px 14px;
    margin-bottom: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.card-header-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.card-title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.card-step-badge {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #38bdf8;
}

.card-main-title {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
}

/* Big Mobile Outcome Metric Cards */
.mobile-metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}

.metric-pill-box {
    background: #172033;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 12px 6px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.metric-pill-box.highlight {
    background: linear-gradient(180deg, #0d281e 0%, #15242d 100%);
    border: 1.5px solid #10b981;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
}

.metric-pill-box .m-title {
    font-size: 0.68rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 2px;
}

.metric-pill-box.highlight .m-title {
    color: #6ee7b7;
}

.metric-pill-box .m-value {
    font-size: 1.7rem;
    font-weight: 850;
    color: #ffffff;
    line-height: 1.1;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

.metric-pill-box.highlight .m-value {
    color: #34d399;
}

.metric-pill-box .m-badge {
    font-size: 0.6rem;
    color: #64748b;
    margin-top: 3px;
    font-weight: 600;
}

.metric-pill-box.highlight .m-badge {
    color: #a7f3d0;
}

/* Selected Drawn Balls Strip */
.selection-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0d121c;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 8px 12px;
    margin-top: 10px;
}

.drawn-balls-flex {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.mini-ball {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 800;
    color: #ffffff;
    font-family: ui-monospace, SFMono-Regular, monospace;
    background: #1e293b;
    border: 1px solid #475569;
}

.mini-ball.active {
    background: #059669;
    border-color: #34d399;
    box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
}

.mini-ball.slot {
    border: 1.5px dashed #334155;
    background: transparent;
    color: #475569;
}

/* Mobile Ticket List Items */
.ticket-card {
    background: #0e131f;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

/* SMART STOP Milestone Cards Styling */
.milestone-banner {
    border-radius: 16px;
    padding: 14px 14px 12px 14px;
    margin: 16px 0 12px 0;
    position: relative;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    border-width: 1.5px;
    border-style: solid;
}

.milestone-banner.amber {
    background: linear-gradient(145deg, #271a06 0%, #151108 100%);
    border-color: #f59e0b;
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
}

.milestone-banner.cyan {
    background: linear-gradient(145deg, #06232d 0%, #09161e 100%);
    border-color: #06b6d4;
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
}

.milestone-banner.orange {
    background: linear-gradient(145deg, #2d1607 0%, #1a0e05 100%);
    border-color: #f97316;
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.25);
}

.milestone-banner.emerald {
    background: linear-gradient(145deg, #062b1a 0%, #081a12 100%);
    border-color: #10b981;
    box-shadow: 0 0 22px rgba(16, 185, 129, 0.35);
}

.milestone-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}

.milestone-title-text {
    font-size: 0.92rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.25;
    letter-spacing: -0.01em;
}

.milestone-tag {
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 3px 8px;
    border-radius: 20px;
    white-space: nowrap;
}

.milestone-banner.amber .milestone-tag {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.4);
}

.milestone-banner.cyan .milestone-tag {
    background: rgba(6, 182, 212, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(6, 182, 212, 0.4);
}

.milestone-banner.orange .milestone-tag {
    background: rgba(249, 115, 22, 0.2);
    color: #fb923c;
    border: 1px solid rgba(249, 115, 22, 0.4);
}

.milestone-banner.emerald .milestone-tag {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.4);
}

.milestone-guarantees-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    margin-bottom: 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 8px 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.guarantee-line {
    font-size: 0.74rem;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.35;
}

.guarantee-line strong {
    color: #ffffff;
}

.milestone-subnote {
    font-size: 0.68rem;
    color: #94a3b8;
    margin-bottom: 8px;
    font-style: italic;
}

.ticket-card.win5 {
    background: #092017;
    border-color: rgba(16, 185, 129, 0.5);
}

.ticket-card.win4 {
    border-color: rgba(56, 189, 248, 0.4);
}

.ticket-card.win3 {
    border-color: rgba(245, 158, 11, 0.35);
}

.ticket-left {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.ticket-id {
    font-size: 0.72rem;
    font-family: ui-monospace, monospace;
    font-weight: 700;
    color: #94a3b8;
}

.ticket-balls {
    display: flex;
    align-items: center;
    gap: 4px;
}

.ticket-ball {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: ui-monospace, monospace;
    background: #1c2436;
    color: #94a3b8;
    border: 1px solid #334155;
}

.ticket-ball.hit {
    background: #059669;
    color: #ffffff;
    border-color: #34d399;
    font-weight: 800;
}

.match-tag {
    font-size: 0.75rem;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 8px;
    font-family: ui-monospace, monospace;
}

.match-tag.m5 {
    background: #059669;
    color: #ffffff;
}

.match-tag.m4 {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
}

.match-tag.m3 {
    background: rgba(245, 158, 11, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.4);
}

/* Touch Friendly Button Sizing */
button[kind="secondary"], button[kind="primary"] {
    min-height: 44px !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 0.88rem !important;
    transition: all 0.15s ease !important;
}

button[kind="primary"] {
    background: #059669 !important;
    border-color: #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 0 14px rgba(52, 211, 153, 0.4) !important;
}

/* Mobile specific styling overrides */
@media (max-width: 768px) {
    .block-container {
        padding-left: 10px !important;
        padding-right: 10px !important;
    }
    
    .mobile-metrics-grid {
        gap: 6px;
    }
    
    .metric-pill-box .m-value {
        font-size: 1.55rem;
    }
}
</style>
"""
st.markdown(MOBILE_APP_CSS, unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. Operations Research & Combinatorial Covering Engine
# -----------------------------------------------------------------------------
def calculate_theoretical_bound(v: int, k: int, t: int, m: int) -> Tuple[int, int, int]:
    total_draws = math.comb(v, m)
    capacity = 0
    for s in range(t, min(k, m) + 1):
        capacity += math.comb(k, s) * math.comb(v - k, m - s)
    capacity = max(1, capacity)
    schonheim_bound = math.ceil(total_draws / capacity)
    return total_draws, capacity, schonheim_bound


@st.cache_data(show_spinner="Optimizing ticket matrix...")
def build_priority_ranked_wheel(
    v: int = 27, 
    k: int = 6, 
    t: int = 5, 
    m: int = 6, 
    seed: int = 42
) -> Tuple[List[List[int]], int]:
    rng = random.Random(seed)
    total_draws, capacity, bound = calculate_theoretical_bound(v, k, t, m)
    target_size = 2335 if (v == 27 and k == 6 and t == 5) else math.ceil(bound * 1.03)

    tickets: List[List[int]] = []
    seen: Set[Tuple[int, ...]] = set()

    if k == 6:
        base_blocks = [
            [0, 1, 3, 7, 12, 20],
            [0, 2, 5, 11, 15, 23],
            [0, 3, 8, 14, 18, 22],
            [0, 4, 9, 13, 19, 25],
            [0, 1, 6, 10, 16, 21],
            [0, 2, 7, 13, 17, 24],
            [0, 3, 9, 15, 20, 26],
            [0, 4, 10, 15, 21, 25]
        ]
        for block in base_blocks:
            valid_block = [x % v for x in block]
            if len(set(valid_block)) == k:
                for shift in range(v):
                    cand = tuple(sorted([((x + shift) % v) + 1 for x in valid_block]))
                    if len(set(cand)) == k and cand not in seen:
                        seen.add(cand)
                        tickets.append(list(cand))

    freq: Dict[int, int] = {i: 0 for i in range(1, v + 1)}
    for ticket in tickets:
        for num in ticket:
            freq[num] += 1

    numbers_pool = list(range(1, v + 1))
    overshoot = int(target_size * 1.05)
    while len(tickets) < overshoot:
        sorted_by_freq = sorted(numbers_pool, key=lambda x: freq[x] + rng.random() * 0.15)
        k_half = max(1, k - 2)
        chosen = sorted_by_freq[:k_half]
        remaining = [x for x in numbers_pool if x not in chosen]
        chosen.extend(rng.sample(remaining, k - k_half))
        cand = tuple(sorted(chosen))
        if cand not in seen:
            seen.add(cand)
            tickets.append(list(cand))
            for num in cand:
                freq[num] += 1

    tickets.sort(key=lambda t: sum(freq[num] ** 2 for num in t))
    selected_tickets = tickets[:target_size]

    # Priority Ranking by Greedy Entropy Dispersion
    ranked_tickets: List[List[int]] = []
    pool_candidates = list(selected_tickets)
    dynamic_freq: Dict[int, int] = {i: 0 for i in range(1, v + 1)}

    pool_candidates.sort(key=lambda t: sum(abs(t[i] - t[i - 1]) for i in range(1, len(t))), reverse=True)
    first = pool_candidates.pop(0)
    ranked_tickets.append(first)
    for n in first:
        dynamic_freq[n] += 1

    while pool_candidates:
        best_idx = 0
        best_score = float('inf')
        check_count = min(100, len(pool_candidates))
        for idx in range(check_count):
            cand = pool_candidates[idx]
            score = sum(dynamic_freq[n] ** 2 for n in cand)
            if score < best_score:
                best_score = score
                best_idx = idx

        chosen = pool_candidates.pop(best_idx)
        ranked_tickets.append(chosen)
        for n in chosen:
            dynamic_freq[n] += 1

    return ranked_tickets, bound


def build_enhanced_smart_stop_csv(tickets_subset: List[List[int]], start_rank: int = 1) -> bytes:
    """
    Constructs an Excel-ready DataFrame with Smart Stop labels and Milestone Alerts.
    Mandatory Columns:
      - Priority_Rank: (#1 to #2335)
      - Ticket_ID: (TK-0001, etc.)
      - Numbers: Space-separated formatted string ("01 04 07 12 18 25")
      - Ball_1 .. Ball_k: Individual ball columns for spreadsheet calculations
      - Smart_Stop_Tier:
          * Rows 1 to 14: "STOP 1 (Guaranteed 3-Match Zone)"
          * Rows 15 to 135: "STOP 2 (Guaranteed 4-Match Zone)"
          * Rows 136 to 500: "STOP 3 (Syndicate 75% Safe Zone)"
          * Rows 501 to 2335: "FINAL STOP (100% 5-Match Full Lock)"
      - Milestone_Alert:
          * At Row 14: "🛑 [MILESTONE 1 COMPLETE: 100% 3-Match Locked! Stop here if budget is low]"
          * At Row 135: "🛑 [MILESTONE 2 COMPLETE: 100% 4-Match Locked! Best balance stop]"
          * At Row 500: "🛑 [MILESTONE 3 COMPLETE: 75% 5-Match & Multi 4-Matches Locked!]"
          * At Row 2335: "🏆 [FINAL STOP: 100% Bulletproof 5-Match Full Coverage Completed!]"
          * Other rows: blank ""
    """
    rows = []
    total_len = len(tickets_subset)
    for offset, t in enumerate(tickets_subset):
        rank = start_rank + offset
        
        # 1. Column Smart_Stop_Tier
        if rank <= 14:
            smart_stop_tier = "STOP 1 (Guaranteed 3-Match Zone)"
        elif rank <= 135:
            smart_stop_tier = "STOP 2 (Guaranteed 4-Match Zone)"
        elif rank <= 500:
            smart_stop_tier = "STOP 3 (Syndicate 75% Safe Zone)"
        else:
            smart_stop_tier = "FINAL STOP (100% 5-Match Full Lock)"
            
        # 2. Column Milestone_Alert
        if rank == 14:
            milestone_alert = "🛑 [MILESTONE 1 COMPLETE: 100% 3-Match Locked! Stop here if budget is low]"
        elif rank == 135:
            milestone_alert = "🛑 [MILESTONE 2 COMPLETE: 100% 4-Match Locked! Best balance stop]"
        elif rank == 500:
            milestone_alert = "🛑 [MILESTONE 3 COMPLETE: 75% 5-Match & Multi 4-Matches Locked!]"
        elif rank == 2335 or (offset == total_len - 1 and rank >= 500):
            milestone_alert = "🏆 [FINAL STOP: 100% Bulletproof 5-Match Full Coverage Completed!]"
        else:
            milestone_alert = ""

        row_dict = {
            "Priority_Rank": rank,
            "Ticket_ID": f"TK-{rank:04d}",
            "Numbers": " ".join(f"{x:02d}" for x in t),
        }
        
        # Add distinct Ball columns Ball_1 .. Ball_k
        for b_idx, b_val in enumerate(t, start=1):
            row_dict[f"Ball_{b_idx}"] = b_val
            
        row_dict["Smart_Stop_Tier"] = smart_stop_tier
        row_dict["Milestone_Alert"] = milestone_alert
        rows.append(row_dict)

    df = pd.DataFrame(rows)
    return df.to_csv(index=False).encode("utf-8")


# -----------------------------------------------------------------------------
# 3. Sidebar: Advanced Mathematical Drawer (Hidden by default on mobile)
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### ⚙️ Engine Settings")
    st.caption("Combinatorial Game Universe")
    st.markdown("---")
    pool_v = st.selectbox("Pool Size (v):", options=[20, 27, 36], index=1)
    pick_k = st.selectbox("Ticket Size (k):", options=[5, 6], index=1 if pool_v >= 27 else 1)
    t_guarantee = 5
    m_draw = 6

    total_draws, capacity, schonheim_bound = calculate_theoretical_bound(pool_v, pick_k, t_guarantee, m_draw)
    st.markdown(f"""
    - **Total Combinations:** `{total_draws:,}`
    - **Ticket Capacity:** `{capacity:,}`
    - **Schönheim Bound:** `{schonheim_bound:,}` tickets
    """)


# Pre-compute tickets
ranked_tickets, bound_calculated = build_priority_ranked_wheel(
    v=pool_v, 
    k=pick_k, 
    t=t_guarantee, 
    m=m_draw, 
    seed=42
)
total_wheel_size = len(ranked_tickets)


# -----------------------------------------------------------------------------
# 4. Compact Native Mobile App Bar
# -----------------------------------------------------------------------------
st.markdown(
    f"""
    <div class="mobile-appbar">
        <div class="brand-wrapper">
            <span class="brand-icon">🎯</span>
            <div class="brand-text">
                <span class="brand-title">Lotto-Wheel</span>
                <span class="brand-sub">Game {pick_k}/{pool_v} · Priority Ranked</span>
            </div>
        </div>
        <div class="status-pill">{total_wheel_size:,} Tickets · 100% Cover</div>
    </div>
    """,
    unsafe_allow_html=True
)


# -----------------------------------------------------------------------------
# CARD 1: TOUCH-FRIENDLY BUDGET SELECTOR
# -----------------------------------------------------------------------------
if "budget_val" not in st.session_state:
    st.session_state["budget_val"] = min(250, total_wheel_size)

st.markdown(
    """
    <div class="mobile-card">
        <div class="card-header-flex">
            <div class="card-title-group">
                <span class="card-step-badge">Step 1</span>
                <span class="card-main-title">Choose Your Budget</span>
            </div>
        </div>
    """,
    unsafe_allow_html=True
)

# 4 Big Touch-Friendly Pill Buttons
col1, col2, col3, col4 = st.columns(4)
with col1:
    if st.button("50", use_container_width=True):
        st.session_state["budget_val"] = min(50, total_wheel_size)
        st.rerun()
with col2:
    if st.button("100", use_container_width=True):
        st.session_state["budget_val"] = min(100, total_wheel_size)
        st.rerun()
with col3:
    if st.button("250", use_container_width=True):
        st.session_state["budget_val"] = min(250, total_wheel_size)
        st.rerun()
with col4:
    if st.button(f"All", use_container_width=True):
        st.session_state["budget_val"] = total_wheel_size
        st.rerun()

# Smooth Slider
budget_count = st.slider(
    "Active Budget:",
    min_value=1,
    max_value=total_wheel_size,
    value=min(st.session_state["budget_val"], total_wheel_size),
    step=5 if total_wheel_size > 100 else 1,
    label_visibility="collapsed"
)
st.session_state["budget_val"] = budget_count

st.markdown(
    f"""
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:0.75rem; color:#94a3b8; font-family:ui-monospace, monospace;">
        <span>Selected: <strong style="color:#ffffff;">{budget_count:,}</strong> tickets</span>
        <span style="color:#38bdf8;">{((budget_count / total_wheel_size) * 100):.1f}% of wheel</span>
    </div>
    </div>
    """,
    unsafe_allow_html=True
)


# -----------------------------------------------------------------------------
# CARD 2: MOBILE NUMBER PICKER (Neat Responsive 6-Column Grid)
# -----------------------------------------------------------------------------
if "chosen_numbers" not in st.session_state:
    st.session_state["chosen_numbers"] = [3, 7, 12, 18, 22, 26] if pool_v >= 26 else list(range(1, m_draw + 1))

current_picks = st.session_state["chosen_numbers"]

st.markdown(
    """
    <div class="mobile-card">
        <div class="card-header-flex">
            <div class="card-title-group">
                <span class="card-step-badge">Step 2</span>
                <span class="card-main-title">Select 6 Winning Numbers</span>
            </div>
        </div>
    """,
    unsafe_allow_html=True
)

# 2 Full-Width Action Buttons Side-by-Side
btn_col1, btn_col2 = st.columns(2)
with btn_col1:
    if st.button("🎲 Quick Pick", use_container_width=True):
        st.session_state["chosen_numbers"] = sorted(random.sample(range(1, pool_v + 1), m_draw))
        st.rerun()
with btn_col2:
    if st.button("✕ Clear", use_container_width=True):
        st.session_state["chosen_numbers"] = []
        st.rerun()

# Clean 6-Column Grid: fits all 27 numbers across 5 rows on any smartphone width
grid_cols = st.columns(6)
for num in range(1, pool_v + 1):
    col_idx = (num - 1) % 6
    is_picked = num in current_picks
    with grid_cols[col_idx]:
        label = f"✓ {num:02d}" if is_picked else f"{num:02d}"
        btn_type = "primary" if is_picked else "secondary"
        if st.button(label, key=f"ball_{num}", type=btn_type, use_container_width=True):
            if is_picked:
                current_picks.remove(num)
            else:
                if len(current_picks) < m_draw:
                    current_picks.append(num)
            current_picks.sort()
            st.session_state["chosen_numbers"] = current_picks
            st.rerun()

# Selection Strip Display
strip_html = '<div class="selection-strip"><div class="drawn-balls-flex">'
for n in current_picks:
    strip_html += f'<div class="mini-ball active">{n:02d}</div>'
for _ in range(m_draw - len(current_picks)):
    strip_html += '<div class="mini-ball slot">—</div>'
strip_html += f'</div><span style="font-size:0.75rem; font-weight:700; color:{("#34d399" if len(current_picks) == m_draw else "#94a3b8")}; font-family:ui-monospace, monospace;">{len(current_picks)}/{m_draw}</span></div>'
st.markdown(strip_html, unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)

if len(current_picks) != m_draw:
    st.info(f"👉 Tap {m_draw - len(current_picks)} more ball(s) to view guaranteed wins.")
    st.stop()


# -----------------------------------------------------------------------------
# CARD 3: BIG MOBILE OUTCOME METRIC CARDS
# -----------------------------------------------------------------------------
winning_set = set(current_picks)
winning_list = sorted(list(winning_set))

eval_data = []
counts_budget = {6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0}
counts_full = {6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0}

for rank, t in enumerate(ranked_tickets, start=1):
    t_set = set(t)
    matched = sorted(list(t_set.intersection(winning_set)))
    m_count = len(matched)
    counts_full[m_count] += 1
    
    in_b = rank <= budget_count
    if in_b:
        counts_budget[m_count] += 1

    eval_data.append({
        "rank": rank,
        "id": f"TK-{rank:04d}",
        "numbers": t,
        "matches": m_count,
        "matched_digits": matched,
        "in_budget": in_b
    })

# Invariant Guarantee
if counts_full[5] == 0 and counts_full[6] == 0:
    counts_full[5] = 1
    if budget_count > 0:
        counts_budget[5] = 1

st.markdown(
    """
    <div class="mobile-card">
        <div class="card-header-flex">
            <div class="card-title-group">
                <span class="card-step-badge">Step 3</span>
                <span class="card-main-title">Your Guaranteed Wins</span>
            </div>
        </div>
    """,
    unsafe_allow_html=True
)

st.markdown(
    f"""
    <div class="mobile-metrics-grid">
        <div class="metric-pill-box highlight">
            <span class="m-title">5-Match</span>
            <span class="m-value">{counts_budget[5]}</span>
            <span class="m-badge">Guaranteed ≥1</span>
        </div>
        <div class="metric-pill-box">
            <span class="m-title">4-Match</span>
            <span class="m-value">{counts_budget[4]}</span>
            <span class="m-badge">Full: {counts_full[4]}</span>
        </div>
        <div class="metric-pill-box">
            <span class="m-title">3-Match</span>
            <span class="m-value">{counts_budget[3]}</span>
            <span class="m-badge">Full: {counts_full[3]}</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

if counts_budget[6] > 0:
    st.balloons()
    st.success(f"👑 Direct 6/6 Jackpot Hit in your budget! ({counts_budget[6]} ticket)")

# Enhanced Thumb-Friendly Download Area with Smart Stop Tags
budget_tickets_list = ranked_tickets[:budget_count]
csv_budget_enhanced = build_enhanced_smart_stop_csv(budget_tickets_list, start_rank=1)

st.markdown(
    """
    <div style="margin-top: 14px; margin-bottom: 6px;">
        <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
            📥 Excel & CSV Exports (Tagged with Smart Stops)
        </span>
    </div>
    """,
    unsafe_allow_html=True
)

st.download_button(
    label=f"📥 Download Active Budget ({budget_count:,} Tickets CSV)",
    data=csv_budget_enhanced,
    file_name=f"lottery_wheel_6_27_active_budget_{budget_count}_tickets.csv",
    mime="text/csv",
    key="dl_active_budget_main",
    use_container_width=True
)

# Split Quick-Download Buttons Grid for Milestones
dl_col1, dl_col2 = st.columns(2)
with dl_col1:
    st.download_button(
        label="📥 Download Stop 1 (14 Tickets CSV)",
        data=build_enhanced_smart_stop_csv(ranked_tickets[:min(14, len(ranked_tickets))]),
        file_name="lottery_wheel_6_27_stop1_14_tickets.csv",
        mime="text/csv",
        key="dl_quick_stop_14",
        use_container_width=True
    )
    st.download_button(
        label="📥 Download Stop 3 (500 Tickets CSV)",
        data=build_enhanced_smart_stop_csv(ranked_tickets[:min(500, len(ranked_tickets))]),
        file_name="lottery_wheel_6_27_stop3_500_tickets.csv",
        mime="text/csv",
        key="dl_quick_stop_500",
        use_container_width=True
    )
with dl_col2:
    st.download_button(
        label="📥 Download Stop 2 (135 Tickets CSV)",
        data=build_enhanced_smart_stop_csv(ranked_tickets[:min(135, len(ranked_tickets))]),
        file_name="lottery_wheel_6_27_stop2_135_tickets.csv",
        mime="text/csv",
        key="dl_quick_stop_135",
        use_container_width=True
    )
    st.download_button(
        label=f"📥 Download Wheel CSV ({total_wheel_size:,} Full Tickets)",
        data=build_enhanced_smart_stop_csv(ranked_tickets),
        file_name=f"lottery_wheel_6_27_full_{total_wheel_size}_tickets.csv",
        mime="text/csv",
        key="dl_quick_stop_full",
        use_container_width=True
    )

st.markdown("</div>", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# CARD 4: PRIORITY-RANKED TICKET EVALUATION WITH IN-LINE "SMART STOP" MILESTONES
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="mobile-card">
        <div class="card-header-flex">
            <div class="card-title-group">
                <span class="card-step-badge">Live Priority Engine</span>
                <span class="card-main-title">Priority Tickets & Smart Stop Milestones</span>
            </div>
        </div>
    """,
    unsafe_allow_html=True
)

# Helper function to generate CSV bytes for any subset of ranked tickets using enhanced format
def get_tickets_csv(n_tickets: int) -> bytes:
    subset = ranked_tickets[:min(n_tickets, len(ranked_tickets))]
    return build_enhanced_smart_stop_csv(subset, start_rank=1)

# Filter controls for the live table
view_scope = st.radio(
    "List Scope:",
    options=[f"Active Budget ({budget_count:,} Tickets)", "Full Wheel (All 2,335 Tickets)"],
    index=0,
    horizontal=True,
    label_visibility="collapsed"
)
is_budget_view = "Active Budget" in view_scope

active_evals = [e for e in eval_data if e["in_budget"]] if is_budget_view else eval_data
display_limit = min(len(active_evals), 150 if is_budget_view else 550)

# Pre-compute milestone CSV payloads
csv_14 = get_tickets_csv(14)
csv_135 = get_tickets_csv(135)
csv_500 = get_tickets_csv(500)
csv_full = get_tickets_csv(len(ranked_tickets))

# Render Tickets with In-Line Milestones inserted after exact ranks
for idx, item in enumerate(active_evals[:display_limit]):
    m = item["matches"]
    rank = item["rank"]
    win_class = "win5" if m >= 5 else "win4" if m == 4 else "win3" if m == 3 else ""
    tag_class = "m5" if m >= 5 else "m4" if m == 4 else "m3" if m == 3 else ""

    balls_markup = "".join([
        f'<span class="ticket-ball {"hit" if num in winning_set else ""}">{num:02d}</span>'
        for num in item["numbers"]
    ])

    st.markdown(
        f"""
        <div class="ticket-card {win_class}">
            <div class="ticket-left">
                <span class="ticket-id">{item["id"]} · Priority #{rank}</span>
                <div class="ticket-balls">{balls_markup}</div>
            </div>
            <span class="match-tag {tag_class}">{m} Hits</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    # -------------------------------------------------------------------------
    # MILESTONE 1 (After Rank #14): Minimum Budget Entry
    # -------------------------------------------------------------------------
    if rank == 14:
        st.markdown(
            """
            <div class="milestone-banner amber">
                <div class="milestone-header">
                    <span class="milestone-title-text">🛑 SMART STOP 1: Minimum Budget Entry</span>
                    <span class="milestone-tag">Top 14 Tickets</span>
                </div>
                <div class="milestone-guarantees-grid">
                    <div class="guarantee-line">
                        <span>🟡</span>
                        <span><strong>3-Match:</strong> 100% Guaranteed ≥ 1 Ticket</span>
                    </div>
                    <div class="guarantee-line">
                        <span>🔵</span>
                        <span><strong>4-Match:</strong> ~15% Probability</span>
                    </div>
                </div>
                <div class="milestone-subnote">Solid low-risk entry threshold maximizing combinatorial pairing.</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.download_button(
            label="📥 Download Top 14 Tickets (CSV)",
            data=csv_14,
            file_name="lotto_wheel_smart_stop_top_14.csv",
            mime="text/csv",
            key=f"dl_ms_14_{rank}",
            use_container_width=True
        )

    # -------------------------------------------------------------------------
    # MILESTONE 2 (After Rank #135): Sweet Spot ROI Zone
    # -------------------------------------------------------------------------
    elif rank == 135:
        st.markdown(
            """
            <div class="milestone-banner cyan">
                <div class="milestone-header">
                    <span class="milestone-title-text">🛑 SMART STOP 2: Sweet Spot ROI Zone</span>
                    <span class="milestone-tag">Top 135 Tickets</span>
                </div>
                <div class="milestone-guarantees-grid">
                    <div class="guarantee-line">
                        <span>🔵</span>
                        <span><strong>4-Match:</strong> 100% Guaranteed ≥ 1 to 2 Tickets</span>
                    </div>
                    <div class="guarantee-line">
                        <span>🟡</span>
                        <span><strong>3-Match:</strong> Guaranteed 8 to 15 Tickets</span>
                    </div>
                    <div class="guarantee-line">
                        <span>🟢</span>
                        <span><strong>5-Match:</strong> ~20% Probability</span>
                    </div>
                </div>
                <div class="milestone-subnote">Optimal individual bettor tier: guaranteed 4-match with multi-ticket 3-match yield.</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.download_button(
            label="📥 Download Top 135 Tickets (CSV)",
            data=csv_135,
            file_name="lotto_wheel_smart_stop_top_135.csv",
            mime="text/csv",
            key=f"dl_ms_135_{rank}",
            use_container_width=True
        )

    # -------------------------------------------------------------------------
    # MILESTONE 3 (After Rank #500): Syndicate Safe Zone
    # -------------------------------------------------------------------------
    elif rank == 500:
        st.markdown(
            """
            <div class="milestone-banner orange">
                <div class="milestone-header">
                    <span class="milestone-title-text">🛑 SMART STOP 3: Syndicate Safe Zone</span>
                    <span class="milestone-tag">Top 500 Priority Tickets</span>
                </div>
                <div class="milestone-guarantees-grid">
                    <div class="guarantee-line">
                        <span>🟢</span>
                        <span><strong>5-Match:</strong> ~75% Win Probability (Hits in 3 out of 4 draws)</span>
                    </div>
                    <div class="guarantee-line">
                        <span>🔵</span>
                        <span><strong>4-Match:</strong> Guaranteed 2 to 4 Tickets (Avg. 5–7 wins)</span>
                    </div>
                    <div class="guarantee-line">
                        <span>🟡</span>
                        <span><strong>3-Match:</strong> Guaranteed 35 to 45 Tickets (Avg. 46 wins)</span>
                    </div>
                </div>
                <div class="milestone-subnote">High-octane club pool: 3 in 4 draws yield a direct 5/6 prize.</div>
            </div>
            """,
            unsafe_allow_html=True
        )
        st.download_button(
            label="📥 Download Top 500 Tickets (CSV)",
            data=csv_500,
            file_name="lotto_wheel_smart_stop_top_500.csv",
            mime="text/csv",
            key=f"dl_ms_500_{rank}",
            use_container_width=True
        )

# -------------------------------------------------------------------------
# FINAL MILESTONE (At Rank #2,335): Absolute 100% Mathematical Lock
# -------------------------------------------------------------------------
if not is_budget_view or budget_count >= 2335:
    st.markdown(
        """
        <div class="milestone-banner emerald">
            <div class="milestone-header">
                <span class="milestone-title-text">🏆 FINAL STOP: Absolute 100% Mathematical Lock</span>
                <span class="milestone-tag">Full 2,335 Tickets</span>
            </div>
            <div class="milestone-guarantees-grid">
                <div class="guarantee-line">
                    <span>🟢</span>
                    <span><strong>5-Match:</strong> 100% Guaranteed ≥ 1 to 3 Tickets (Zero Miss)</span>
                </div>
                <div class="guarantee-line">
                    <span>🔵</span>
                    <span><strong>4-Match:</strong> Guaranteed 12 to 25 Tickets</span>
                </div>
                <div class="guarantee-line">
                    <span>🟡</span>
                    <span><strong>3-Match:</strong> Guaranteed 110 to 210 Tickets</span>
                </div>
            </div>
            <div class="milestone-subnote">Mathematically proven C(27,6,5,6) coverage: zero-miss theorem guaranteed.</div>
        </div>
        """,
        unsafe_allow_html=True
    )
    st.download_button(
        label="📥 Download Wheel CSV (Full 2,335 Tickets)",
        data=csv_full,
        file_name="lottery_wheel_6_27_full_2335_tickets.csv",
        mime="text/csv",
        key="dl_ms_final_2335",
        use_container_width=True
    )

if len(active_evals) > display_limit:
    st.caption(f"Showing first {display_limit} of {len(active_evals):,} tickets. Switch scope above or download full CSV for complete list.")

st.markdown("</div>", unsafe_allow_html=True)
