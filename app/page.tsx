"use client";

import { useMemo, useState } from "react";

const BRAND = {
  orange: "#f59518",
  orangeDeep: "#e67f00",
  charcoal: "#0f172a",
  gray: "#64748b",
  border: "#e5e7eb",
  bg: "#ffffff",
  tint: "#fff7e6",
};

const SCALEUP_FEE = 1500;

// Fixed improvements
const IMPROVEMENTS = {
  leadsMultiplier: 1.2,     // +20%
  apptRateMultiplier: 1.15, // +15%
  closeRateMultiplier: 1.1, // +10%
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const money0 = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const num1 = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 });

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        borderColor: BRAND.border,
        background: BRAND.bg,
        boxShadow: "0 10px 32px rgba(15, 23, 42, 0.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 50,
  min = 0,
  prefix = "$",
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  prefix?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium" style={{ color: BRAND.charcoal }}>{label}</div>
        {hint ? <div className="text-xs" style={{ color: BRAND.gray }}>{hint}</div> : null}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: BRAND.gray }}>
          {prefix}
        </span>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-xl border px-8 py-3 text-sm outline-none focus:ring-2"
          style={{
            borderColor: BRAND.border,
            color: BRAND.charcoal,
            background: BRAND.bg,
            outlineColor: BRAND.orange,
          }}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "%",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium" style={{ color: BRAND.charcoal }}>{label}</div>
        <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>
          {value.toFixed(0)}{suffix}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: BRAND.orange }}
      />
      <div className="flex justify-between text-xs" style={{ color: BRAND.gray }}>
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  diy,
  withScaleUp,
  diff,
}: {
  label: string;
  diy: string;
  withScaleUp: string;
  diff: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:items-center py-3 border-b last:border-b-0" style={{ borderColor: BRAND.border }}>
      <div className="text-sm font-medium" style={{ color: BRAND.charcoal }}>{label}</div>
      <div className="text-sm" style={{ color: BRAND.charcoal }}>{diy}</div>
      <div className="text-sm font-semibold" style={{ color: BRAND.charcoal }}>{withScaleUp}</div>
      <div className="text-sm font-semibold" style={{ color: BRAND.orange }}>{diff}</div>
    </div>
  );
}

export function Calculator({ compact = false }: { compact?: boolean }) {
  const [adSpend, setAdSpend] = useState<number>(3000);
  const [cpl, setCpl] = useState<number>(60);
  const [leadToAppt, setLeadToAppt] = useState<number>(35);
  const [closeRate, setCloseRate] = useState<number>(25);
  const [clientValue, setClientValue] = useState<number>(2500);

  const computed = useMemo(() => {
    const safeCpl = Math.max(1, cpl || 1);

    // DIY
    const leads = adSpend / safeCpl;
    const appts = leads * (leadToAppt / 100);
    const clients = appts * (closeRate / 100);
    const revenue = clients * clientValue;
    const profit = revenue - adSpend;
    const roi = adSpend > 0 ? ((revenue - adSpend) / adSpend) * 100 : 0;

    // With ScaleUp
    const leads2 = leads * IMPROVEMENTS.leadsMultiplier;
    const leadToAppt2 = clamp(leadToAppt * IMPROVEMENTS.apptRateMultiplier, 0, 95);
    const closeRate2 = clamp(closeRate * IMPROVEMENTS.closeRateMultiplier, 0, 95);

    const appts2 = leads2 * (leadToAppt2 / 100);
    const clients2 = appts2 * (closeRate2 / 100);
    const revenue2 = clients2 * clientValue;

    const totalCost2 = adSpend + SCALEUP_FEE;
    const profit2 = revenue2 - totalCost2;
    const roi2 = totalCost2 > 0 ? ((revenue2 - totalCost2) / totalCost2) * 100 : 0;

    return {
      diy: { leads, appts, clients, revenue, profit, roi },
      with: { leads: leads2, appts: appts2, clients: clients2, revenue: revenue2, profit: profit2, roi: roi2 },
      diff: {
        leads: leads2 - leads,
        appts: appts2 - appts,
        clients: clients2 - clients,
        revenue: revenue2 - revenue,
        profit: profit2 - profit,
        roi: roi2 - roi,
      },
      adjusted: { leadToAppt2, closeRate2 },
    };
  }, [adSpend, cpl, leadToAppt, closeRate, clientValue]);

  return (
    <div className={compact ? "grid gap-6" : "grid gap-6 lg:grid-cols-2"}>
      <Card>
        <div className="space-y-1">
          <div className="text-lg font-semibold" style={{ color: BRAND.charcoal }}>Your Inputs</div>
          <div className="text-sm" style={{ color: BRAND.gray }}>Adjust values to see live projections.</div>
        </div>

        <div className="mt-6 grid gap-5">
          <NumberField label="Monthly Ad Spend" value={adSpend} onChange={setAdSpend} step={50} min={0} />
          <NumberField label="Average Cost Per Lead (CPL)" value={cpl} onChange={setCpl} step={1} min={1} hint="Typical range: $20–$150" />
          <Slider label="Lead → Appointment Conversion" value={leadToAppt} min={5} max={80} step={1} onChange={setLeadToAppt} />
          <Slider label="Appointment → Close Rate" value={closeRate} min={2} max={60} step={1} onChange={setCloseRate} />
          <NumberField label="Average Client Value" value={clientValue} onChange={setClientValue} step={50} min={0} />
        </div>

        <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: BRAND.tint, border: `1px solid ${BRAND.border}` }}>
          <div className="font-semibold" style={{ color: BRAND.charcoal }}>ScaleUp fee included</div>
          <div style={{ color: BRAND.gray }}>
            “With ScaleUp” includes <span className="font-semibold" style={{ color: BRAND.charcoal }}>{money0(SCALEUP_FEE)}/mo</span>.
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-1">
          <div className="text-lg font-semibold" style={{ color: BRAND.charcoal }}>Projected Results</div>
          <div className="text-sm" style={{ color: BRAND.gray }}>
            DIY vs With ScaleUp vs Difference.
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-4 md:gap-2 pb-3 mt-6 border-b" style={{ borderColor: BRAND.border }}>
          <div className="text-xs uppercase tracking-wide" style={{ color: BRAND.gray }}>Metric</div>
          <div className="text-xs uppercase tracking-wide" style={{ color: BRAND.gray }}>DIY</div>
          <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: BRAND.gray }}>With ScaleUp</div>
          <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: BRAND.gray }}>Difference</div>
        </div>

        <div className="mt-2">
          <MetricRow label="Leads" diy={num1(computed.diy.leads)} withScaleUp={num1(computed.with.leads)} diff={`${computed.diff.leads >= 0 ? "+" : ""}${num1(computed.diff.leads)}`} />
          <MetricRow label="Appointments" diy={num1(computed.diy.appts)} withScaleUp={num1(computed.with.appts)} diff={`${computed.diff.appts >= 0 ? "+" : ""}${num1(computed.diff.appts)}`} />
          <MetricRow label="Clients" diy={num1(computed.diy.clients)} withScaleUp={num1(computed.with.clients)} diff={`${computed.diff.clients >= 0 ? "+" : ""}${num1(computed.diff.clients)}`} />
          <MetricRow label="Revenue" diy={money0(computed.diy.revenue)} withScaleUp={money0(computed.with.revenue)} diff={`${computed.diff.revenue >= 0 ? "+" : ""}${money0(computed.diff.revenue)}`} />
          <MetricRow label="Profit" diy={money0(computed.diy.profit)} withScaleUp={money0(computed.with.profit)} diff={`${computed.diff.profit >= 0 ? "+" : ""}${money0(computed.diff.profit)}`} />
          <MetricRow label="ROI %" diy={`${computed.diy.roi.toFixed(0)}%`} withScaleUp={`${computed.with.roi.toFixed(0)}%`} diff={`${computed.diff.roi >= 0 ? "+" : ""}${computed.diff.roi.toFixed(0)}%`} />
        </div>

        <div className="mt-6 rounded-xl p-4 text-sm" style={{ border: `1px solid ${BRAND.border}`, background: "#fafafa" }}>
          <div className="font-semibold" style={{ color: BRAND.charcoal }}>What “With ScaleUp” assumes</div>
          <ul className="mt-2 space-y-1" style={{ color: BRAND.gray }}>
            <li>• Leads: +20%</li>
            <li>• Lead→Appt: +15% (adjusted to {computed.adjusted.leadToAppt2.toFixed(0)}%)</li>
            <li>• Close Rate: +10% (adjusted to {computed.adjusted.closeRate2.toFixed(0)}%)</li>
            <li>• Includes {money0(SCALEUP_FEE)}/mo management fee</li>
          </ul>
        </div>

        {!compact && (
          <div className="mt-6">
            <a
              href="#"
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeDeep})`, color: "white" }}
            >
              Book a Call to Review Your ROI
            </a>
            <div className="mt-2 text-xs text-center" style={{ color: BRAND.gray }}>
              Planning tool only — not a guarantee.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: BRAND.border, color: BRAND.gray, background: "rgba(255,255,255,0.7)" }}
          >
            ScaleUp ROI Projection Tool
          </div>

          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl" style={{ color: BRAND.charcoal }}>
            ROI Calculator
          </h1>

          <p className="max-w-2xl text-sm md:text-base" style={{ color: BRAND.gray }}>
            Plug in a few numbers to compare{" "}
            <span className="font-semibold" style={{ color: BRAND.charcoal }}>DIY</span> vs{" "}
            <span className="font-semibold" style={{ color: BRAND.charcoal }}>With ScaleUp</span> (includes our {money0(SCALEUP_FEE)}/mo fee).
          </p>
        </header>

        <Calculator />

        <footer className="pt-6 text-xs" style={{ color: BRAND.gray }}>
          © {new Date().getFullYear()} ScaleUp — projections for planning, not promises.
        </footer>
      </div>
    </main>
  );
}
