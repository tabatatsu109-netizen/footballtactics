import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DATA STRUCTURES
// ============================================================

/**
 * 選手の初期配置定義
 * x: 0-100 (left=GK側, right=相手ゴール側)
 * y: 0-100 (top=左サイド, bottom=右サイド)
 * ピッチは縦長表示: x=奥行き(0=自陣ゴール, 100=相手ゴール), y=横幅
 */

const FORMATIONS = {
  "4-3-3": {
    label: "4-3-3",
    players: [
      { id: "gk", role: "GK", x: 8, y: 50 },
      { id: "lb", role: "LB", x: 22, y: 18 },
      { id: "cb1", role: "CB", x: 22, y: 35 },
      { id: "cb2", role: "CB", x: 22, y: 65 },
      { id: "rb", role: "RB", x: 22, y: 82 },
      { id: "cm1", role: "CM", x: 40, y: 30 },
      { id: "cm2", role: "DM", x: 35, y: 50 },
      { id: "cm3", role: "CM", x: 40, y: 70 },
      { id: "lw", role: "LW", x: 58, y: 15 },
      { id: "st", role: "ST", x: 62, y: 50 },
      { id: "rw", role: "RW", x: 58, y: 85 },
    ],
  },
};

const OPPONENT_FORMATIONS = {
  "4-4-2": {
    label: "4-4-2",
    players: [
      { id: "ogk", role: "GK", x: 92, y: 50 },
      { id: "olb", role: "LB", x: 78, y: 18 },
      { id: "ocb1", role: "CB", x: 78, y: 35 },
      { id: "ocb2", role: "CB", x: 78, y: 65 },
      { id: "orb", role: "RB", x: 78, y: 82 },
      { id: "olm", role: "LM", x: 62, y: 18 },
      { id: "ocm1", role: "CM", x: 62, y: 35 },
      { id: "ocm2", role: "CM", x: 62, y: 65 },
      { id: "orm", role: "RM", x: 62, y: 82 },
      { id: "ost1", role: "ST", x: 50, y: 35 },
      { id: "ost2", role: "ST", x: 50, y: 65 },
    ],
  },
};

// ============================================================
// BUILDUP PATTERNS LIBRARY
// ============================================================

const BUILDUP_PATTERNS = {
  "4-3-3_vs_4-4-2_2toppress": {
    title: "アンカー落ちによる3バック化",
    description:
      "相手2トップのプレスに対し、DMがCBラインに落ちて数的優位を作る",
    reference: "バルセロナ / マンCが多用するビルドアップの基本形",
    phases: [
      {
        id: 1,
        label: "Phase 1",
        title: "初期配置",
        description: "4-3-3の基本ポジション。GKがボール保持。",
        ballPosition: { x: 8, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 22, y: 18 },
          cb1: { x: 22, y: 35 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 30 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 78, y: 18 },
          ocb1: { x: 78, y: 35 },
          ocb2: { x: 78, y: 65 },
          orb: { x: 78, y: 82 },
          olm: { x: 62, y: 18 },
          ocm1: { x: 62, y: 35 },
          ocm2: { x: 62, y: 65 },
          orm: { x: 62, y: 82 },
          ost1: { x: 50, y: 35 },
          ost2: { x: 50, y: 65 },
        },
        arrows: [],
        highlight: [],
      },
      {
        id: 2,
        label: "Phase 2",
        title: "プレス発生",
        description:
          "相手2トップがCBへプレス。GKへのバックパスでリセットを狙う。",
        ballPosition: { x: 22, y: 35 },
        playerPositions: {
          gk: { x: 12, y: 50 },
          lb: { x: 22, y: 18 },
          cb1: { x: 22, y: 35 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 30 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 58, y: 18 },
          ocm1: { x: 58, y: 35 },
          ocm2: { x: 58, y: 65 },
          orm: { x: 58, y: 82 },
          ost1: { x: 34, y: 35 },
          ost2: { x: 34, y: 65 },
        },
        arrows: [
          { from: { x: 34, y: 35 }, to: { x: 26, y: 37 }, type: "press", label: "プレス" },
          { from: { x: 34, y: 65 }, to: { x: 26, y: 63 }, type: "press", label: "プレス" },
        ],
        highlight: ["ost1", "ost2", "cb1", "cb2"],
      },
      {
        id: 3,
        label: "Phase 3",
        title: "解決策: DMが落ちて3バック化",
        description:
          "DM(cm2)がCBラインに落ちて3バックを形成。数的優位(3vs2)を作る。SBが高い位置へ。",
        ballPosition: { x: 12, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 32, y: 12 },
          cb1: { x: 22, y: 33 },
          cb2: { x: 22, y: 67 },
          rb: { x: 32, y: 88 },
          cm1: { x: 42, y: 30 },
          cm2: { x: 20, y: 50 },
          cm3: { x: 42, y: 70 },
          lw: { x: 60, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 60, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 58, y: 18 },
          ocm1: { x: 58, y: 35 },
          ocm2: { x: 58, y: 65 },
          orm: { x: 58, y: 82 },
          ost1: { x: 34, y: 35 },
          ost2: { x: 34, y: 65 },
        },
        arrows: [
          { from: { x: 35, y: 50 }, to: { x: 20, y: 50 }, type: "move", label: "落ちる" },
          { from: { x: 22, y: 18 }, to: { x: 32, y: 12 }, type: "move", label: "高い位置へ" },
          { from: { x: 22, y: 82 }, to: { x: 32, y: 88 }, type: "move", label: "高い位置へ" },
        ],
        highlight: ["cm2", "lb", "rb"],
      },
      {
        id: 4,
        label: "Phase 4",
        title: "前進成功",
        description:
          "3バックで数的優位。フリーになったSBや中盤経由でラインを越える。",
        ballPosition: { x: 42, y: 30 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 42, y: 10 },
          cb1: { x: 28, y: 33 },
          cb2: { x: 28, y: 67 },
          rb: { x: 42, y: 90 },
          cm1: { x: 50, y: 28 },
          cm2: { x: 26, y: 50 },
          cm3: { x: 50, y: 72 },
          lw: { x: 65, y: 12 },
          st: { x: 68, y: 50 },
          rw: { x: 65, y: 88 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 62, y: 18 },
          ocm1: { x: 62, y: 35 },
          ocm2: { x: 62, y: 65 },
          orm: { x: 62, y: 82 },
          ost1: { x: 40, y: 35 },
          ost2: { x: 40, y: 65 },
        },
        arrows: [
          { from: { x: 8, y: 50 }, to: { x: 26, y: 50 }, type: "pass", label: "パス" },
          { from: { x: 26, y: 50 }, to: { x: 42, y: 30 }, type: "pass", label: "パス" },
        ],
        highlight: ["cm2", "cm1", "lb"],
      },
    ],
  },
  "4-3-3_vs_4-4-2_anchorkill": {
    title: "GK活用でアンカー消しを回避",
    description:
      "相手MFがアンカーを消すシャドーポジション時、GKが積極的に関与してサイドへ展開",
    reference: "ブライトン / 川崎の可変システム",
    phases: [
      {
        id: 1,
        label: "Phase 1",
        title: "初期配置",
        description: "GKがボール保持。アンカーが消されている。",
        ballPosition: { x: 8, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 22, y: 18 },
          cb1: { x: 22, y: 35 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 30 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 78, y: 18 },
          ocb1: { x: 78, y: 35 },
          ocb2: { x: 78, y: 65 },
          orb: { x: 78, y: 82 },
          olm: { x: 62, y: 18 },
          ocm1: { x: 55, y: 42 },
          ocm2: { x: 62, y: 65 },
          orm: { x: 62, y: 82 },
          ost1: { x: 30, y: 35 },
          ost2: { x: 30, y: 65 },
        },
        arrows: [],
        highlight: ["cm2", "ocm1"],
      },
      {
        id: 2,
        label: "Phase 2",
        title: "アンカー消しの確認",
        description: "相手MF(ocm1)がアンカー(cm2)へのパスコースを遮断している。",
        ballPosition: { x: 8, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 22, y: 18 },
          cb1: { x: 22, y: 35 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 30 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 58, y: 18 },
          ocm1: { x: 52, y: 44 },
          ocm2: { x: 58, y: 65 },
          orm: { x: 58, y: 82 },
          ost1: { x: 30, y: 35 },
          ost2: { x: 30, y: 65 },
        },
        arrows: [
          { from: { x: 8, y: 50 }, to: { x: 35, y: 50 }, type: "blocked", label: "遮断！" },
        ],
        highlight: ["ocm1", "cm2"],
      },
      {
        id: 3,
        label: "Phase 3",
        title: "GKがSBへ展開",
        description:
          "GKがプレスを引き寄せ、空いたSBへ直接配球。LBが前向きでボールを受ける。",
        ballPosition: { x: 22, y: 18 },
        playerPositions: {
          gk: { x: 14, y: 50 },
          lb: { x: 28, y: 15 },
          cb1: { x: 22, y: 38 },
          cb2: { x: 22, y: 62 },
          rb: { x: 28, y: 82 },
          cm1: { x: 40, y: 28 },
          cm2: { x: 38, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 60, y: 12 },
          st: { x: 60, y: 50 },
          rw: { x: 60, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 58, y: 18 },
          ocm1: { x: 48, y: 44 },
          ocm2: { x: 58, y: 65 },
          orm: { x: 58, y: 82 },
          ost1: { x: 30, y: 35 },
          ost2: { x: 30, y: 65 },
        },
        arrows: [
          { from: { x: 14, y: 50 }, to: { x: 28, y: 15 }, type: "pass", label: "GKから配球" },
        ],
        highlight: ["gk", "lb"],
      },
      {
        id: 4,
        label: "Phase 4",
        title: "サイドから前進",
        description:
          "LBが前向きで持ち上がり、LWとのコンビで中盤ラインを突破。前進成功。",
        ballPosition: { x: 55, y: 20 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 44, y: 15 },
          cb1: { x: 28, y: 38 },
          cb2: { x: 28, y: 62 },
          rb: { x: 38, y: 82 },
          cm1: { x: 52, y: 30 },
          cm2: { x: 46, y: 50 },
          cm3: { x: 52, y: 70 },
          lw: { x: 65, y: 10 },
          st: { x: 68, y: 50 },
          rw: { x: 65, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 72, y: 18 },
          ocb1: { x: 72, y: 35 },
          ocb2: { x: 72, y: 65 },
          orb: { x: 72, y: 82 },
          olm: { x: 62, y: 20 },
          ocm1: { x: 58, y: 42 },
          ocm2: { x: 62, y: 65 },
          orm: { x: 62, y: 82 },
          ost1: { x: 44, y: 35 },
          ost2: { x: 44, y: 65 },
        },
        arrows: [
          { from: { x: 28, y: 15 }, to: { x: 44, y: 15 }, type: "dribble", label: "持ち上がり" },
          { from: { x: 44, y: 15 }, to: { x: 55, y: 20 }, type: "pass", label: "パス" },
        ],
        highlight: ["lb", "lw"],
      },
    ],
  },
  "4-3-3_vs_4-4-2_mannmark": {
    title: "マンツーマンプレスを動きで崩す",
    description:
      "相手がマンツーマンで守る場合、選手の交換(ローテーション)で数的同数を突破",
    reference: "アーセナルのビルドアップパターン",
    phases: [
      {
        id: 1,
        label: "Phase 1",
        title: "マンツーマン確認",
        description: "相手全員が対面選手をマーク。どこへパスしても相手がついてくる。",
        ballPosition: { x: 8, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 22, y: 18 },
          cb1: { x: 22, y: 35 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 30 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 15 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 60, y: 12 },
          ocb1: { x: 28, y: 35 },
          ocb2: { x: 28, y: 65 },
          orb: { x: 60, y: 88 },
          olm: { x: 44, y: 28 },
          ocm1: { x: 38, y: 48 },
          ocm2: { x: 44, y: 72 },
          orm: { x: 44, y: 50 },
          ost1: { x: 28, y: 20 },
          ost2: { x: 28, y: 80 },
        },
        arrows: [],
        highlight: ["ocb1", "ocb2", "ost1", "ost2"],
      },
      {
        id: 2,
        label: "Phase 2",
        title: "偽SBの動き",
        description:
          "LBが内に絞りDMのポジションへ。相手LBが引っ張られスペースが生まれる。",
        ballPosition: { x: 8, y: 50 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 30, y: 38 },
          cb1: { x: 22, y: 33 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 40, y: 25 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 58, y: 12 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 35, y: 38 },
          ocb1: { x: 28, y: 33 },
          ocb2: { x: 28, y: 65 },
          orb: { x: 55, y: 85 },
          olm: { x: 44, y: 25 },
          ocm1: { x: 38, y: 48 },
          ocm2: { x: 44, y: 72 },
          orm: { x: 44, y: 50 },
          ost1: { x: 28, y: 20 },
          ost2: { x: 28, y: 80 },
        },
        arrows: [
          { from: { x: 22, y: 18 }, to: { x: 30, y: 38 }, type: "move", label: "偽SB" },
        ],
        highlight: ["lb", "olb"],
      },
      {
        id: 3,
        label: "Phase 3",
        title: "空きスペースへLWが降りる",
        description:
          "LWが外のスペースに降りてボールを受ける。相手OLBが引っ張られCBラインにギャップ。",
        ballPosition: { x: 38, y: 15 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 30, y: 38 },
          cb1: { x: 22, y: 33 },
          cb2: { x: 22, y: 65 },
          rb: { x: 22, y: 82 },
          cm1: { x: 42, y: 25 },
          cm2: { x: 35, y: 50 },
          cm3: { x: 40, y: 70 },
          lw: { x: 38, y: 12 },
          st: { x: 62, y: 50 },
          rw: { x: 58, y: 85 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 40, y: 14 },
          ocb1: { x: 32, y: 33 },
          ocb2: { x: 32, y: 65 },
          orb: { x: 55, y: 85 },
          olm: { x: 44, y: 25 },
          ocm1: { x: 38, y: 48 },
          ocm2: { x: 44, y: 72 },
          orm: { x: 44, y: 50 },
          ost1: { x: 32, y: 20 },
          ost2: { x: 32, y: 80 },
        },
        arrows: [
          { from: { x: 8, y: 50 }, to: { x: 22, y: 33 }, type: "pass", label: "パス" },
          { from: { x: 22, y: 33 }, to: { x: 38, y: 12 }, type: "pass", label: "LWへ" },
          { from: { x: 58, y: 12 }, to: { x: 38, y: 12 }, type: "move", label: "降りる" },
        ],
        highlight: ["lw", "olb"],
      },
      {
        id: 4,
        label: "Phase 4",
        title: "CB間を突破",
        description:
          "STが相手CB間に走り込み、LWから裏パス。マンツーマンのズレを突いて前進。",
        ballPosition: { x: 62, y: 48 },
        playerPositions: {
          gk: { x: 8, y: 50 },
          lb: { x: 44, y: 35 },
          cb1: { x: 30, y: 35 },
          cb2: { x: 30, y: 65 },
          rb: { x: 38, y: 82 },
          cm1: { x: 52, y: 25 },
          cm2: { x: 45, y: 50 },
          cm3: { x: 50, y: 70 },
          lw: { x: 48, y: 12 },
          st: { x: 62, y: 48 },
          rw: { x: 62, y: 82 },
        },
        opponentPositions: {
          ogk: { x: 92, y: 50 },
          olb: { x: 60, y: 15 },
          ocb1: { x: 68, y: 35 },
          ocb2: { x: 68, y: 65 },
          orb: { x: 65, y: 82 },
          olm: { x: 55, y: 25 },
          ocm1: { x: 50, y: 48 },
          ocm2: { x: 55, y: 72 },
          orm: { x: 55, y: 50 },
          ost1: { x: 42, y: 22 },
          ost2: { x: 42, y: 78 },
        },
        arrows: [
          { from: { x: 38, y: 12 }, to: { x: 62, y: 48 }, type: "pass", label: "裏パス！" },
        ],
        highlight: ["st", "lw"],
      },
    ],
  },
};

// ============================================================
// ARROW COMPONENT
// ============================================================

function Arrow({ from, to, type, label, pitchWidth, pitchHeight }) {
  const x1 = (from.x / 100) * pitchWidth;
  const y1 = (from.y / 100) * pitchHeight;
  const x2 = (to.x / 100) * pitchWidth;
  const y2 = (to.y / 100) * pitchHeight;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;

  const arrowLen = 8;
  const ax = x2 - ux * arrowLen;
  const ay = y2 - uy * arrowLen;
  const perpX = -uy * 4;
  const perpY = ux * 4;

  const colors = {
    pass: "#FFD700",
    move: "#00E5FF",
    press: "#FF4444",
    blocked: "#FF4444",
    dribble: "#00FF88",
  };
  const color = colors[type] || "#FFD700";
  const isDashed = type === "blocked";

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <g opacity="0.9">
      <line
        x1={x1} y1={y1} x2={ax} y2={ay}
        stroke={color} strokeWidth="2"
        strokeDasharray={isDashed ? "6,4" : undefined}
        strokeLinecap="round"
      />
      {!isDashed && (
        <polygon
          points={`${x2},${y2} ${ax + perpX},${ay + perpY} ${ax - perpX},${ay - perpY}`}
          fill={color}
        />
      )}
      {isDashed && (
        <text x={mx} y={my - 6} fill={color} fontSize="10" textAnchor="middle" fontWeight="bold">
          {label}
        </text>
      )}
    </g>
  );
}

// ============================================================
// PITCH COMPONENT
// ============================================================

function Pitch({ phase, myFormation, oppFormation, animated }) {
  const svgRef = useRef(null);
  const [displayPositions, setDisplayPositions] = useState({
    players: {},
    opponents: {},
    ball: { x: 8, y: 50 },
  });
  const animRef = useRef(null);

  const W = 340;
  const H = 520;

  const toSVG = (pos) => ({
    svgX: (pos.x / 100) * W,
    svgY: (pos.y / 100) * H,
  });

  useEffect(() => {
    if (!animated) {
      setDisplayPositions({
        players: phase.playerPositions,
        opponents: phase.opponentPositions,
        ball: phase.ballPosition,
      });
      return;
    }

    const start = performance.now();
    const duration = 900;
    const prev = displayPositions;

    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = ease(t);

      const interPlayers = {};
      for (const id in phase.playerPositions) {
        const target = phase.playerPositions[id];
        const from = prev.players[id] || target;
        interPlayers[id] = {
          x: lerp(from.x, target.x, e),
          y: lerp(from.y, target.y, e),
        };
      }

      const interOpp = {};
      for (const id in phase.opponentPositions) {
        const target = phase.opponentPositions[id];
        const from = prev.opponents[id] || target;
        interOpp[id] = {
          x: lerp(from.x, target.x, e),
          y: lerp(from.y, target.y, e),
        };
      }

      const ballFrom = prev.ball;
      const ballTarget = phase.ballPosition;
      const interBall = {
        x: lerp(ballFrom.x, ballTarget.x, e),
        y: lerp(ballFrom.y, ballTarget.y, e),
      };

      setDisplayPositions({ players: interPlayers, opponents: interOpp, ball: interBall });

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const myPlayers = FORMATIONS[myFormation]?.players || [];
  const oppPlayers = OPPONENT_FORMATIONS[oppFormation]?.players || [];

  const ballSVG = toSVG(displayPositions.ball);

  return (
    <svg
      ref={svgRef}
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", margin: "0 auto" }}
    >
      {/* Pitch background */}
      <defs>
        <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a6b2e" />
          <stop offset="50%" stopColor="#1d7a34" />
          <stop offset="100%" stopColor="#1a6b2e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>

      {/* Stripe pattern */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={0} y={i * (H / 7)} width={W} height={H / 7}
          fill={i % 2 === 0 ? "rgba(0,0,0,0.06)" : "transparent"}
        />
      ))}
      <rect x={0} y={0} width={W} height={H} fill="url(#pitchGrad)" opacity="0.7" />

      {/* Pitch lines */}
      <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none">
        {/* Boundary */}
        <rect x={8} y={8} width={W - 16} height={H - 16} />
        {/* Center line */}
        <line x1={8} y1={H / 2} x2={W - 8} y2={H / 2} />
        {/* Center circle */}
        <circle cx={W / 2} cy={H / 2} r={40} />
        <circle cx={W / 2} cy={H / 2} r={2} fill="rgba(255,255,255,0.6)" />
        {/* Penalty areas */}
        <rect x={(W - 140) / 2} y={8} width={140} height={72} />
        <rect x={(W - 80) / 2} y={8} width={80} height={36} />
        {/* Goal top */}
        <rect x={(W - 52) / 2} y={4} width={52} height={8} />
        {/* Penalty areas bottom */}
        <rect x={(W - 140) / 2} y={H - 80} width={140} height={72} />
        <rect x={(W - 80) / 2} y={H - 44} width={80} height={36} />
        {/* Goal bottom */}
        <rect x={(W - 52) / 2} y={H - 12} width={52} height={8} />
        {/* Penalty spots */}
        <circle cx={W / 2} cy={40} r={2} fill="rgba(255,255,255,0.6)" />
        <circle cx={W / 2} cy={H - 40} r={2} fill="rgba(255,255,255,0.6)" />
      </g>

      {/* Goal labels */}
      <text x={W / 2} y={22} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
        相手ゴール
      </text>
      <text x={W / 2} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">
        自陣ゴール
      </text>

      {/* Arrows */}
      {phase.arrows.map((arrow, i) => (
        <Arrow
          key={i}
          from={arrow.from} to={arrow.to}
          type={arrow.type} label={arrow.label}
          pitchWidth={W} pitchHeight={H}
        />
      ))}

      {/* Opponent players */}
      {oppPlayers.map((player) => {
        const pos = displayPositions.opponents[player.id] || player;
        const { svgX, svgY } = toSVG(pos);
        const isHighlighted = phase.highlight.includes(player.id);
        return (
          <g key={player.id} filter={isHighlighted ? "url(#glow)" : undefined}>
            <circle cx={svgX} cy={svgY} r={isHighlighted ? 13 : 11}
              fill={isHighlighted ? "#FF6B35" : "#E53935"}
              stroke={isHighlighted ? "#FFD700" : "rgba(255,255,255,0.7)"}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
            />
            <text x={svgX} y={svgY + 1} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
              {player.role}
            </text>
          </g>
        );
      })}

      {/* My players */}
      {myPlayers.map((player) => {
        const pos = displayPositions.players[player.id] || player;
        const { svgX, svgY } = toSVG(pos);
        const isHighlighted = phase.highlight.includes(player.id);
        return (
          <g key={player.id} filter={isHighlighted ? "url(#glow)" : undefined}>
            <circle cx={svgX} cy={svgY} r={isHighlighted ? 14 : 12}
              fill={isHighlighted ? "#1565C0" : "#1976D2"}
              stroke={isHighlighted ? "#FFD700" : "rgba(255,255,255,0.8)"}
              strokeWidth={isHighlighted ? 3 : 1.5}
            />
            <text x={svgX} y={svgY + 1} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
              {player.role}
            </text>
          </g>
        );
      })}

      {/* Ball */}
      <g filter="url(#shadow)">
        <circle cx={ballSVG.svgX} cy={ballSVG.svgY} r={7}
          fill="white" stroke="#333" strokeWidth="1.5" />
        {/* Ball pattern lines */}
        <line x1={ballSVG.svgX - 3} y1={ballSVG.svgY - 3}
          x2={ballSVG.svgX + 3} y2={ballSVG.svgY + 3}
          stroke="#555" strokeWidth="0.8" />
        <line x1={ballSVG.svgX + 3} y1={ballSVG.svgY - 3}
          x2={ballSVG.svgX - 3} y2={ballSVG.svgY + 3}
          stroke="#555" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function BuildupTrainer() {
  const [step, setStep] = useState(1);
  const [myFormation, setMyFormation] = useState(null);
  const [oppFormation, setOppFormation] = useState(null);
  const [pressType, setPressType] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animated, setAnimated] = useState(false);
  const playTimerRef = useRef(null);

  const patternKey = myFormation && oppFormation && pressType
    ? `${myFormation}_vs_${oppFormation}_${pressType}`
    : null;

  const pattern = patternKey ? BUILDUP_PATTERNS[patternKey] : null;
  const phases = pattern?.phases || [];
  const phase = phases[currentPhase];

  const myFormations = ["4-3-3"];
  const oppFormations = ["4-4-2"];
  const pressTypes = [
    { id: "2toppress", label: "2トッププレス", desc: "2FWがCBへプレス" },
    { id: "anchorkill", label: "アンカー消し", desc: "MFがDMのパスコースを遮断" },
    { id: "mannmark", label: "マンツーマン", desc: "各選手に対人マーク" },
  ];

  const goToPhase = (idx) => {
    setAnimated(true);
    setCurrentPhase(idx);
  };

  const handlePlay = () => {
    if (isPlaying) {
      clearInterval(playTimerRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let idx = currentPhase;
    const next = () => {
      idx = idx + 1;
      if (idx >= phases.length) {
        setIsPlaying(false);
        return;
      }
      setAnimated(true);
      setCurrentPhase(idx);
    };
    playTimerRef.current = setInterval(next, 2000);
  };

  useEffect(() => {
    return () => clearInterval(playTimerRef.current);
  }, []);

  useEffect(() => {
    if (!isPlaying) clearInterval(playTimerRef.current);
  }, [isPlaying]);

  const reset = () => {
    setStep(1);
    setMyFormation(null);
    setOppFormation(null);
    setPressType(null);
    setCurrentPhase(0);
    setIsPlaying(false);
    setAnimated(false);
  };

  // ── STYLES ──
  const styles = {
    app: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a0e1a 0%, #0d1b2a 50%, #0a1628 100%)",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      color: "#e8eaf6",
      padding: "0 0 40px",
    },
    header: {
      background: "rgba(255,255,255,0.03)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#4FC3F7",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
    },
    badge: {
      background: "rgba(79,195,247,0.15)",
      border: "1px solid rgba(79,195,247,0.3)",
      borderRadius: "4px",
      padding: "3px 8px",
      fontSize: "10px",
      color: "#4FC3F7",
      letterSpacing: "0.1em",
    },
    section: {
      padding: "20px 16px",
    },
    stepLabel: {
      fontSize: "10px",
      color: "#78909C",
      letterSpacing: "0.2em",
      marginBottom: "8px",
      textTransform: "uppercase",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#E3F2FD",
      marginBottom: "16px",
      letterSpacing: "0.05em",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "20px",
    },
    optionBtn: (active) => ({
      background: active
        ? "linear-gradient(135deg, #1565C0, #0D47A1)"
        : "rgba(255,255,255,0.04)",
      border: active ? "2px solid #4FC3F7" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "14px 12px",
      cursor: "pointer",
      color: active ? "#E3F2FD" : "#90A4AE",
      fontFamily: "inherit",
      fontSize: "14px",
      fontWeight: "700",
      letterSpacing: "0.08em",
      transition: "all 0.2s",
      textAlign: "center",
    }),
    pressBtn: (active) => ({
      background: active
        ? "linear-gradient(135deg, #1B5E20, #2E7D32)"
        : "rgba(255,255,255,0.04)",
      border: active ? "2px solid #66BB6A" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "12px 14px",
      cursor: "pointer",
      color: active ? "#E8F5E9" : "#90A4AE",
      fontFamily: "inherit",
      transition: "all 0.2s",
      textAlign: "left",
    }),
    primaryBtn: {
      background: "linear-gradient(135deg, #1565C0, #0D47A1)",
      border: "1px solid rgba(79,195,247,0.4)",
      borderRadius: "8px",
      padding: "14px 24px",
      cursor: "pointer",
      color: "#E3F2FD",
      fontFamily: "inherit",
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "0.1em",
      width: "100%",
      textTransform: "uppercase",
    },
    divider: {
      height: "1px",
      background: "rgba(255,255,255,0.06)",
      margin: "0 16px",
    },
    // Viewer styles
    patternHeader: {
      padding: "16px",
      background: "rgba(255,255,255,0.03)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    patternTitle: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#FFD700",
      marginBottom: "4px",
    },
    patternDesc: {
      fontSize: "11px",
      color: "#78909C",
      lineHeight: "1.6",
    },
    refBadge: {
      display: "inline-block",
      marginTop: "6px",
      background: "rgba(255,215,0,0.1)",
      border: "1px solid rgba(255,215,0,0.25)",
      borderRadius: "4px",
      padding: "2px 8px",
      fontSize: "10px",
      color: "#FFD700",
    },
    phaseNav: {
      display: "flex",
      gap: "8px",
      padding: "12px 16px",
      overflowX: "auto",
    },
    phaseBtn: (active) => ({
      flexShrink: 0,
      background: active ? "#1976D2" : "rgba(255,255,255,0.06)",
      border: active ? "1px solid #4FC3F7" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "20px",
      padding: "6px 14px",
      cursor: "pointer",
      color: active ? "#E3F2FD" : "#78909C",
      fontFamily: "inherit",
      fontSize: "11px",
      fontWeight: active ? "700" : "400",
      letterSpacing: "0.06em",
      transition: "all 0.2s",
    }),
    phaseInfo: {
      padding: "12px 16px",
      background: "rgba(255,255,255,0.02)",
      margin: "0 16px",
      borderRadius: "8px",
      marginBottom: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    phaseTitle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#4FC3F7",
      marginBottom: "4px",
    },
    phaseDesc: {
      fontSize: "11px",
      color: "#90A4AE",
      lineHeight: "1.6",
    },
    controls: {
      display: "flex",
      gap: "10px",
      padding: "12px 16px",
    },
    controlBtn: (variant) => ({
      flex: 1,
      padding: "12px",
      background: variant === "play"
        ? (isPlaying ? "rgba(255,82,82,0.2)" : "rgba(76,175,80,0.2)")
        : "rgba(255,255,255,0.05)",
      border: variant === "play"
        ? (isPlaying ? "1px solid rgba(255,82,82,0.4)" : "1px solid rgba(76,175,80,0.4)")
        : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      cursor: "pointer",
      color: variant === "play"
        ? (isPlaying ? "#FF5252" : "#81C784")
        : "#90A4AE",
      fontFamily: "inherit",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.08em",
    }),
    legend: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      padding: "10px 16px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "10px",
      color: "#78909C",
    },
    resetBtn: {
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "6px",
      padding: "6px 12px",
      cursor: "pointer",
      color: "#78909C",
      fontFamily: "inherit",
      fontSize: "10px",
      letterSpacing: "0.1em",
    },
  };

  // ── STEP 1: MY FORMATION ──
  if (step === 1) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.title}>⚽ BUILDUP TRAINER</div>
          <div style={styles.badge}>MVP v1.0</div>
        </div>
        <div style={styles.section}>
          <div style={styles.stepLabel}>STEP 1 / 3</div>
          <div style={styles.sectionTitle}>自チームのシステムを選択</div>
          <div style={styles.grid}>
            {myFormations.map((f) => (
              <button
                key={f}
                style={styles.optionBtn(myFormation === f)}
                onClick={() => setMyFormation(f)}
              >
                {f}
              </button>
            ))}
            {["4-2-3-1", "4-4-2", "3-4-3", "3-5-2"].map((f) => (
              <button
                key={f}
                style={{
                  ...styles.optionBtn(false),
                  opacity: 0.35,
                  cursor: "not-allowed",
                }}
                disabled
              >
                {f}
                <div style={{ fontSize: "9px", color: "#546E7A", marginTop: "2px" }}>coming soon</div>
              </button>
            ))}
          </div>
          <button
            style={{
              ...styles.primaryBtn,
              opacity: myFormation ? 1 : 0.4,
              cursor: myFormation ? "pointer" : "not-allowed",
            }}
            disabled={!myFormation}
            onClick={() => setStep(2)}
          >
            次へ →
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 2: OPPONENT FORMATION ──
  if (step === 2) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.title}>⚽ BUILDUP TRAINER</div>
          <button style={styles.resetBtn} onClick={() => setStep(1)}>← 戻る</button>
        </div>
        <div style={styles.section}>
          <div style={styles.stepLabel}>STEP 2 / 3</div>
          <div style={styles.sectionTitle}>相手のシステムを選択</div>
          <div style={{ marginBottom: "12px", fontSize: "11px", color: "#546E7A" }}>
            自チーム: <span style={{ color: "#4FC3F7" }}>{myFormation}</span>
          </div>
          <div style={styles.grid}>
            {oppFormations.map((f) => (
              <button
                key={f}
                style={styles.optionBtn(oppFormation === f)}
                onClick={() => setOppFormation(f)}
              >
                {f}
              </button>
            ))}
            {["4-3-3", "4-2-3-1", "5-4-1", "3-5-2"].map((f) => (
              <button
                key={f}
                style={{ ...styles.optionBtn(false), opacity: 0.35, cursor: "not-allowed" }}
                disabled
              >
                {f}
                <div style={{ fontSize: "9px", color: "#546E7A", marginTop: "2px" }}>coming soon</div>
              </button>
            ))}
          </div>
          <button
            style={{
              ...styles.primaryBtn,
              opacity: oppFormation ? 1 : 0.4,
              cursor: oppFormation ? "pointer" : "not-allowed",
            }}
            disabled={!oppFormation}
            onClick={() => setStep(3)}
          >
            次へ →
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 3: PRESS TYPE ──
  if (step === 3) {
    return (
      <div style={styles.app}>
        <div style={styles.header}>
          <div style={styles.title}>⚽ BUILDUP TRAINER</div>
          <button style={styles.resetBtn} onClick={() => setStep(2)}>← 戻る</button>
        </div>
        <div style={styles.section}>
          <div style={styles.stepLabel}>STEP 3 / 3</div>
          <div style={styles.sectionTitle}>相手のプレス方法を選択</div>
          <div style={{ marginBottom: "16px", fontSize: "11px", color: "#546E7A" }}>
            <span style={{ color: "#4FC3F7" }}>{myFormation}</span>
            <span style={{ color: "#546E7A" }}> vs </span>
            <span style={{ color: "#EF9A9A" }}>{oppFormation}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {pressTypes.map((p) => (
              <button
                key={p.id}
                style={styles.pressBtn(pressType === p.id)}
                onClick={() => setPressType(p.id)}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>
                  {p.label}
                </div>
                <div style={{ fontSize: "10px", color: pressType === p.id ? "#A5D6A7" : "#546E7A" }}>
                  {p.desc}
                </div>
              </button>
            ))}
            {["ハイプレス", "ミドルプレス", "サイド誘導"].map((p) => (
              <button
                key={p}
                style={{ ...styles.pressBtn(false), opacity: 0.35, cursor: "not-allowed" }}
                disabled
              >
                <div style={{ fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>{p}</div>
                <div style={{ fontSize: "10px", color: "#37474F" }}>coming soon</div>
              </button>
            ))}
          </div>
          <button
            style={{
              ...styles.primaryBtn,
              opacity: pressType ? 1 : 0.4,
              cursor: pressType ? "pointer" : "not-allowed",
            }}
            disabled={!pressType}
            onClick={() => { setStep(4); setCurrentPhase(0); setAnimated(false); }}
          >
            ビルドアップを見る →
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 4: ANIMATION VIEWER ──
  if (!pattern || !phase) {
    return (
      <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#546E7A", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
          <div>パターンが見つかりません</div>
          <button style={{ ...styles.primaryBtn, marginTop: "20px", width: "auto" }} onClick={reset}>
            最初から
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>⚽ BUILDUP TRAINER</div>
          <div style={{ fontSize: "10px", color: "#546E7A", marginTop: "2px", letterSpacing: "0.08em" }}>
            <span style={{ color: "#4FC3F7" }}>{myFormation}</span>
            <span> vs </span>
            <span style={{ color: "#EF9A9A" }}>{oppFormation}</span>
          </div>
        </div>
        <button style={styles.resetBtn} onClick={reset}>リセット</button>
      </div>

      {/* Pattern info */}
      <div style={styles.patternHeader}>
        <div style={styles.patternTitle}>{pattern.title}</div>
        <div style={styles.patternDesc}>{pattern.description}</div>
        <div style={styles.refBadge}>📖 {pattern.reference}</div>
      </div>

      {/* Phase navigation */}
      <div style={styles.phaseNav}>
        {phases.map((p, i) => (
          <button
            key={p.id}
            style={styles.phaseBtn(i === currentPhase)}
            onClick={() => goToPhase(i)}
          >
            {p.label}: {p.title}
          </button>
        ))}
      </div>

      {/* Phase description */}
      <div style={styles.phaseInfo}>
        <div style={styles.phaseTitle}>{phase.label}: {phase.title}</div>
        <div style={styles.phaseDesc}>{phase.description}</div>
      </div>

      {/* Pitch */}
      <div style={{ padding: "0 16px 8px" }}>
        <Pitch
          phase={phase}
          myFormation={myFormation}
          oppFormation={oppFormation}
          animated={animated}
        />
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button
          style={styles.controlBtn("prev")}
          onClick={() => { if (currentPhase > 0) goToPhase(currentPhase - 1); }}
          disabled={currentPhase === 0}
        >
          ◀ 前へ
        </button>
        <button
          style={styles.controlBtn("play")}
          onClick={handlePlay}
        >
          {isPlaying ? "⏸ 停止" : "▶ AUTO"}
        </button>
        <button
          style={styles.controlBtn("next")}
          onClick={() => { if (currentPhase < phases.length - 1) goToPhase(currentPhase + 1); }}
          disabled={currentPhase === phases.length - 1}
        >
          次へ ▶
        </button>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1976D2", border: "1px solid #4FC3F7" }} />
          <span>自チーム</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#E53935" }} />
          <span>相手チーム</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", border: "1px solid #333" }} />
          <span>ボール</span>
        </div>
        <div style={styles.legendItem}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#FFD700" strokeWidth="2"/><polygon points="22,5 16,2 16,8" fill="#FFD700"/></svg>
          <span>パス</span>
        </div>
        <div style={styles.legendItem}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#00E5FF" strokeWidth="2"/><polygon points="22,5 16,2 16,8" fill="#00E5FF"/></svg>
          <span>移動</span>
        </div>
        <div style={styles.legendItem}>
          <svg width="28" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#FF4444" strokeWidth="2" strokeDasharray="4,3"/></svg>
          <span>プレス</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#1565C0", border: "2px solid #FFD700" }} />
          <span>注目選手</span>
        </div>
      </div>
    </div>
  );
}
