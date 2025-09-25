"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Character } from "@/components/Types";

/* ===================== Sprite Animator (스프라이트 시트 재생기) ===================== */
/**
 * - sheetSrc: 스프라이트 시트 경로 (/public 기준)
 * - idleSrc : 평소(정지) 이미지 경로
 * - frameWidth/Height : 단일 프레임 크기(px)  ← 예: 240 x 240
 * - frameCount : 실제 재생 프레임 수        ← 예: 60 (12fps × 5s)
 * - columns : (선택) 가로 칸 수. 생략하면 자동 계산
 * - fps : 프레임 속도 (예: 12)
 * - startDelayMs : 최초 재생까지 대기 시간 (인스턴스마다 다르게 주어 오프셋 효과)
 * - intervalAfterMs : "재생이 끝난 뒤" 다음 재생까지 대기 시간 (요구사항: 10초)
 * - durationMs : (선택) 총 재생 시간. 생략 시 frameCount/fps로 계산
 * - containerHeightPx : 표시 영역 높이(px). 이미지가 잘리지 않게 넉넉히!
 */

function SpriteAnimator({
  sheetSrc,
  frameWidth,
  frameHeight,
  frameCount,
  columns,                  // 생략 시 자동 계산
  idleFrameIndex = 1,       // idle로 쓸 프레임 인덱스
  fps = 12,
  durationMs,               // 생략 시 frameCount/fps로 계산
  intervalAfterMs = 30000, // 재생 끝나고 다음 재생까지 대기
  startDelayMs = 0,         // 인스턴스별 시작 오프셋
  containerHeightPx = 320,  // 표시 영역 높이
  safePadPx = 6,            // 잘림 방지용 패딩
  className = "",

  scaleMultiplier = 1.3,    // 캐릭터 스케일 (1 = 100%)
  offsetYPx = 12,            // 캐릭터 세로 위치 보정(px, +이면 아래로)

  // 배경 이미지 옵션
  bgSrc,                    // "/backgrounds/room.jpg" 같은 경로
  bgMode = "cover",         // "cover" | "contain"
  bgPosition = "center",    // "center" | "top" | "bottom" ... 또는 "50% 50%"
  bgOpacity = 1,            // 0~1 (배경 투명도)
  bgScale = 1,              // 배경 스케일 (1 = 100%)
}: {
  sheetSrc: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  columns?: number;
  idleFrameIndex?: number;
  fps?: number;
  durationMs?: number;
  intervalAfterMs?: number;
  startDelayMs?: number;
  containerHeightPx?: number;
  safePadPx?: number;
  className?: string;

  scaleMultiplier?: number;
  offsetYPx?: number;

  // 배경용
  bgSrc?: string;
  bgMode?: "cover" | "contain";
  bgPosition?: string;
  bgOpacity?: number;
  bgScale ?: number;  // 배경 스케일 

}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [sheetLoaded, setSheetLoaded] = useState(false);
  const [cols, setCols] = useState<number | null>(columns ?? null);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const timeoutRef = useRef<number | null>(null);

// 시트 로드 + 열/행 계산을 round로, rows/capacity 저장
const [rows, setRows] = useState<number | null>(null);

// 시트 로드 + 열 자동 계산
useEffect(() => {
  const img = new Image();
  img.onload = () => {
    setSheetLoaded(true);

    const autoCols = columns ?? Math.max(1, Math.round(img.naturalWidth / frameWidth));
    const autoRows = Math.max(1, Math.round(img.naturalHeight / frameHeight));

    setCols(autoCols);
    setRows(autoRows);

    const capacity = autoCols * autoRows;
    if (frameCount > capacity) {
      console.warn("[Sprite] frameCount > capacity", { frameCount, capacity, autoCols, autoRows });
    }
  };
  img.onerror = () => console.error("[Sprite] 시트 로드 실패:", sheetSrc);
  img.src = sheetSrc;
}, [sheetSrc, frameWidth, frameHeight, frameCount, columns]);

  

  // 컨테이너 → 스케일 계산(패딩 고려, 픽셀아트 스냅)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const availW = Math.max(0, width - safePadPx * 2);
      const availH = Math.max(0, height - safePadPx * 2);
      const sRaw = Math.min(availW / frameWidth, availH / frameHeight);
      // 0.05 단위로 반올림
      const snapped = Math.max(0.1, Math.round(sRaw * 20) / 20);
      setScale(snapped);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth, frameHeight, safePadPx]);

  const totalMs = useMemo(
    () => Math.round((durationMs ?? (frameCount / fps) * 1000)),
    [durationMs, frameCount, fps]
  );

  const canPlay = sheetLoaded && (cols ?? 0) > 0;

 // 겹침 없이: 재생(totalMs) → interval 대기 → 반복
  useEffect(() => {
    if (!canPlay) return;
    let canceled = false;

    const playOnce = () => {
      if (canceled) return;
      setIsPlaying(true);
      setFrame(0);
      const start = performance.now();

      const step = (t: number) => {
        if (canceled) return;
        const elapsed = t - start;

         // duration 기준으로 프레임을 균등 분배
        let f: number;
        if (durationMs !== undefined) {
          const ratio = Math.min(1, elapsed / totalMs);       // 0 → 1
          f = Math.min(frameCount - 1, Math.floor(ratio * frameCount));
        } else {
          f = Math.min(frameCount - 1, Math.floor((elapsed / 1000) * fps));
        }

        setFrame(f);

        if (elapsed < totalMs) {
          requestAnimationFrame(step);
        } else {
          setIsPlaying(false);
          // 다음 회차는 intervalAfterMs 후 시작
          timeoutRef.current = window.setTimeout(playOnce, intervalAfterMs);
        }
      };

      requestAnimationFrame(step);
    };

     timeoutRef.current = window.setTimeout(playOnce, startDelayMs);
    return () => {
      canceled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canPlay, frameCount, fps, totalMs, startDelayMs, intervalAfterMs]);

  // 표시 인덱스 안전하게 계산 (capacity, frameCount에 맞춰 클램프)
  const C = cols ?? 1;
  const R = rows ?? 1;
  const capacity = C * R;
  const lastPlayable = Math.min(frameCount - 1, capacity - 1);

  // 재생 중이면 frame, 아니면 idleFrameIndex (모두 안전 범위로)
  const activeIndexRaw = isPlaying ? frame : idleFrameIndex;
  const activeIndex = Math.min(Math.max(0, activeIndexRaw), lastPlayable);

  // 좌표
  const ax = activeIndex % C;
  const ay = Math.floor(activeIndex / C);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{
        height: containerHeightPx,
        overflow: "hidden",
        padding: safePadPx,         // 귀 잘림 방지 패딩
        boxSizing: "border-box",

        // 배경(카드 내부 전체 영역)
        ...(bgSrc
          ? {
              backgroundImage: `url(${bgSrc})`,
              backgroundSize: bgScale !== 1 ? `${bgScale * 100}% auto` : bgMode,
              backgroundPosition: bgPosition,
              backgroundRepeat: "no-repeat",
              // 배경 투명도 주고 싶으면 오버레이로 처리 (아래 ::after 방식 권장)
            }
          : {}),
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${scale * scaleMultiplier})`,
          transformOrigin: "bottom center",
          marginTop: offsetYPx,
          imageRendering: "pixelated" as any,
          willChange: "transform, background-position",
        }}
      >
        {/* 단일 레이어: idle/재생 모두 여기서 표시 */}
        {sheetLoaded && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              width: frameWidth,
              height: frameHeight,
              backgroundImage: `url(${sheetSrc})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: `-${ax * frameWidth}px -${ay * frameHeight}px`,
              backgroundSize: `${C * frameWidth}px ${R * frameHeight}px`,
              imageRendering: "pixelated",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
          />
        )}
      </div>
    </div>
  );
}
/* ==================================================================================== */

interface CharacterSectionProps {
  myNickname: string;                               // 상단 닉네임 표시용
  partnerNickname: string;                          // 상단 닉네임 표시용
  userNickname?: string;                            // 닉네임 연동

  myCharacter: Character | null;                    // 캐릭터 표시용
  partnerCharacter: Character | null;               // 캐릭터 표시용
  myEvents: { _id: string; title: string }[];       // 일정 표시용
  partnerEvents: { _id: string; title: string }[];  // 일정 표시용
}


/* 경험치 Bar */
function LineExpBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent ?? 0));
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative h-3 w-full rounded-full border-2 border-stone-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-stone-800"
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
}


export default function CharacterSection({
  myNickname,
  partnerNickname,
  userNickname,
  myCharacter,
  partnerCharacter,
  myEvents,
  partnerEvents,
}: CharacterSectionProps) {


  // ======================================================
  // 닉네임 연동
  const pickName = (...vals: Array<string | undefined | null>) => {
    for (const v of vals) {
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
    return "";
  };

  const displayMyNickname = pickName(
    myNickname,
    userNickname,
    "My Character"
  );
  const displayPartnerNickname = pickName(
    partnerNickname,
    "Partner"
  );
  // =================================================================

  /* 공통 카드 렌더 (세로 배치) */
  const renderCard = (
    char: Character | null,
    fallback: string,
    events: { _id: string; title: string }[],
    options?: {
      startDelayMs?: number;   // 카드별 시작 오프셋
      idleFrameIndex?: number; // idle로 쓸 프레임 지정(기본 0)
      title?: string;

      characterScale?: number;

      sheetSrc?: string;
      frameWidth?: number;
      frameHeight?: number;
      frameCount?: number;
      fps?: number;
      durationMs?: number;
      intervalAfterMs?: number;

      bgSrc?: string;
      bgMode?: "cover" | "contain";
      bgPosition?: string;
      bgOpacity?: number;
      bgScale?: number;
      
    }
  ) => {
    const titleToShow = pickName(options?.title, char?.name, fallback);
    const expPercent = Math.max(0, Math.min(100, Number(char?.exp ?? 0)));

    return (
      <div className="bg-[#f6fde7] rounded-xl shadow p-6 sm:p-8 flex flex-col items-center w-full">
        {/* 캐릭터 스프라이트 */}
        <SpriteAnimator
          sheetSrc={
            char?.evolutionStage && char?.avatar
              ? `/character/sprites/${char.evolutionStage}/${char.avatar}`
              : options?.sheetSrc ?? "/character/sprites/0/cat.png"
          }
          frameWidth={options?.frameWidth ?? 240}
          frameHeight={options?.frameHeight ?? 240}
          frameCount={options?.frameCount ?? 45}
          // columns 생략 → 자동 계산
          fps={options?.fps ?? 12}
          durationMs={options?.durationMs ?? 2000}        // 영상 2초 재생
          intervalAfterMs={options?.intervalAfterMs ?? 4000}  // 끝나고 4초 대기

          startDelayMs={options?.startDelayMs ?? 0}
          idleFrameIndex={options?.idleFrameIndex ?? 1}
          containerHeightPx={250}  // 표시 영역 조금 넉넉히
          safePadPx={6}
          scaleMultiplier={1.4}    // 캐릭터 스케일
          offsetYPx={30}           // 캐릭터 세로 위치 보정(px, +이면 아래로)

          // 배경
          bgSrc="/backgrounds/background.jpg"
          bgMode="cover"
          bgPosition="center"
          bgOpacity={1}

        />

        {/* 닉네임 */}
        <div className="text-center mt-3">
          <div className="text-2xl font-semibold tracking-wide">
            {titleToShow}
          </div>
        </div>

        {/* LV + 라인형 EXP Bar */}
        <div className="w-full mt-3 flex items-center gap-3">
          <span className="font-semibold whitespace-nowrap">LV.{char?.level ?? "-"}</span>
            <div className="relative h-3 flex-1">
              <LineExpBar percent={Number(char?.exp ?? 0)} />
            </div>
        </div>

        {/* Today’s Schedule */}
        <div className="mt-5 w-full">
          <div className="font-semibold mb-2">TODAY&apos;S SCHEDULE</div>
          {events.length ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {events.map((e) => (
                <li key={e._id}>{e.title}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-stone-500">No Events</div>
          )}
        </div>
      </div>
    );
  };

  return (
    // 세로 스택 + 카드 영역 확장 (좌우는 페이지 끝에 살짝 안 닿게)
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
      {/* 내 캐릭터: 즉시 시작 */}
      {renderCard(myCharacter, "My Character", myEvents, {
        title: displayMyNickname, 

        startDelayMs: 0,
        idleFrameIndex: 1, // 필요하면 다른 프레임으로 교체 가능

        frameWidth: 240,
        frameHeight: 240,
        frameCount: 30,
        fps: 12,
        durationMs: 5000,
        intervalAfterMs: 2000,
        
        characterScale: 1.5,
        bgScale: 0.5,
      })}

      {/* 파트너 캐릭터: 5초 뒤 시작 */}
      {renderCard(partnerCharacter, "Partner", partnerEvents, {
        title: displayPartnerNickname,

        startDelayMs: 5000,
        idleFrameIndex: 1,
        
        frameWidth: 240,
        frameHeight: 240,
        frameCount: 45,
        fps: 12,
        durationMs: 5000,
        intervalAfterMs: 2000,

        characterScale: 1.5,
        bgScale: 0.5,
      })}
    </div>
  );
}