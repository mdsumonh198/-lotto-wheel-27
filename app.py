"""
Universal Lotto-Wheel Coverage Application - Ultra-Clean Mobile-First Web Application
Engineered strictly for mobile smartphones (iOS & Android) with zero clutter.
- 100% Native Mobile Responsive: Zero horizontal scrolling
- Universal Game Support: 6/27, 6/20, 6/30, 6/36, 6/42, 6/45, 6/49, 5/35, or Custom (e.g. 1 to 25, Pick 5)
- 3 Simple Bulletproof Steps:
    Step 1: Choose Budget (Compact 2x2 Grid: [🟢 Stop 1] [🔵 Stop 2] / [🟠 Stop 3] [🏆 Full])
    Step 2: Select Numbers (Compact circular balls 1 to v in 7-column grid)
    Step 3: Instant Win Results & Full Wheel CSV Download
- 100% Guaranteed Dark UI: Zero washed-out white button backgrounds
"""

import math
import random
from typing import List, Set, Tuple, Dict, Any
import pandas as pd
import streamlit as st

# -----------------------------------------------------------------------------
# 1. Page Config & Bulletproof Dark Mobile CSS
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Lotto-Wheel Coverage",
    page_icon="🎯",
    layout="centered",
    initial_sidebar_state="collapsed"
)

MOBILE_APP_CSS = """
<style>
/* ========================================================================= */
/* 1. ZERO HORIZONTAL SCROLLBARS & DEEP DARK CANVAS                           */
/* ========================================================================= */
html, body, [data-testid="stAppViewContainer"], .main, .block-container {
    overflow-x: hidden !important;
    max-width: 100vw !important;
    margin: 0 auto !important;
    padding-left: 6px !important;
    padding-right: 6px !important;
    padding-top: 6px !important;
    box-sizing: border-box !important;
    background-color: #0b0e14 !important;
    color: #e2e8f0 !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif !important;
    -webkit-font-smoothing: antialiased;
}

.block-container {
    max-width: 440px !important;
    padding-bottom: 2.5rem !important;
}

#MainMenu, header, footer {
    visibility: hidden !important;
    height: 0 !important;
    display: none !important;
}

/* ========================================================================= */
/* 2. BULLETPROOF COLUMN SYSTEM (NEVER STACK, NEVER CUT OFF)                 */
/* ========================================================================= */
div[data-testid="stHorizontalBlock"],
.stHorizontalBlock {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    gap: 4px !important;
    column-gap: 4px !important;
    row-gap: 4px !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    margin-bottom: 5px !important;
    box-sizing: border-box !important;
    justify-content: flex-start !important;
    align-items: center !important;
}

div[data-testid="stHorizontalBlock"] > div[data-testid="column"],
div[data-testid="stHorizontalBlock"] > div,
.stHorizontalBlock > div {
    flex: 1 1 0% !important;
    width: 0 !important;
    min-width: 0 !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    overflow: visible !important;
}

div[data-testid="stHorizontalBlock"] > div[data-testid="column"] > div {
    min-width: 0 !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
}

div[data-testid="stHorizontalBlock"] div.stButton {
    width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
}

/* ========================================================================= */
/* 3. STRICT DARK BUTTON OVERRIDE (ELIMINATES ALL WHITE BACKGROUNDS)         */
/* ========================================================================= */
/* Secondary / Default Buttons */
div.stButton > button,
button[kind="secondary"],
div[data-testid="stButton"] > button {
    background: #141b26 !important;
    background-color: #141b26 !important;
    border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
    color: #f1f5f9 !important;
    border-radius: 12px !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
    transition: all 0.15s ease-in-out !important;
}

div.stButton > button:hover,
button[kind="secondary"]:hover,
div[data-testid="stButton"] > button:hover {
    background: #1e293b !important;
    background-color: #1e293b !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
}

/* Primary / Selected Buttons */
div.stButton > button[kind="primary"],
div[data-testid="stButton"] > button[kind="primary"] {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
    background-color: #10b981 !important;
    border: 1.5px solid #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45) !important;
}

/* Enforce crisp visible text inside buttons */
div.stButton > button *,
button[kind="secondary"] *,
div[data-testid="stButton"] > button * {
    color: #f1f5f9 !important;
    font-weight: 700 !important;
}

div.stButton > button[kind="primary"] *,
div[data-testid="stButton"] > button[kind="primary"] * {
    color: #ffffff !important;
    font-weight: 900 !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
}

/* ========================================================================= */
/* 4. BUDGET BUTTONS (2x2 GRID)                                              */
/* ========================================================================= */
div[class*="st-key-pill_"] button {
    width: 100% !important;
    height: 46px !important;
    min-height: 46px !important;
    border-radius: 12px !important;
    font-size: 0.84rem !important;
    font-weight: 800 !important;
    padding: 0 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

/* ========================================================================= */
/* 5. ACTION BUTTONS (RANDOM PICK / CLEAR)                                    */
/* ========================================================================= */
div[class*="st-key-act_random"] button {
    background: #0e2238 !important;
    border: 1.5px solid #38bdf8 !important;
    color: #38bdf8 !important;
    width: 100% !important;
    height: 40px !important;
    min-height: 40px !important;
    border-radius: 10px !important;
    font-size: 0.85rem !important;
    font-weight: 800 !important;
    padding: 0 6px !important;
}

div[class*="st-key-act_random"] button * {
    color: #38bdf8 !important;
    font-weight: 800 !important;
}

div[class*="st-key-act_clear"] button {
    background: #2a1520 !important;
    border: 1.5px solid #f43f5e !important;
    color: #fb7185 !important;
    width: 100% !important;
    height: 40px !important;
    min-height: 40px !important;
    border-radius: 10px !important;
    font-size: 0.85rem !important;
    font-weight: 800 !important;
    padding: 0 6px !important;
}

div[class*="st-key-act_clear"] button * {
    color: #fb7185 !important;
    font-weight: 800 !important;
}

/* ========================================================================= */
/* 6. CIRCULAR NUMBER BALLS (7 COLUMNS RESPONSIVE)                           */
/* ========================================================================= */
div[class*="st-key-ball_"] button {
    width: clamp(34px, 9.4vw, 40px) !important;
    height: clamp(34px, 9.4vw, 40px) !important;
    min-width: 32px !important;
    min-height: 32px !important;
    max-width: 42px !important;
    max-height: 42px !important;
    border-radius: 50% !important;
    padding: 0 !important;
    margin: 0 auto !important;
    font-size: clamp(11px, 3.2vw, 13px) !important;
    font-weight: bold !important;
    line-height: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}

div[class*="st-key-ball_"] button[kind="primary"] {
    background: linear-gradient(135deg, #059669, #10b981) !important;
    border: 2px solid #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6) !important;
}

div[class*="st-key-ball_"] button[kind="secondary"] {
    background: #141b26 !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
    color: #f1f5f9 !important;
}

div[class*="st-key-ball_"] button[kind="secondary"]:hover {
    background: #1e293b !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
}

/* ========================================================================= */
/* 7. ALL INPUTS, SELECTBOXES, NUMBER INPUTS MUST BE DARK                    */
/* ========================================================================= */
div[data-baseweb="select"],
div[data-baseweb="select"] > div,
div[data-baseweb="input"],
div[data-baseweb="input"] > input,
div[data-testid="stNumberInput"] input,
div[data-testid="stTextInput"] input,
input, select, textarea {
    background-color: #121824 !important;
    background: #121824 !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: 10px !important;
}

div[data-baseweb="select"] * {
    color: #ffffff !important;
}

div[data-baseweb="popover"],
div[data-baseweb="menu"],
ul[role="listbox"],
li[role="option"] {
    background-color: #121824 !important;
    color: #ffffff !important;
}

/* ========================================================================= */
/* 8. FULL-WIDTH DOWNLOAD BUTTON                                             */
/* ========================================================================= */
div[data-testid="stDownloadButton"] button,
.stDownloadButton > button {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
    border: 1.5px solid #34d399 !important;
    color: #ffffff !important;
    width: 100% !important;
    min-height: 46px !important;
    height: 46px !important;
    border-radius: 12px !important;
    font-size: 0.92rem !important;
    font-weight: 800 !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

div[data-testid="stDownloadButton"] button * {
    color: #ffffff !important;
    font-weight: 800 !important;
}

/* Topbar & Cards */
.mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(20, 25, 35, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    margin-bottom: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.topbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
}

.topbar-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
}

.topbar-badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 14px 0 8px 0;
}

.step-badge {
    background: linear-gradient(135deg, #059669, #10b981);
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
}

.section-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.01em;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 10px;
}

.result-card {
    background: #0d1118;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 10px 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.result-card.highlight {
    background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 17, 24, 0.9) 100%);
    border: 1px solid rgba(16, 185, 129, 0.4);
}

.result-card.blue {
    background: linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(13, 17, 24, 0.9) 100%);
    border: 1px solid rgba(56, 189, 248, 0.4);
}

.result-card.amber {
    background: linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, rgba(13, 17, 24, 0.9) 100%);
    border: 1px solid rgba(251, 191, 36, 0.4);
}

.res-label {
    font-size: 0.68rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
}

.res-val {
    font-size: 1.45rem;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.1;
    font-family: ui-monospace, monospace;
}

.res-sub {
    font-size: 0.6rem;
    font-weight: 600;
    color: #34d399;
}

.number-tray {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
    background: #0d1117;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 8px 10px;
    margin-top: 8px;
    margin-bottom: 8px;
}

.tray-balls {
    display: flex;
    gap: 5px;
    align-items: center;
    flex-wrap: wrap;
}

.tray-ball {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    color: #cbd5e1;
    font-family: ui-monospace, monospace;
}

.tray-ball.active {
    background: #10b981;
    border-color: #34d399;
    color: #ffffff;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.ticket-row {
    background: #0d1117;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 8px 10px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.ticket-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.ticket-rank {
    font-size: 0.65rem;
    font-weight: 700;
    color: #94a3b8;
    font-family: ui-monospace, monospace;
}

.ticket-nums {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.t-num {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #1e293b;
    color: #94a3b8;
    font-size: 0.68rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ui-monospace, monospace;
}

.t-num.hit {
    background: #059669;
    color: #ffffff;
    font-weight: 900;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.match-badge {
    font-size: 0.7rem;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 6px;
    font-family: ui-monospace, monospace;
}

.match-badge.m5 {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10b981;
    color: #34d399;
}

.match-badge.m4 {
    background: rgba(56, 189, 248, 0.2);
    border: 1px solid #38bdf8;
    color: #38bdf8;
}

.match-badge.m3 {
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid #fbbf24;
    color: #fbbf24;
}

.match-badge.m-low {
    background: rgba(148, 163, 184, 0.1);
    color: #64748b;
}

.ms-divider {
    border-radius: 10px;
    padding: 8px 10px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 800;
}

.ms-divider.stop1 {
    background: rgba(251, 191, 36, 0.12);
    border: 1px solid rgba(251, 191, 36, 0.4);
    color: #fbbf24;
}

.ms-divider.stop2 {
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
}

.ms-divider.stop3 {
    background: rgba(249, 115, 22, 0.12);
    border: 1px solid rgba(249, 115, 22, 0.4);
    color: #fb923c;
}

.ms-divider.stop-final {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.5);
    color: #34d399;
}
</style>
"""
st.markdown(MOBILE_APP_CSS, unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. Universal Lottery Mathematical Engine
# -----------------------------------------------------------------------------
GAME_PRESETS: Dict[str, Dict[str, Any]] = {
    "6/25": {
        "title": "🔥 System 6/25 (1–25, Pick 6)",
        "pool": 25,
        "pick": 6,
        "target_size": 1540,
        "stops": [12, 85, 160, 1540],
    },
    "6/27": {
        "title": "🎯 System 6/27 (Default: 1–27, Pick 6)",
        "pool": 27,
        "pick": 6,
        "target_size": 2335,
        "stops": [14, 135, 500, 2335],
    },
    "6/20": {
        "title": "🎱 System 6/20 (Quick: 1–20, Pick 6)",
        "pool": 20,
        "pick": 6,
        "target_size": 780,
        "stops": [8, 45, 180, 780],
    },
    "6/30": {
        "title": "🎲 System 6/30 (1–30, Pick 6)",
        "pool": 30,
        "pick": 6,
        "target_size": 3100,
        "stops": [18, 180, 650, 3100],
    },
    "6/36": {
        "title": "💎 System 6/36 (1–36, Pick 6)",
        "pool": 36,
        "pick": 6,
        "target_size": 3600,
        "stops": [25, 250, 850, 3600],
    },
    "6/42": {
        "title": "🔥 National 6/42 (1–42, Pick 6)",
        "pool": 42,
        "pick": 6,
        "target_size": 4200,
        "stops": [30, 320, 1100, 4200],
    },
    "6/45": {
        "title": "⭐ Mega 6/45 (1–45, Pick 6)",
        "pool": 45,
        "pick": 6,
        "target_size": 4800,
        "stops": [35, 380, 1300, 4800],
    },
    "6/49": {
        "title": "🏆 Classic 6/49 (1–49, Pick 6)",
        "pool": 49,
        "pick": 6,
        "target_size": 5500,
        "stops": [40, 450, 1600, 5500],
    },
    "5/35": {
        "title": "⚡ Fantasy 5/35 (1–35, Pick 5)",
        "pool": 35,
        "pick": 5,
        "target_size": 1200,
        "stops": [10, 80, 300, 1200],
    },
    "custom": {
        "title": "⚙️ Custom Game (নিজের মতো গেম সেট করুন)",
        "pool": 25,
        "pick": 5,
        "target_size": 550,
        "stops": [10, 65, 220, 550],
    }
}


def calculate_dynamic_stops(v: int, k: int) -> Tuple[int, List[int]]:
    """
    Computes exact mathematical covering size and 4 Smart Stops for ANY (v, k) game.
    e.g. 1 to 25, pick 5 -> [10, 65, 220, 550]
    """
    try:
        total_draws = math.comb(v, k)
    except Exception:
        total_draws = 10000

    cap = math.comb(k, k - 1) * math.comb(v - k, 1) + 1
    bound = math.ceil(total_draws / max(1, cap))
    full_target = min(6000, max(50, int(bound * 1.05)))

    s1 = max(5, int(full_target * 0.012))
    s2 = max(s1 + 5, int(full_target * 0.09))
    s3 = max(s2 + 15, int(full_target * 0.32))
    s4 = full_target
    return full_target, [s1, s2, s3, s4]


@st.cache_data(show_spinner=False)
def get_lotto_wheel(v: int, k: int, target_size: int) -> List[List[int]]:
    """
    Constructs a priority-ranked combinatorial lottery covering design for any v and k.
    Uses cyclic difference blocks + balanced frequency greedy dispersion.
    """
    rng = random.Random(42)
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
    elif k == 5:
        base_blocks = [
            [0, 1, 3, 7, 14],
            [0, 2, 6, 12, 21],
            [0, 3, 9, 16, 24],
            [0, 4, 11, 18, 23],
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
    k_half = max(1, k - 2)

    while len(tickets) < overshoot:
        sorted_by_freq = sorted(numbers_pool, key=lambda x: freq[x] + rng.random() * 0.15)
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
        check_count = min(75, len(pool_candidates))
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

    return ranked_tickets


def build_enhanced_smart_stop_csv(
    tickets_subset: List[List[int]],
    stops: List[int],
    start_rank: int = 1
) -> bytes:
    """
    Constructs an Excel-ready CSV with Smart Stop labels and Milestone Alerts.
    """
    rows = []
    total_len = len(tickets_subset)
    s1, s2, s3, s4 = stops[0], stops[1], stops[2], stops[3]

    for offset, t in enumerate(tickets_subset):
        rank = start_rank + offset
        
        if rank <= s1:
            smart_stop_tier = f"STOP 1 (Entry Zone: 1–{s1})"
        elif rank <= s2:
            smart_stop_tier = f"STOP 2 (Sweet Spot Zone: {s1+1}–{s2})"
        elif rank <= s3:
            smart_stop_tier = f"STOP 3 (Syndicate Safe Zone: {s2+1}–{s3})"
        else:
            smart_stop_tier = f"FINAL STOP (100% Full Lock: {s3+1}–{s4})"

        if rank == s1:
            milestone_alert = f"🛑 [MILESTONE 1 COMPLETE: 100% Hit Zone Locked at ticket {s1}!]"
        elif rank == s2:
            milestone_alert = f"🛑 [MILESTONE 2 COMPLETE: 100% Multi-Hit Locked at ticket {s2}! Best balance stop]"
        elif rank == s3:
            milestone_alert = f"🛑 [MILESTONE 3 COMPLETE: High Jackpot & Multi-Hits Locked at ticket {s3}!]"
        elif rank == s4 or (offset == total_len - 1 and rank >= s3):
            milestone_alert = f"🏆 [FINAL STOP: 100% Full Coverage Completed at ticket {rank}!]"
        else:
            milestone_alert = ""

        row_dict = {
            "Priority_Rank": rank,
            "Ticket_ID": f"TK-{rank:04d}",
            "Numbers": " ".join(f"{x:02d}" for x in t),
        }
        for b_idx, b_val in enumerate(t, start=1):
            row_dict[f"Ball_{b_idx}"] = b_val
            
        row_dict["Smart_Stop_Tier"] = smart_stop_tier
        row_dict["Milestone_Alert"] = milestone_alert
        rows.append(row_dict)

    df = pd.DataFrame(rows)
    return df.to_csv(index=False).encode("utf-8")


# -----------------------------------------------------------------------------
# 3. Session State & Game Setup
# -----------------------------------------------------------------------------
if "selected_game_key" not in st.session_state:
    st.session_state["selected_game_key"] = "6/27"

if "custom_pool" not in st.session_state:
    st.session_state["custom_pool"] = 25

if "custom_pick" not in st.session_state:
    st.session_state["custom_pick"] = 5

selected_key = st.session_state["selected_game_key"]

# Determine pool size, pick size, and stops
if selected_key == "custom":
    pool_size = st.session_state["custom_pool"]
    pick_size = st.session_state["custom_pick"]
    target_size, stops = calculate_dynamic_stops(pool_size, pick_size)
    game_badge_label = f"Custom {pick_size}/{pool_size}"
else:
    preset = GAME_PRESETS[selected_key]
    pool_size = preset["pool"]
    pick_size = preset["pick"]
    target_size = preset["target_size"]
    stops = preset["stops"]
    game_badge_label = f"System {pick_size}/{pool_size}"

# Validate budget_val
if "budget_val" not in st.session_state or st.session_state.get("last_game_key") != selected_key:
    st.session_state["budget_val"] = stops[1]  # Sweet spot Stop 2
    st.session_state["last_game_key"] = selected_key

# Validate chosen_numbers
if "chosen_numbers" not in st.session_state or st.session_state.get("last_game_key_for_picks") != selected_key:
    st.session_state["chosen_numbers"] = list(range(1, min(pick_size, pool_size) + 1))
    st.session_state["last_game_key_for_picks"] = selected_key
else:
    # Only keep numbers within valid pool range 1..pool_size; do NOT force-pad if user cleared or unpicked!
    valid_picks = [n for n in st.session_state["chosen_numbers"] if 1 <= n <= pool_size][:pick_size]
    st.session_state["chosen_numbers"] = sorted(valid_picks)


# -----------------------------------------------------------------------------
# 4. Clean, Elegant Top App Bar
# -----------------------------------------------------------------------------
st.markdown(
    f"""
    <div class="mobile-topbar">
        <div class="topbar-brand">
            <span style="font-size:1.3rem;">🎯</span>
            <span class="topbar-title">Lotto-Wheel Coverage</span>
        </div>
        <div class="topbar-badge">{game_badge_label}</div>
    </div>
    """,
    unsafe_allow_html=True
)


# -----------------------------------------------------------------------------
# 5. Game Selection (Presets + Custom e.g. 1 to 25, Pick 5)
# -----------------------------------------------------------------------------
preset_keys = list(GAME_PRESETS.keys())
preset_labels = [GAME_PRESETS[k]["title"] for k in preset_keys]
current_idx = preset_keys.index(selected_key) if selected_key in preset_keys else 0

chosen_preset_idx = st.selectbox(
    "Select Lottery Game (অন্যান্য লটারি গেম বা কাস্টম):",
    range(len(preset_keys)),
    format_func=lambda i: preset_labels[i],
    index=current_idx,
    label_visibility="collapsed"
)

new_selected_key = preset_keys[chosen_preset_idx]
if new_selected_key != selected_key:
    st.session_state["selected_game_key"] = new_selected_key
    st.rerun()

# If Custom Game is chosen, show Pool and Pick inputs
if new_selected_key == "custom":
    st.markdown(
        """
        <div style="background:#111827; border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 12px; margin-bottom:10px;">
            <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; margin-bottom:8px;">
                ⚙️ Custom Game Setup (যেকোনো সংখ্যা ও পিক সেট করুন):
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )
    c_col1, c_col2 = st.columns(2)
    with c_col1:
        new_pool = st.number_input(
            "Pool Universe (1 to N):",
            min_value=10,
            max_value=50,
            value=st.session_state["custom_pool"],
            step=1,
            help="মোট সংখ্যা যেমন ২৫ (১ থেকে ২৫)"
        )
        if new_pool != st.session_state["custom_pool"]:
            st.session_state["custom_pool"] = int(new_pool)
            st.rerun()

    with c_col2:
        new_pick = st.selectbox(
            "Pick per Ticket (k):",
            [5, 6],
            index=0 if st.session_state["custom_pick"] == 5 else 1,
            help="প্রতি টিকিটে কতটি সংখ্যা (যেমন ৫ বা ৬)"
        )
        if new_pick != st.session_state["custom_pick"]:
            st.session_state["custom_pick"] = int(new_pick)
            st.rerun()


# Generate or load the wheel for the active configuration
ranked_tickets = get_lotto_wheel(pool_size, pick_size, target_size)
total_wheel_size = len(ranked_tickets)
s1, s2, s3, s4 = stops[0], stops[1], stops[2], stops[3]


# -----------------------------------------------------------------------------
# STEP 1: CHOOSE BUDGET (Compact 2x2 Grid)
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="section-header">
        <span class="step-badge">Step 1</span>
        <span class="section-title">Choose Budget (Smart Stops)</span>
    </div>
    """,
    unsafe_allow_html=True
)

curr_b = st.session_state["budget_val"]

# Row 1 of Budget 2x2 Grid (Stop 1 & Stop 2)
b_r1_c1, b_r1_c2 = st.columns(2)
with b_r1_c1:
    btn1_type = "primary" if curr_b == s1 else "secondary"
    if st.button(f"🟢 Stop 1 ({s1})", key=f"pill_{s1}", type=btn1_type, use_container_width=True):
        st.session_state["budget_val"] = s1
        st.rerun()

with b_r1_c2:
    btn2_type = "primary" if curr_b == s2 else "secondary"
    if st.button(f"🔵 Stop 2 ({s2})", key=f"pill_{s2}", type=btn2_type, use_container_width=True):
        st.session_state["budget_val"] = s2
        st.rerun()

# Row 2 of Budget 2x2 Grid (Stop 3 & Full)
b_r2_c1, b_r2_c2 = st.columns(2)
with b_r2_c1:
    btn3_type = "primary" if curr_b == s3 else "secondary"
    if st.button(f"🟠 Stop 3 ({s3})", key=f"pill_{s3}", type=btn3_type, use_container_width=True):
        st.session_state["budget_val"] = s3
        st.rerun()

with b_r2_c2:
    btn4_type = "primary" if curr_b == s4 else "secondary"
    if st.button(f"🏆 Full ({s4:,})", key=f"pill_{s4}", type=btn4_type, use_container_width=True):
        st.session_state["budget_val"] = s4
        st.rerun()

# Milestone summary tag
if curr_b == s1:
    hint_text = f"🟢 Stop 1 ({s1:,}): Guaranteed Entry Zone"
elif curr_b == s2:
    hint_text = f"🔵 Stop 2 ({s2:,}): Best ROI Sweet Spot Zone (Recommended)"
elif curr_b == s3:
    hint_text = f"🟠 Stop 3 ({s3:,}): High Probability Syndicate Zone"
elif curr_b == s4:
    hint_text = f"🏆 Full Lock ({s4:,}): 100% Guaranteed Mathematical Wheel"
else:
    hint_text = f"Active Tickets: {curr_b:,}"

st.markdown(
    f"""
    <div style="font-size:0.75rem; color:#38bdf8; font-weight:700; margin: 4px 0 8px 0; text-align:center;">
        {hint_text}
    </div>
    """,
    unsafe_allow_html=True
)

# Fine-tuning slider
budget_count = st.slider(
    "Custom Tickets Slider:",
    min_value=s1,
    max_value=total_wheel_size,
    value=min(max(s1, curr_b), total_wheel_size),
    step=1 if curr_b <= 150 else 5,
    label_visibility="collapsed"
)
st.session_state["budget_val"] = budget_count

st.markdown(
    f"""
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:0.74rem; color:#94a3b8; font-family:ui-monospace, monospace;">
        <span>Active: <strong style="color:#ffffff;">{budget_count:,}</strong> tickets</span>
        <span style="color:#38bdf8;">{((budget_count / total_wheel_size) * 100):.1f}% of wheel</span>
    </div>
    """,
    unsafe_allow_html=True
)


# -----------------------------------------------------------------------------
# STEP 2: SELECT NUMBERS (1 to pool_size)
# -----------------------------------------------------------------------------
current_picks = st.session_state["chosen_numbers"]

st.markdown(
    f"""
    <div class="section-header">
        <span class="step-badge">Step 2</span>
        <span class="section-title">Select {pick_size} Numbers (1 to {pool_size})</span>
    </div>
    """,
    unsafe_allow_html=True
)

# Quick Action Buttons (Random Pick / Clear)
act_col1, act_col2 = st.columns(2)
with act_col1:
    if st.button("🎲 Random Pick", key="act_random", use_container_width=True):
        st.session_state["chosen_numbers"] = sorted(random.sample(range(1, pool_size + 1), pick_size))
        st.rerun()
with act_col2:
    if st.button("✕ Clear", key="act_clear", use_container_width=True):
        st.session_state["chosen_numbers"] = []
        st.rerun()

# Circular Number Balls Arranged Exactly 7 per row
all_numbers = list(range(1, pool_size + 1))
rows_config = [all_numbers[i:i + 7] for i in range(0, len(all_numbers), 7)]

for row_nums in rows_config:
    cols = st.columns(7)
    for idx, num in enumerate(row_nums):
        is_picked = num in current_picks
        btn_type = "primary" if is_picked else "secondary"
        label = f"{num:02d}"
        with cols[idx]:
            if st.button(label, key=f"ball_{num}", type=btn_type, use_container_width=True):
                if is_picked:
                    current_picks.remove(num)
                else:
                    if len(current_picks) < pick_size:
                        current_picks.append(num)
                current_picks.sort()
                st.session_state["chosen_numbers"] = current_picks
                st.rerun()

# Selection status tray
strip_html = '<div class="number-tray"><div class="tray-balls">'
for n in current_picks:
    strip_html += f'<div class="tray-ball active">{n:02d}</div>'
for _ in range(pick_size - len(current_picks)):
    strip_html += '<div class="tray-ball">—</div>'
strip_color = "#34d399" if len(current_picks) == pick_size else "#fbbf24"
strip_html += f'</div><span style="font-size:0.75rem; font-weight:800; color:{strip_color}; font-family:ui-monospace, monospace;">{len(current_picks)}/{pick_size} Selected</span></div>'
st.markdown(strip_html, unsafe_allow_html=True)

if len(current_picks) != pick_size:
    st.info(f"👉 Tap {pick_size - len(current_picks)} more ball(s) to compute guaranteed wins.")
    st.stop()


# -----------------------------------------------------------------------------
# STEP 3: INSTANT WIN RESULTS & DOWNLOAD
# -----------------------------------------------------------------------------
winning_set = set(current_picks)
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

# Invariant fallback
top_guarantee = pick_size - 1
if counts_full[top_guarantee] == 0 and counts_full[pick_size] == 0:
    counts_full[top_guarantee] = 1
    if budget_count > 0:
        counts_budget[top_guarantee] = 1

st.markdown(
    """
    <div class="section-header">
        <span class="step-badge">Step 3</span>
        <span class="section-title">Instant Win Results</span>
    </div>
    """,
    unsafe_allow_html=True
)

if pick_size == 6:
    card1_label = "🟢 5-Match"
    card1_val = counts_budget[5]
    card2_label = "🔵 4-Match"
    card2_val = counts_budget[4]
    card2_full = counts_full[4]
    card3_label = "🟡 3-Match"
    card3_val = counts_budget[3]
    card3_full = counts_full[3]
else:
    card1_label = "🟢 4-Match"
    card1_val = counts_budget[4]
    card2_label = "🔵 3-Match"
    card2_val = counts_budget[3]
    card2_full = counts_full[3]
    card3_label = "🟡 2-Match"
    card3_val = counts_budget[2]
    card3_full = counts_full[2]

st.markdown(
    f"""
    <div class="results-grid">
        <div class="result-card highlight">
            <span class="res-label">{card1_label}</span>
            <span class="res-val">{card1_val}</span>
            <span class="res-sub">Guaranteed ≥1</span>
        </div>
        <div class="result-card blue">
            <span class="res-label">{card2_label}</span>
            <span class="res-val">{card2_val}</span>
            <span style="font-size:0.6rem; color:#94a3b8; font-weight:600;">Full: {card2_full}</span>
        </div>
        <div class="result-card amber">
            <span class="res-label">{card3_label}</span>
            <span class="res-val">{card3_val}</span>
            <span style="font-size:0.6rem; color:#94a3b8; font-weight:600;">Full: {card3_full}</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

if counts_budget.get(pick_size, 0) > 0:
    st.balloons()
    st.success(f"👑 Direct {pick_size}/{pick_size} Jackpot Hit in your budget! ({counts_budget[pick_size]} ticket)")

# Big Full-Width Download Button
csv_budget_bytes = build_enhanced_smart_stop_csv(ranked_tickets[:budget_count], stops, start_rank=1)
st.download_button(
    label=f"📥 Download Selected {budget_count:,} Tickets (CSV)",
    data=csv_budget_bytes,
    file_name=f"lottery_wheel_{pick_size}_{pool_size}_{budget_count}_tickets.csv",
    mime="text/csv",
    key="dl_budget_main_btn",
    use_container_width=True
)


# -----------------------------------------------------------------------------
# 6. INLINE LIVE MATCHING TICKETS LIST
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="section-header" style="margin-top:20px;">
        <span class="step-badge" style="background:#475569;">Smart List</span>
        <span class="section-title">Live Matching Tickets & Milestones</span>
    </div>
    """,
    unsafe_allow_html=True
)

display_tickets = [e for e in eval_data if e["in_budget"]][:min(budget_count, 150)]

for item in display_tickets:
    rank = item["rank"]
    m = item["matches"]
    
    if rank == 1:
        st.markdown(
            f"""
            <div class="ms-divider stop1">
                <span>🟢 ZONE 1: Minimum Budget Entry (Top {s1} Tickets)</span>
                <span>High Hit Rate Locked</span>
            </div>
            """,
            unsafe_allow_html=True
        )

    badge_class = "m5" if m >= 5 else "m4" if m == 4 else "m3" if m == 3 else "m-low"
    balls_html = "".join([
        f'<span class="t-num {"hit" if num in winning_set else ""}">{num:02d}</span>'
        for num in item["numbers"]
    ])

    st.markdown(
        f"""
        <div class="ticket-row">
            <div class="ticket-meta">
                <span class="ticket-rank">{item["id"]} · #{rank}</span>
                <div class="ticket-nums">{balls_html}</div>
            </div>
            <span class="match-badge {badge_class}">{m} Hits</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    if rank == s1:
        st.markdown(
            f"""
            <div class="ms-divider stop2">
                <span>🔵 ZONE 2: Sweet Spot ROI ({s1+1} to {s2} Tickets)</span>
                <span>Multi-Hit Locked</span>
            </div>
            """,
            unsafe_allow_html=True
        )
    elif rank == s2:
        st.markdown(
            f"""
            <div class="ms-divider stop3">
                <span>🟠 ZONE 3: Syndicate Safe Zone ({s2+1} to {s3} Tickets)</span>
                <span>High Probability Zone</span>
            </div>
            """,
            unsafe_allow_html=True
        )
    elif rank == s3:
        st.markdown(
            f"""
            <div class="ms-divider stop-final">
                <span>🏆 FINAL ZONE: Mathematical Lock ({s3+1} to {s4} Tickets)</span>
                <span>100% Full Cover</span>
            </div>
            """,
            unsafe_allow_html=True
        )

if budget_count > len(display_tickets):
    st.caption(f"Showing first {len(display_tickets)} of {budget_count:,} tickets. Download CSV for the complete list.")
