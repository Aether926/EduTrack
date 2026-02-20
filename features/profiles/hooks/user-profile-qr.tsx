"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

async function safeCopy(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtShort(d: Date) {
  try {
    return d.toLocaleDateString();
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

type UseProfileQrArgs = {
  /** 30 days in your case */
  expiryDays?: number;
  /** 60 sec cooldown */
  cooldownMs?: number;
};

export function useProfileQr({ expiryDays = 30, cooldownMs = 60_000 }: UseProfileQrArgs = {}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [qrOpen, setQrOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);

  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<Date | null>(null);

  // cooldown
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  const now = Date.now();
  const cooldownLeftMs = Math.max(0, (cooldownUntil ?? 0) - now);
  const isCooldown = cooldownLeftMs > 0;

  const qrUrl = useMemo(() => {
    if (!qrToken) return "";
    if (!origin) return `/qr/${qrToken}`;
    return `${origin}/qr/${qrToken}`;
  }, [origin, qrToken]);

  const qrCanvasWrapperRef = useRef<HTMLDivElement | null>(null);

  const startCooldown = () => {
    setCooldownUntil(Date.now() + cooldownMs);
  };

  const generateQr = async (): Promise<string | null> => {
    if (isCooldown) {
      toast.info("please wait before generating again");
      return null;
    }

    try {
      setQrLoading(true);

      const res = await fetch("/api/qr/generate", { method: "POST" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(json?.error ?? "failed to generate qr");
        return null;
      }

      const token = String(json?.token ?? "");
      if (!token) {
        toast.error("failed to generate qr");
        return null;
      }

      setQrToken(token);
      setQrGeneratedAt(new Date());
      startCooldown();
      toast.success("QR code generated");
      return token;
    } catch {
      toast.error("Failed to generate qr");
      return null;
    } finally {
      setQrLoading(false);
    }
  };

  const copyQrLink = async () => {
    if (!qrToken) {
      toast.error("Generate qr first");
      return;
    }

    const ok = await safeCopy(qrUrl);
    if (ok) {
      toast.success("copied link");
      return;
    }

    window.prompt("copy this link:", qrUrl);
  };

  const downloadQrPng = async (fullName: string) => {
    if (!qrToken) return toast.error("generate qr first");

    const wrapper = qrCanvasWrapperRef.current;
    const qrCanvas = wrapper?.querySelector("canvas") as HTMLCanvasElement | null;

    if (!qrCanvas) return toast.error("qr canvas not found");

    const generatedAt = qrGeneratedAt ?? new Date();
    const expiresAt = addDays(generatedAt, expiryDays);

    const padding = 24;
    const gap = 18;

    const titleFont = "bold 18px Arial";
    const smallFont = "14px Arial";

    const qrW = qrCanvas.width;
    const qrH = qrCanvas.height;

    const outW = Math.max(qrW + padding * 2, 520);
    const outH = padding + qrH + gap + 24 + 10 + 20 + padding;

    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;

    const ctx = out.getContext("2d");
    if (!ctx) return toast.error("failed to render png");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);

    const qrX = Math.floor((outW - qrW) / 2);
    const qrY = padding;
    ctx.drawImage(qrCanvas, qrX, qrY);

    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";

    ctx.font = titleFont;
    ctx.fillText(fullName || "—", outW / 2, qrY + qrH + gap + 18);

    ctx.font = smallFont;
    ctx.fillStyle = "#374151";
    ctx.fillText(
      `Valid until: ${fmtShort(generatedAt)} - ${fmtShort(expiresAt)}`,
      outW / 2,
      qrY + qrH + gap + 18 + 26
    );

    const dataUrl = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;

    const safeFile = (fullName || "profile").replace(/[^\w\-]+/g, "_").slice(0, 40);
    a.download = `${safeFile}_qr.png`;
    a.click();

    toast.success("downloaded");
  };

  return {
    // ui state
    qrOpen,
    setQrOpen,

    // data
    qrToken,
    qrGeneratedAt,
    qrUrl,

    // loading + cooldown
    qrLoading,
    isCooldown,
    cooldownLeftMs,

    // actions
    generateQr,
    copyQrLink,
    downloadQrPng,

    // refs
    qrCanvasWrapperRef,
  };
}
