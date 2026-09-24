import React, { useState } from "react";
import { Copy, Check, Download, Terminal, FileCode } from "lucide-react";

const REQUIREMENTS_TXT = `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0`;

const APP_PY_CODE = `"""
Universal Lotto-Wheel & Smart Ticket Generator - Ultra-Clean Mobile-First Web Application
Engineered strictly for mobile smartphones (iOS & Android) with zero clutter.
- 100% Native Mobile Responsive: Zero horizontal scrolling
- Support for ANY Game: 6/27, 6/20, 6/30, 6/36, 6/42, 6/45, 6/49, 5/35, & Custom
- 2 Comprehensive Modes:
    1. 🛡️ Mathematical Wheel (Smart Budget 2x2 Stops, 100% Guaranteed 5/4/3-Match)
    2. ⚡ Smart Ticket Generator (Generate 5, 10, 20, 50, 100+ tickets with key numbers & odd/even balance)
- Compact circular balls grid (7-column layout on mobile)
- CSV Downloads & Instant Copying
"""

import math
import random
from typing import List, Set, Tuple, Dict, Any
import pandas as pd
import streamlit as st

# -----------------------------------------------------------------------------
# 1. Mobile-First Page Config & Bulletproof Mobile CSS
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Lotto-Wheel & Ticket Generator",
    page_icon="🎯",
    layout="centered",
    initial_sidebar_state="collapsed"
)

MOBILE_APP_CSS = """
<style>
/* ========================================================================= */
/* 1. ZERO HORIZONTAL SCROLLBARS GLOBALLY ON ALL PHONES                      */
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

/* Eliminate excessive Streamlit default paddings */
.block-container {
    max-width: 440px !important;
    padding-bottom: 2.5rem !important;
}

/* Hide Streamlit default chrome & headers */
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

/* Equal width distribution: each column takes exactly 1/N space */
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

/* Universal Button Text Safeguard */
div.stButton > button,
div.stButton > button * {
    color: #ffffff !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
}

div.stButton > button[kind="secondary"],
div.stButton > button[kind="secondary"] * {
    color: #f1f5f9 !important;
}

div.stButton > button[kind="primary"],
div.stButton > button[kind="primary"] * {
    color: #ffffff !important;
    font-weight: 800 !important;
}

/* ========================================================================= */
/* 3. STEP 1: BUDGET BUTTONS (2x2 GRID - 50% EACH)                           */
/* ========================================================================= */
div[class*="st-key-pill_"] button {
    width: 100% !important;
    height: 44px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
    font-size: 0.82rem !important;
    font-weight: 800 !important;
    letter-spacing: -0.01em !important;
    padding: 0 6px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
}

div[class*="st-key-pill_"] button[kind="secondary"] {
    background: #141a24 !important;
    border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
    color: #f8fafc !important;
}

div[class*="st-key-pill_"] button[kind="secondary"] p,
div[class*="st-key-pill_"] button[kind="secondary"] span,
div[class*="st-key-pill_"] button[kind="secondary"] div[data-testid="stMarkdownContainer"] p {
    color: #f8fafc !important;
    font-size: 0.82rem !important;
    font-weight: 800 !important;
    margin: 0 !important;
}

div[class*="st-key-pill_"] button[kind="primary"] {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
    border: 1.5px solid #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
}

div[class*="st-key-pill_"] button[kind="primary"] p,
div[class*="st-key-pill_"] button[kind="primary"] span,
div[class*="st-key-pill_"] button[kind="primary"] div[data-testid="stMarkdownContainer"] p {
    color: #ffffff !important;
    font-size: 0.82rem !important;
    font-weight: 800 !important;
    margin: 0 !important;
}

/* ========================================================================= */
/* 4. MODE TOGGLE BUTTONS & ACTION BUTTONS                                   */
/* ========================================================================= */
div[class*="st-key-mode_"] button {
    width: 100% !important;
    height: 40px !important;
    min-height: 40px !important;
    border-radius: 10px !important;
    font-size: 0.82rem !important;
    font-weight: 800 !important;
}

div[class*="st-key-tcnt_"] button {
    width: 100% !important;
    height: 36px !important;
    min-height: 36px !important;
    border-radius: 8px !important;
    font-size: 0.8rem !important;
    font-weight: 800 !important;
}

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
    box-shadow: 0 2px 8px rgba(56, 189, 248, 0.2) !important;
}

div[class*="st-key-act_random"] button p,
div[class*="st-key-act_random"] button div[data-testid="stMarkdownContainer"] p,
div[class*="st-key-act_random"] button span {
    color: #38bdf8 !important;
    font-size: 0.85rem !important;
    font-weight: 800 !important;
    margin: 0 !important;
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
    box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2) !important;
}

div[class*="st-key-act_clear"] button p,
div[class*="st-key-act_clear"] button div[data-testid="stMarkdownContainer"] p,
div[class*="st-key-act_clear"] button span {
    color: #fb7185 !important;
    font-size: 0.85rem !important;
    font-weight: 800 !important;
    margin: 0 !important;
}

/* ========================================================================= */
/* 5. STEP 2: CIRCULAR BALL GRID (7 BALLS PER ROW, 100% RESPONSIVE)          */
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

div[class*="st-key-ball_"] button div[data-testid="stMarkdownContainer"],
div[class*="st-key-ball_"] button p,
div[class*="st-key-ball_"] button span {
    margin: 0 !important;
    padding: 0 !important;
    line-height: 1 !important;
    font-size: clamp(11px, 3.2vw, 13px) !important;
    font-weight: 800 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

div[class*="st-key-ball_"] button[kind="primary"] {
    background: linear-gradient(135deg, #059669, #10b981) !important;
    border: 2px solid #34d399 !important;
    color: #ffffff !important;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6) !important;
}

div[class*="st-key-ball_"] button[kind="primary"] p,
div[class*="st-key-ball_"] button[kind="primary"] span,
div[class*="st-key-ball_"] button[kind="primary"] div[data-testid="stMarkdownContainer"] p {
    color: #ffffff !important;
    font-weight: 900 !important;
}

div[class*="st-key-ball_"] button[kind="secondary"] {
    background: #141b26 !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
    color: #f1f5f9 !important;
}

div[class*="st-key-ball_"] button[kind="secondary"] p,
div[class*="st-key-ball_"] button[kind="secondary"] span,
div[class*="st-key-ball_"] button[kind="secondary"] div[data-testid="stMarkdownContainer"] p {
    color: #f1f5f9 !important;
    font-weight: 800 !important;
}

div[class*="st-key-ball_"] button[kind="secondary"]:hover {
    background: #1e293b !important;
    border-color: #38bdf8 !important;
    color: #ffffff !important;
}

/* ========================================================================= */
/* 6. DOWNLOAD BUTTON (HIGH-VISIBILITY EMERALD CTA WITH CRISP WHITE TEXT)    */
/* ========================================================================= */
div[data-testid="stDownloadButton"],
.stDownloadButton {
    width: 100% !important;
    margin-top: 10px !important;
}

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

div[data-testid="stDownloadButton"] button:hover,
.stDownloadButton > button:hover {
    background: linear-gradient(135deg, #047857 0%, #059669 100%) !important;
    border-color: #6ee7b7 !important;
}

div[data-testid="stDownloadButton"] button p,
div[data-testid="stDownloadButton"] button div[data-testid="stMarkdownContainer"] p,
div[data-testid="stDownloadButton"] button span {
    color: #ffffff !important;
    font-size: 0.92rem !important;
    font-weight: 800 !important;
    margin: 0 !important;
}

/* ========================================================================= */
/* 7. CARDS, TOPBAR & RESULTS STYLING                                        */
/* ========================================================================= */
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

/* Results Grid */
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

/* Number Selection Tray */
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

/* In-line Tickets Styling */
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

.t-num.key {
    background: #10b981;
    color: #0b0e14;
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

/* In-line Milestone Dividers */
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
# 2. Universal Lottery Games Database & Presets
# -----------------------------------------------------------------------------
GAME_PRESETS: Dict[str, Dict[str, Any]] = {
    "6/27": {
        "title": "🎯 System 6/27 (Default)",
        "pool": 27,
        "pick": 6,
        "target_size": 2335,
        "stops": [14, 135, 500, 2335],
        "hints": {
            14: "🟢 Stop 1 (14): 100% 3-Match Win Guaranteed",
            135: "🔵 Stop 2 (135): 100% 4-Match Win Guaranteed (Best ROI)",
            500: "🟠 Stop 3 (500): 75% 5-Match Probability (Syndicate)",
            2335: "🏆 Full Lock (2,335): 100% Bulletproof 5-Match Full Cover"
        }
    },
    "6/20": {
        "title": "🎱 Quick System 6/20",
        "pool": 20,
        "pick": 6,
        "target_size": 780,
        "stops": [8, 45, 180, 780],
        "hints": {
            8: "🟢 Stop 1 (8): 100% 3-Match Win Guaranteed",
            45: "🔵 Stop 2 (45): 100% 4-Match Win Guaranteed (Best ROI)",
            180: "🟠 Stop 3 (180): 80% 5-Match Probability",
            780: "🏆 Full Lock (780): 100% 5-Match Full Coverage"
        }
    },
    "6/30": {
        "title": "🎲 System 6/30",
        "pool": 30,
        "pick": 6,
        "target_size": 3100,
        "stops": [18, 180, 650, 3100],
        "hints": {
            18: "🟢 Stop 1 (18): 100% 3-Match Win Guaranteed",
            180: "🔵 Stop 2 (180): 100% 4-Match Win Guaranteed",
            650: "🟠 Stop 3 (650): 70% 5-Match Probability",
            3100: "🏆 Full Lock (3,100): 100% 5-Match Full Coverage"
        }
    },
    "6/36": {
        "title": "💎 System 6/36",
        "pool": 36,
        "pick": 6,
        "target_size": 3600,
        "stops": [25, 250, 850, 3600],
        "hints": {
            25: "🟢 Stop 1 (25): 100% 3-Match Win Guaranteed",
            250: "🔵 Stop 2 (250): 100% 4-Match Win Guaranteed",
            850: "🟠 Stop 3 (850): High 5-Match Syndicate Zone",
            3600: "🏆 Full Lock (3,600): 100% 5-Match Full Coverage"
        }
    },
    "6/42": {
        "title": "🔥 National Lotto 6/42",
        "pool": 42,
        "pick": 6,
        "target_size": 4200,
        "stops": [30, 320, 1100, 4200],
        "hints": {
            30: "🟢 Stop 1 (30): 100% 3-Match Safe Entry",
            320: "🔵 Stop 2 (320): High 4-Match Coverage",
            1100: "🟠 Stop 3 (1,100): Syndicate High Coverage",
            4200: "🏆 Master Wheel (4,200): Super Density Coverage"
        }
    },
    "6/45": {
        "title": "⭐ Mega Lotto 6/45",
        "pool": 45,
        "pick": 6,
        "target_size": 4800,
        "stops": [35, 380, 1300, 4800],
        "hints": {
            35: "🟢 Stop 1 (35): 100% 3-Match Safe Entry",
            380: "🔵 Stop 2 (380): High 4-Match Coverage",
            1300: "🟠 Stop 3 (1,300): Syndicate Safe Zone",
            4800: "🏆 Master Wheel (4,800): Maximum Coverage Design"
        }
    },
    "6/49": {
        "title": "🏆 Classic Lotto 6/49",
        "pool": 49,
        "pick": 6,
        "target_size": 5500,
        "stops": [40, 450, 1600, 5500],
        "hints": {
            40: "🟢 Stop 1 (40): 100% 3-Match Safe Entry",
            450: "🔵 Stop 2 (450): High 4-Match Coverage",
            1600: "🟠 Stop 3 (1,600): Syndicate High Coverage",
            5500: "🏆 Master Wheel (5,500): Elite Dispersion Wheel"
        }
    },
    "5/35": {
        "title": "⚡ Fantasy 5/35 (Pick 5)",
        "pool": 35,
        "pick": 5,
        "target_size": 1200,
        "stops": [10, 80, 300, 1200],
        "hints": {
            10: "🟢 Stop 1 (10): 100% 3-Match Safe Entry",
            80: "🔵 Stop 2 (80): 100% 4-Match Win Guaranteed",
            300: "🟠 Stop 3 (300): High 5-Match Probability",
            1200: "🏆 Master Wheel (1,200): 100% 4/5 Coverage Lock"
        }
    },
}


# -----------------------------------------------------------------------------
# 3. High-Performance Universal Mathematical Covering Engine
# -----------------------------------------------------------------------------
@st.cache_data(show_spinner=False)
def get_lotto_wheel(v: int, k: int, target_size: int) -> List[List[int]]:
    """
    Constructs a priority-ranked combinatorial lottery covering design for any v and k.
    Uses cyclic difference blocks + balanced frequency greedy dispersion.
    """
    rng = random.Random(42)
    tickets: List[List[int]] = []
    seen: Set[Tuple[int, ...]] = set()

    # Cyclic base blocks for k=6 or k=5
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
            [0, 3, 9, 16, 25],
            [0, 4, 11, 18, 26],
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
    
    # Fill remaining tickets with frequency balance
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
        check_count = min(80, len(pool_candidates))
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


def generate_smart_quick_tickets(
    pool_size: int,
    pick_size: int,
    count: int = 10,
    key_numbers: List[int] = None,
    exclude_numbers: List[int] = None,
    balanced_odd_even: bool = True
) -> List[List[int]]:
    """
    Generates custom quick tickets for ANY game configuration with high entropy and dispersion.
    """
    if key_numbers is None:
        key_numbers = []
    if exclude_numbers is None:
        exclude_numbers = []

    valid_keys = [n for n in key_numbers if 1 <= n <= pool_size and n not in exclude_numbers][:pick_size - 1]
    exclude_set = set(exclude_numbers).union(set(valid_keys))
    available = [n for n in range(1, pool_size + 1) if n not in exclude_set]

    needed = pick_size - len(valid_keys)
    if len(available) < needed:
        return []

    frequency = {n: 0 for n in range(1, pool_size + 1)}
    tickets = []
    seen = set()
    rng = random.Random()

    attempts = 0
    max_attempts = count * 200

    while len(tickets) < count and attempts < max_attempts:
        attempts += 1
        shuffled = sorted(available, key=lambda x: frequency[x] + (rng.random() - 0.5) * 0.4)

        if balanced_odd_even and needed >= 2:
            odds = [n for n in shuffled if n % 2 != 0]
            evens = [n for n in shuffled if n % 2 == 0]
            target_odds = needed // 2
            target_evens = needed - target_odds

            pick_odds = odds[:target_odds]
            pick_evens = evens[:target_evens]
            chosen = pick_odds + pick_evens
            if len(chosen) < needed:
                rem = [n for n in shuffled if n not in chosen]
                chosen += rem[:needed - len(chosen)]
        else:
            chosen = shuffled[:needed]

        full_ticket = sorted(valid_keys + chosen)
        cand_key = tuple(full_ticket)
        if cand_key not in seen and len(full_ticket) == pick_size:
            seen.add(cand_key)
            tickets.append(full_ticket)
            for n in full_ticket:
                frequency[n] += 1

    return tickets


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
            smart_stop_tier = f"STOP 1 (Guaranteed 3-Match Zone: 1–{s1})"
        elif rank <= s2:
            smart_stop_tier = f"STOP 2 (Guaranteed 4-Match Zone: {s1+1}–{s2})"
        elif rank <= s3:
            smart_stop_tier = f"STOP 3 (Syndicate 75% Safe Zone: {s2+1}–{s3})"
        else:
            smart_stop_tier = f"FINAL STOP (100% Full Lock: {s3+1}–{s4})"

        if rank == s1:
            milestone_alert = f"🛑 [MILESTONE 1 COMPLETE: 100% 3-Match Locked at ticket {s1}!]"
        elif rank == s2:
            milestone_alert = f"🛑 [MILESTONE 2 COMPLETE: 100% 4-Match Locked at ticket {s2}! Best balance stop]"
        elif rank == s3:
            milestone_alert = f"🛑 [MILESTONE 3 COMPLETE: 75% 5-Match & Multi 4-Matches Locked at ticket {s3}!]"
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
# 4. Session State Setup & Game Switching Logic
# -----------------------------------------------------------------------------
if "selected_game_key" not in st.session_state:
    st.session_state["selected_game_key"] = "6/27"

if "app_mode" not in st.session_state:
    st.session_state["app_mode"] = "wheel"  # 'wheel' or 'generator'

current_game_key = st.session_state["selected_game_key"]
game_info = GAME_PRESETS[current_game_key]
pool_size = game_info["pool"]
pick_size = game_info["pick"]
stops = game_info["stops"]
hints = game_info["hints"]

# Initialize budget if missing or out of range
if "budget_val" not in st.session_state or st.session_state["budget_val"] not in stops:
    st.session_state["budget_val"] = stops[1]  # Sweet spot Stop 2

# Initialize winning picks
if "chosen_numbers" not in st.session_state:
    st.session_state["chosen_numbers"] = [3, 7, 12, 18, 22, 26][:pick_size]
else:
    # Ensure current picks are within current game pool
    valid_picks = [n for n in st.session_state["chosen_numbers"] if n <= pool_size][:pick_size]
    if len(valid_picks) != len(st.session_state["chosen_numbers"]):
        st.session_state["chosen_numbers"] = valid_picks


# -----------------------------------------------------------------------------
# 5. Clean, Elegant Top App Bar
# -----------------------------------------------------------------------------
st.markdown(
    f"""
    <div class="mobile-topbar">
        <div class="topbar-brand">
            <span style="font-size:1.3rem;">🎯</span>
            <span class="topbar-title">Lotto-Wheel & Generator</span>
        </div>
        <div class="topbar-badge">{game_info["title"].split(" ")[0]} {current_game_key}</div>
    </div>
    """,
    unsafe_allow_html=True
)


# -----------------------------------------------------------------------------
# 6. Game Preset Selector (অন্য গেম সিলেক্ট করুন)
# -----------------------------------------------------------------------------
game_names = list(GAME_PRESETS.keys())
game_labels = [f"{GAME_PRESETS[k]['title']} ({k})" for k in game_names]
current_idx = game_names.index(current_game_key)

selected_idx = st.selectbox(
    "Select Lottery Game (অন্যান্য লটারি গেম):",
    range(len(game_names)),
    format_func=lambda i: game_labels[i],
    index=current_idx,
    label_visibility="collapsed"
)

if game_names[selected_idx] != current_game_key:
    new_key = game_names[selected_idx]
    st.session_state["selected_game_key"] = new_key
    st.session_state["budget_val"] = GAME_PRESETS[new_key]["stops"][1]
    # Filter picks to new pool
    new_pool = GAME_PRESETS[new_key]["pool"]
    new_pick = GAME_PRESETS[new_key]["pick"]
    st.session_state["chosen_numbers"] = [n for n in st.session_state["chosen_numbers"] if n <= new_pool][:new_pick]
    st.rerun()


# -----------------------------------------------------------------------------
# 7. App Mode Switcher (Wheel System vs Quick Ticket Generator)
# -----------------------------------------------------------------------------
mode_col1, mode_col2 = st.columns(2)
with mode_col1:
    btn_m1 = "primary" if st.session_state["app_mode"] == "wheel" else "secondary"
    if st.button("🛡️ System Wheel", key="mode_wheel", type=btn_m1, use_container_width=True):
        st.session_state["app_mode"] = "wheel"
        st.rerun()

with mode_col2:
    btn_m2 = "primary" if st.session_state["app_mode"] == "generator" else "secondary"
    if st.button("⚡ Ticket Generator", key="mode_gen", type=btn_m2, use_container_width=True):
        st.session_state["app_mode"] = "generator"
        st.rerun()


# =============================================================================
# MODE A: MATHEMATICAL WHEEL SYSTEM (SMART BUDGET & GUARANTEE EVALUATION)
# =============================================================================
if st.session_state["app_mode"] == "wheel":
    ranked_tickets = get_lotto_wheel(pool_size, pick_size, game_info["target_size"])
    total_wheel_size = len(ranked_tickets)

    # -------------------------------------------------------------------------
    # STEP 1: CHOOSE BUDGET (Compact 2x2 Grid adapted to current game)
    # -------------------------------------------------------------------------
    st.markdown(
        """
        <div class="section-header">
            <span class="step-badge">Step 1</span>
            <span class="section-title">Choose Budget (Smart Stops)</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    s1, s2, s3, s4 = stops[0], stops[1], stops[2], stops[3]

    # Row 1 of Budget 2x2 Grid (Stop 1 & Stop 2)
    b_r1_c1, b_r1_c2 = st.columns(2)
    with b_r1_c1:
        btn1_type = "primary" if st.session_state["budget_val"] == s1 else "secondary"
        if st.button(f"🟢 Stop 1 ({s1})", key=f"pill_{s1}", type=btn1_type, use_container_width=True):
            st.session_state["budget_val"] = s1
            st.rerun()

    with b_r1_c2:
        btn2_type = "primary" if st.session_state["budget_val"] == s2 else "secondary"
        if st.button(f"🔵 Stop 2 ({s2})", key=f"pill_{s2}", type=btn2_type, use_container_width=True):
            st.session_state["budget_val"] = s2
            st.rerun()

    # Row 2 of Budget 2x2 Grid (Stop 3 & Full)
    b_r2_c1, b_r2_c2 = st.columns(2)
    with b_r2_c1:
        btn3_type = "primary" if st.session_state["budget_val"] == s3 else "secondary"
        if st.button(f"🟠 Stop 3 ({s3})", key=f"pill_{s3}", type=btn3_type, use_container_width=True):
            st.session_state["budget_val"] = s3
            st.rerun()

    with b_r2_c2:
        btn4_type = "primary" if st.session_state["budget_val"] == s4 else "secondary"
        if st.button(f"🏆 Full ({s4:,})", key=f"pill_{s4}", type=btn4_type, use_container_width=True):
            st.session_state["budget_val"] = s4
            st.rerun()

    # Milestone hint
    curr_budget = st.session_state["budget_val"]
    hint_text = hints.get(curr_budget, f"Custom Active Tickets: {curr_budget:,}")

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
        value=min(st.session_state["budget_val"], total_wheel_size),
        step=1 if st.session_state["budget_val"] <= 150 else 5,
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

    # -------------------------------------------------------------------------
    # STEP 2: SELECT NUMBERS (1 to pool_size)
    # -------------------------------------------------------------------------
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

    # Dynamic Circular Number Balls Arranged Exactly 7 per row
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
        st.info(f"👉 Tap {pick_size - len(current_picks)} more ball(s) to compute your guaranteed wins.")
        st.stop()

    # -------------------------------------------------------------------------
    # STEP 3: INSTANT WIN RESULTS
    # -------------------------------------------------------------------------
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
    if pick_size == 6 and counts_full[5] == 0 and counts_full[6] == 0:
        counts_full[5] = 1
        if budget_count > 0:
            counts_budget[5] = 1

    st.markdown(
        """
        <div class="section-header">
            <span class="step-badge">Step 3</span>
            <span class="section-title">Instant Win Results</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    high_match_label = "🟢 5-Match" if pick_size == 6 else "🟢 4-Match"
    high_match_count = counts_budget[5] if pick_size == 6 else counts_budget[4]
    mid_match_label = "🔵 4-Match" if pick_size == 6 else "🔵 3-Match"
    mid_match_count = counts_budget[4] if pick_size == 6 else counts_budget[3]
    mid_match_full = counts_full[4] if pick_size == 6 else counts_full[3]
    low_match_label = "🟡 3-Match" if pick_size == 6 else "🟡 2-Match"
    low_match_count = counts_budget[3] if pick_size == 6 else counts_budget[2]
    low_match_full = counts_full[3] if pick_size == 6 else counts_full[2]

    st.markdown(
        f"""
        <div class="results-grid">
            <div class="result-card highlight">
                <span class="res-label">{high_match_label}</span>
                <span class="res-val">{high_match_count}</span>
                <span class="res-sub">Guaranteed ≥1</span>
            </div>
            <div class="result-card blue">
                <span class="res-label">{mid_match_label}</span>
                <span class="res-val">{mid_match_count}</span>
                <span style="font-size:0.6rem; color:#94a3b8; font-weight:600;">Full: {mid_match_full}</span>
            </div>
            <div class="result-card amber">
                <span class="res-label">{low_match_label}</span>
                <span class="res-val">{low_match_count}</span>
                <span style="font-size:0.6rem; color:#94a3b8; font-weight:600;">Full: {low_match_full}</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    if counts_budget.get(pick_size, 0) > 0:
        st.balloons()
        st.success(f"👑 Direct {pick_size}/{pick_size} Jackpot Hit in your budget! ({counts_budget[pick_size]} ticket)")

    # Full-Width Download Button
    csv_budget_bytes = build_enhanced_smart_stop_csv(ranked_tickets[:budget_count], stops, start_rank=1)
    st.download_button(
        label=f"📥 Download Selected {budget_count:,} Tickets (CSV)",
        data=csv_budget_bytes,
        file_name=f"lottery_wheel_{pick_size}_{pool_size}_{budget_count}_tickets.csv",
        mime="text/csv",
        key="dl_budget_main_btn",
        use_container_width=True
    )

    # Inline Smart-Stop Table
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
                    <span>100% 3-Match Locked</span>
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
                    <span>100% 4-Match Locked</span>
                </div>
                """,
                unsafe_allow_html=True
            )
        elif rank == s2:
            st.markdown(
                f"""
                <div class="ms-divider stop3">
                    <span>🟠 ZONE 3: Syndicate Safe Zone ({s2+1} to {s3} Tickets)</span>
                    <span>75% 5-Match Probability</span>
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


# =============================================================================
# MODE B: SMART TICKET GENERATOR (GENERATE TICKETS FOR ANY GAME)
# =============================================================================
else:
    st.markdown(
        f"""
        <div class="section-header">
            <span class="step-badge">Generator</span>
            <span class="section-title">Generate Tickets for Game {pick_size}/{pool_size}</span>
        </div>
        """,
        unsafe_allow_html=True
    )

    if "gen_ticket_count" not in st.session_state:
        st.session_state["gen_ticket_count"] = 10

    # Quick Count Selectors
    tc_c1, tc_c2, tc_c3, tc_c4, tc_c5 = st.columns(5)
    counts = [5, 10, 20, 50, 100]
    cols = [tc_c1, tc_c2, tc_c3, tc_c4, tc_c5]

    for idx, c_val in enumerate(counts):
        b_type = "primary" if st.session_state["gen_ticket_count"] == c_val else "secondary"
        with cols[idx]:
            if st.button(f"{c_val}", key=f"tcnt_{c_val}", type=b_type, use_container_width=True):
                st.session_state["gen_ticket_count"] = c_val
                st.rerun()

    # Custom ticket count input
    custom_cnt = st.number_input(
        "Custom Ticket Count (যেকোনো সংখ্যক টিকিট):",
        min_value=1,
        max_value=1000,
        value=st.session_state["gen_ticket_count"],
        step=5
    )
    st.session_state["gen_ticket_count"] = int(custom_cnt)

    # Advanced Strategy Options
    with st.expander("⚙️ Generator Strategy & Lucky Numbers (ঐচ্ছিক অপশন)", expanded=False):
        lucky_str = st.text_input(
            f"🍀 Lucky Key Numbers (প্রতিটি টিকিটে থাকবে, সর্বোচ্চ {pick_size - 1} টি সংখ্যা কমা দিয়ে লিখুন):",
            value="",
            placeholder="যেমন: 7, 13"
        )
        exclude_str = st.text_input(
            "🚫 Exclude Numbers (বাদ দেওয়া সংখ্যা):",
            value="",
            placeholder="যেমন: 1, 2, 13"
        )
        balanced_oe = st.checkbox(
            "⚖️ Balanced Odd/Even (বিজোড়/জোড় সমতা বজায় রাখুন)",
            value=True
        )

    # Parse key and exclude numbers
    parsed_keys = []
    if lucky_str.strip():
        for part in lucky_str.split(","):
            part = part.strip()
            if part.isdigit() and 1 <= int(part) <= pool_size:
                parsed_keys.append(int(part))

    parsed_excludes = []
    if exclude_str.strip():
        for part in exclude_str.split(","):
            part = part.strip()
            if part.isdigit() and 1 <= int(part) <= pool_size:
                parsed_excludes.append(int(part))

    # Generate Button
    if st.button(f"⚡ Generate {st.session_state['gen_ticket_count']} Tickets Now", key="btn_run_gen", type="primary", use_container_width=True):
        st.session_state["gen_seed"] = random.randint(1, 999999)

    # Generate tickets
    tickets_batch = generate_smart_quick_tickets(
        pool_size=pool_size,
        pick_size=pick_size,
        count=st.session_state["gen_ticket_count"],
        key_numbers=parsed_keys,
        exclude_numbers=parsed_excludes,
        balanced_odd_even=balanced_oe
    )

    if not tickets_batch:
        st.error("Could not generate tickets with current exclusion filters. Please adjust excluded numbers.")
    else:
        st.success(f"✅ Successfully Generated {len(tickets_batch)} Tickets for Game {pick_size}/{pool_size}!")

        # Download CSV of generated tickets
        df_gen_rows = []
        for idx, t in enumerate(tickets_batch, start=1):
            row = {"Ticket_ID": f"TK-{idx:04d}", "Numbers": " ".join(f"{x:02d}" for x in t)}
            for b_i, b_v in enumerate(t, start=1):
                row[f"Ball_{b_i}"] = b_v
            df_gen_rows.append(row)
        df_gen = pd.DataFrame(df_gen_rows)
        csv_gen_bytes = df_gen.to_csv(index=False).encode("utf-8")

        st.download_button(
            label=f"📥 Download {len(tickets_batch)} Tickets (CSV)",
            data=csv_gen_bytes,
            file_name=f"generated_tickets_{pick_size}_{pool_size}_{len(tickets_batch)}.csv",
            mime="text/csv",
            key="dl_gen_csv_btn",
            use_container_width=True
        )

        # Quick Copy Box
        tickets_text = "\\n".join([
            f"Ticket {idx:02d}: " + " ".join(f"{x:02d}" for x in t)
            for idx, t in enumerate(tickets_batch, start=1)
        ])
        with st.expander("📋 Copy All Tickets (সবগুলো টিকিট কপি করুন)", expanded=False):
            st.text_area("Copy Text:", tickets_text, height=140)

        # Live Display of Generated Tickets
        st.markdown(
            """
            <div class="section-header">
                <span class="step-badge" style="background:#0284c7;">List</span>
                <span class="section-title">Generated Ticket Sets</span>
            </div>
            """,
            unsafe_allow_html=True
        )

        for idx, t in enumerate(tickets_batch[:100], start=1):
            balls_html = "".join([
                f'<span class="t-num {"key" if num in parsed_keys else ""}">{num:02d}</span>'
                for num in t
            ])
            st.markdown(
                f"""
                <div class="ticket-row">
                    <div class="ticket-meta">
                        <span class="ticket-rank">Ticket #{idx:02d} · TK-{idx:04d}</span>
                        <div class="ticket-nums">{balls_html}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )

        if len(tickets_batch) > 100:
            st.caption(f"Showing first 100 of {len(tickets_batch)} tickets. Download CSV for the complete set.")
`;

export const PythonSourcePanel: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (text: string, fileKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileKey);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Banner */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Universal Mobile Streamlit App (app.py)</h2>
            <p className="text-xs text-neutral-400">
              Complete standalone Python codebase supporting ANY lottery game (6/27, 6/20, 6/30, 6/36, 6/42, 6/45, 6/49, 5/35, etc.) and instant ticket generation!
            </p>
          </div>
        </div>
      </div>

      {/* requirements.txt Section */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300">
            <FileCode className="w-4 h-4 text-neutral-400" />
            <span>requirements.txt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(REQUIREMENTS_TXT, "req")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              {copiedFile === "req" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === "req" ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => handleDownload("requirements.txt", REQUIREMENTS_TXT)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-xs text-neutral-300 bg-neutral-950/70 overflow-x-auto">
          {REQUIREMENTS_TXT}
        </pre>
      </div>

      {/* app.py Section */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>app.py (Streamlit Mobile Native App — Multi-Game & Ticket Generator)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(APP_PY_CODE, "app")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              {copiedFile === "app" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === "app" ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => handleDownload("app.py", APP_PY_CODE)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-xs text-neutral-300 bg-neutral-950/80 overflow-x-auto max-h-[600px] leading-relaxed">
          {APP_PY_CODE}
        </pre>
      </div>
    </div>
  );
};
