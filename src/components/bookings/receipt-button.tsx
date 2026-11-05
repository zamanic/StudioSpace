"use client";

import { PrinterIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { currency, clockTime, shortDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

/** User text goes into an HTML document, so it is escaped before it is written. */
function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string, strong = false) {
  return `<tr${strong ? ' class="total"' : ""}><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;
}

/**
 * The whole invoice as one standalone document. Everything is inlined because
 * the receipt window has no access to the app's stylesheet - it is a separate
 * document, which is what keeps the printed PDF free of the site chrome.
 */
function receiptHtml(booking: Booking) {
  const pricing = booking.pricingSummary;
  const hours = Number(booking.schedule?.totalHours ?? 0);
  const paid = String(booking.payment?.paymentStatus ?? "").toLowerCase() === "paid";
  const address = [
    booking.studioLocation?.address,
    booking.studioLocation?.city,
    booking.studioLocation?.state,
    booking.studioLocation?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
  const issued = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const charges = [
    row(
      `Studio hire · ${currency(pricing?.hourlyRate)} × ${hours}h`,
      currency(pricing?.subtotal),
    ),
    row("Security deposit (refundable)", currency(pricing?.securityDeposit)),
    row("Cleaning fee", currency(pricing?.cleaningFee)),
    row("Service fee", currency(pricing?.platformFee)),
    row(paid ? "Total charged" : "Total due", currency(pricing?.totalAmount), true),
  ].join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Receipt ${esc(booking.bookingNumber)} - StudioSpace</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 32px 64px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.55;
    color: #1a1a1a;
    background: #fff;
  }
  .sheet { max-width: 720px; margin: 0 auto; }
  .bar {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    margin-bottom: 32px;
  }
  .bar button {
    padding: 9px 18px; border: 0; border-radius: 999px; cursor: pointer;
    background: #111; color: #fff; font: inherit; font-size: 12px;
    letter-spacing: .08em; text-transform: uppercase;
  }
  .bar span { color: #777; font-size: 11px; }
  .brand { font-size: 20px; letter-spacing: .22em; text-transform: uppercase; }
  .brand b { font-weight: 600; }
  .meta { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
  .meta h1 { margin: 0 0 4px; font-size: 26px; font-weight: 500; letter-spacing: -.01em; }
  .meta p { margin: 0; color: #666; }
  .meta .right { text-align: right; }
  .pill {
    display: inline-block; padding: 4px 11px; border-radius: 999px;
    border: 1px solid #ddd; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  }
  .pill.paid { background: #111; border-color: #111; color: #fff; }
  .grid { display: flex; flex-wrap: wrap; gap: 28px; margin-bottom: 28px; }
  .grid > div { flex: 1 1 240px; }
  .label {
    margin: 0 0 6px; color: #888; font-size: 10px;
    letter-spacing: .16em; text-transform: uppercase;
  }
  .value { margin: 0; }
  .value.strong { font-size: 15px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 11px 0; text-align: left; border-bottom: 1px solid #ececec; }
  td { text-align: right; white-space: nowrap; }
  th { font-weight: 400; color: #555; }
  tr.total th, tr.total td {
    border-bottom: 0; border-top: 2px solid #111;
    font-size: 15px; font-weight: 600; color: #111;
  }
  .notes { margin-top: 28px; padding-top: 20px; border-top: 1px solid #ececec; color: #666; font-size: 12px; }
  .notes p { margin: 0 0 6px; }
  .foot { margin-top: 36px; color: #999; font-size: 11px; }
  @page { margin: 14mm; }
  @media print {
    body { padding: 0; }
    .bar { display: none; }
  }
</style>
</head>
<body>
<div class="sheet">
  <div class="bar">
    <span>Use Print - then choose "Save as PDF" to download this receipt.</span>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="brand"><b>Studio</b>Space</div>

  <div class="meta" style="margin-top:24px">
    <div>
      <h1>Booking receipt</h1>
      <p>Receipt ${esc(booking.bookingNumber)} &middot; issued ${esc(issued)}</p>
    </div>
    <div class="right">
      <span class="pill ${paid ? "paid" : ""}">${esc(booking.status)}</span>
      <p style="margin-top:8px">${paid ? "Paid in full" : "Payment outstanding"}</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <p class="label">Studio</p>
      <p class="value strong">${esc(booking.studioTitle)}</p>
      <p class="value">${esc(booking.studioCategory)}</p>
    </div>
    <div>
      <p class="label">Workspace address</p>
      <p class="value">${esc(address || "Address unavailable")}</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <p class="label">Session date</p>
      <p class="value">${esc(shortDate(booking.schedule?.bookingDate))}</p>
    </div>
    <div>
      <p class="label">Time</p>
      <p class="value">${esc(clockTime(booking.schedule?.startTime))} - ${esc(clockTime(booking.schedule?.endTime))} (${esc(hours)}h)</p>
    </div>
    <div>
      <p class="label">Crew size</p>
      <p class="value">${esc(booking.projectDetails?.crewSize)} people</p>
    </div>
  </div>

  <div class="grid">
    <div>
      <p class="label">Project</p>
      <p class="value strong">${esc(booking.projectDetails?.projectTitle)}</p>
      ${
        booking.projectDetails?.specialRequirements
          ? `<p class="value">${esc(booking.projectDetails.specialRequirements)}</p>`
          : ""
      }
    </div>
    <div>
      <p class="label">Billed to</p>
      <p class="value">${esc(booking.creator?.name)}</p>
      <p class="value">${esc(booking.creator?.email)}</p>
    </div>
  </div>

  <table>
    <tbody>${charges}</tbody>
  </table>

  <div class="notes">
    <p><strong>Payment</strong> &middot; ${esc(booking.payment?.paymentStatus ?? "Unpaid")}${
      booking.payment?.paymentMethod ? ` &middot; ${esc(booking.payment.paymentMethod)}` : ""
    }${booking.payment?.transactionId ? ` &middot; ${esc(booking.payment.transactionId)}` : ""}</p>
    <p><strong>Host</strong> &middot; ${esc(booking.hostEmail)}</p>
    <p>The security deposit is held against the booking and released once the host marks the session complete.</p>
  </div>

  <p class="foot">
    StudioSpace &middot; this receipt covers one reservation and is void if the booking is cancelled.
  </p>
</div>
</body>
</html>`;
}

/**
 * Renders the booking as a printable invoice. The receipt is built in a new
 * window rather than in a hidden node on the page, so the browser's own
 * "Save as PDF" prints only the invoice - never the site's navbar, grid or
 * footer - and no PDF library has to be shipped to the client.
 */
export function ReceiptButton({ booking }: { booking: Booking }) {
  const open = () => {
    const win = window.open("", "_blank", "width=880,height=1000");
    if (!win) {
      toast.error("Your browser blocked the receipt window", {
        description: "Allow pop-ups for StudioSpace, then try again.",
      });
      return;
    }

    win.document.open();
    win.document.write(receiptHtml(booking));
    win.document.close();
    win.focus();
    // One frame for the receipt to lay out; printing before that can capture
    // an empty first page in some browsers.
    window.setTimeout(() => win.print(), 400);
  };

  return (
    <Button variant="outline" size="sm" onClick={open}>
      <PrinterIcon />
      Receipt
    </Button>
  );
}
