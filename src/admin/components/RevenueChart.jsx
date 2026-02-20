import { useEffect, useRef } from "react";

export default function RevenueChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padLeft = 70;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 50;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const values = data.map((d) => Number(d.revenue));
    const maxVal = Math.max(...values, 1);

    const isDark = document.documentElement.classList.contains("dark");
    const textColor = isDark ? "#a8a29e" : "#78716c";
    const gridColor = isDark ? "#292524" : "#e7e5e3";
    const lineColor = isDark ? "#f59e0b" : "#d97706";
    const fillColor = isDark ? "rgba(245,158,11,0.1)" : "rgba(217,119,6,0.08)";

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padTop + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      const val = maxVal - (maxVal / gridLines) * i;
      ctx.fillStyle = textColor;
      ctx.font = "11px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(
        val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0),
        padLeft - 8,
        y + 4
      );
    }

    if (data.length === 1) {
      const x = padLeft + chartW / 2;
      const y = padTop + chartH - (values[0] / maxVal) * chartH;
      ctx.fillStyle = lineColor;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(data[0].date.slice(5), x, h - padBottom + 18);
      return;
    }

    const stepX = chartW / (data.length - 1);

    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + chartH - (values[0] / maxVal) * chartH);
    for (let i = 1; i < data.length; i++) {
      const x = padLeft + stepX * i;
      const y = padTop + chartH - (values[i] / maxVal) * chartH;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padLeft + stepX * (data.length - 1), padTop + chartH);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    for (let i = 0; i < data.length; i++) {
      const x = padLeft + stepX * i;
      const y = padTop + chartH - (values[i] / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    const labelStep = Math.max(1, Math.floor(data.length / 7));
    for (let i = 0; i < data.length; i += labelStep) {
      const x = padLeft + stepX * i;
      ctx.fillText(data[i].date.slice(5), x, h - padBottom + 18);
    }
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
