"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Character } from "@/components/Types";

/* ===================== Sprite Animator (스프라이트 시트 재생기) ===================== */
/** 
 * - sheetSrc: 스프라이트 시트 경로 (/public/... 경로)
 * - idleSrc : 평소(정지) 이미지 경로
 * - frameWidth/Height : 단일 프레임 크기(px)
 * - frameCount : 실제 재생할 총 프레임 수 (빈칸/검은칸 제외!)
 * - columns : 시트 가로 칸 수 (행은 자동 계산)
 * - fps : 재생 프레임 속도
 * - intervalMs : 몇 초마다 재생할지 (기본 10초)
 * 
 * 시트가 가로로만 나열된 경우 => columns = frameCount
 */

function SpriteAnimator({
  sheetSrc,
  idleSrc,
  frameWidth,
  frameHeight,
  frameCount,
  columns,
  fps = 12,
  intervalMs = 10_000,
  className = "",
}: {
  sheetSrc: string;
  idleSrc: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  columns: number;
  fps?: number;
  intervalMs?: number;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);

  // 컨테이너 크기에 맞춰 프레임을 픽셀 깨지지 않게 스케일
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const s = Math.min(width / frameWidth, height / frameHeight);
      setScale(s || 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth, frameHeight]);

  // 이미지 프리로드
  useEffect(() => {
    const a = new Image();
    a.src = idleSrc;
    const b = new Image();
    b.src = sheetSrc;
  }, [idleSrc, sheetSrc]);

  // 10초마다 재생
  useEffect(() => {
    const playOnce = () => {
      setIsPlaying(true);
      setFrame(0);
      const totalMs = (frameCount / fps) * 1000;
      const start = performance.now();

      const step = (t: number) => {
        const elapsed = t - start;
        const f = Math.min(frameCount - 1, Math.floor((elapsed / 1000) * fps));
        setFrame(f);
        if (elapsed < totalMs) {
          requestAnimationFrame(step);
        } else {
          setIsPlaying(false);
          setFrame(0);
        }
      };
      requestAnimationFrame(step);
    };

    // 첫 재생은 살짝 랜덤 딜레이로 자연스럽게
    const first = setTimeout(playOnce, Math.random() * 1200 + 400);
    const id = setInterval(playOnce, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [fps, frameCount, intervalMs]);

  // 현재 프레임의 시트 좌표 계산
  const x = frame % columns;
  const y = Math.floor(frame / columns);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-40 flex items-center justify-center ${className}`}
      style={{ overflow: "hidden" }}
    >
      <div
        className="relative"
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          imageRendering: "pixelated" as any,
        }}
      >
        {/* 정지 이미지 */}
        <img
          src={idleSrc}
          alt="idle"
          width={frameWidth}
          height={frameHeight}
          className={`absolute inset-0 ${isPlaying ? "opacity-0" : "opacity-100"}`}
          style={{ imageRendering: "pixelated" as any }}
        />

        {/* 스프라이트 시트 애니메이션 */}
        <div
          aria-hidden
          className={`absolute inset-0 ${isPlaying ? "opacity-100" : "opacity-0"}`}
          style={{
            width: frameWidth,
            height: frameHeight,
            backgroundImage: `url(${sheetSrc})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: `-${x * frameWidth}px -${y * frameHeight}px`,
            // 시트가 원본 크기라면 backgroundSize 지정 불필요
            imageRendering: "pixelated",
          }}
        />
      </div>
    </div>
  );
}
/* ==================================================================================== */



interface CharacterSectionProps {
  myCharacter: Character | null;
  partnerCharacter: Character | null;
  myEvents: { _id: string; title: string }[];
  partnerEvents: { _id: string; title: string }[];
}

export default function CharacterSection({
  myCharacter,
  partnerCharacter,
  myEvents,
  partnerEvents,
}: CharacterSectionProps) {
  /* 공통 카드 렌더 */
  const renderCard = (
    char: Character | null,
    fallback: string,
    events: { _id: string; title: string }[]
  ) => (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      {/* 👇 이미지를 동그라미 대신 카드 폭 전체로 표시 */}
      <img
        src={
          char
            ? `/character/${char.evolutionStage}/${char.avatar}`
            : "/placeholder.png"
        }
        alt="avatar"
        className="w-full h-40 object-contain mb-4"  /* object-contain → 비율 유지, 잘림 X */
      />

      <div className="text-base font-bold">{char?.name ?? fallback}</div>
      <div className="text-xs mb-2">
        Lv.&nbsp;{char?.level ?? "-"} / EXP&nbsp;{char?.exp ?? 0}
      </div>

      <ul className="text-xs text-center break-keep">
        {events.length
          ? events.map((e) => <li key={e._id}>{e.title}</li>)
          : "No Events"}
      </ul>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {renderCard(myCharacter, "My Character", myEvents)}
      {renderCard(partnerCharacter, "Partner", partnerEvents)}
    </div>
  );
}