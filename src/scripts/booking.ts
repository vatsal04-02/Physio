/**
 * "Book your visit" — a *request* composer. No backend, no calendar, nothing stored: it validates the
 * form, builds one WhatsApp message and opens it, and the clinic confirms the slot in the chat.
 */
import { openWhatsApp } from './whatsapp';

type Track = (name: string, params?: Record<string, string>) => void;
type Schedule = { timeZone: string; days: number[]; sessions: [string, string][] };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** The next `count` open days in clinic time, as chip labels like "Mon 6". */
export function nextOpenDays(cfg: Schedule, now: Date, count = 6): { label: string; long: string }[] {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: cfg.timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const minutes = n('hour') * 60 + n('minute');
  const closes = Math.max(...cfg.sessions.map(([, end]) => toMin(end)));
  // A calendar date in clinic time, held as UTC midnight so adding days never meets a DST shift
  const today = Date.UTC(n('year'), n('month') - 1, n('day'));
  const isOpenDay = (t: number) => cfg.days.includes(new Date(t).getUTCDay());

  // Today only counts while the clinic still has a session left; from a closed day (Sunday) start at the next open one
  let offset = isOpenDay(today) && minutes < closes ? 0 : 1;
  const days: { label: string; long: string }[] = [];
  const longFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
  while (days.length < count && offset < 21) {
    const t = today + offset * 86_400_000;
    offset++;
    if (!isOpenDay(t)) continue;
    const d = new Date(t);
    days.push({ label: `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}`, long: longFmt.format(d) });
  }
  return days;
}

export function bookingMessage(v: { name: string; phone: string; concern: string; visit: string; day: string; slot: string }): string {
  return `Hello Geeta Krishna Physiotherapy, I found you through the website. I'd like to request an appointment — Name: ${v.name}, Phone: +91 ${v.phone}, Concern: ${v.concern}, Visit: ${v.visit}, Preferred: ${v.day}, ${v.slot}. Please confirm.`;
}

export function initBooking(track: Track): void {
  const form = document.querySelector<HTMLFormElement>('[data-book-form]');
  if (!form) return;
  const cfg = JSON.parse(form.dataset.schedule ?? 'null') as Schedule | null;
  const daysWrap = form.querySelector<HTMLElement>('[data-days]');
  const chipTpl = form.querySelector<HTMLTemplateElement>('template[data-day-chip]');
  const status = form.querySelector<HTMLElement>('[data-book-status]');
  const name = form.querySelector<HTMLInputElement>('#book-name')!;
  const phone = form.querySelector<HTMLInputElement>('#book-phone')!;
  const concern = form.querySelector<HTMLSelectElement>('#book-concern')!;
  if (!cfg || !daysWrap || !chipTpl) return;

  /* ---- Day chips (real upcoming dates, clinic time) ---- */
  let renderedFor = '';
  const renderDays = () => {
    const days = nextOpenDays(cfg, new Date());
    const key = days.map((d) => d.label).join('|');
    if (key === renderedFor) return;
    renderedFor = key;
    const chosen = form.querySelector<HTMLInputElement>('input[name="day"]:checked')?.value;
    daysWrap.replaceChildren(
      ...days.map((d) => {
        const chip = chipTpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const input = chip.querySelector<HTMLInputElement>('input')!;
        input.value = d.label;
        input.checked = d.label === chosen;
        chip.querySelector('span')!.append(d.label);
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = ` (${d.long})`;
        chip.querySelector('span')!.append(sr);
        return chip;
      }),
    );
  };
  renderDays();
  document.addEventListener('visibilitychange', () => !document.hidden && renderDays()); // tab left open overnight

  /* ---- Phone: digits only, tolerant of pasted "+91 98386 81421" ---- */
  phone.addEventListener('input', () => {
    const digits = phone.value.replace(/\D/g, '');
    if (digits !== phone.value) phone.value = digits;
  });
  phone.addEventListener('paste', (event) => {
    let digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    event.preventDefault();
    phone.value = digits.slice(0, 10);
    phone.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* ---- Validation with inline errors ---- */
  const checked = (field: string) => form.querySelector<HTMLInputElement>(`input[name="${field}"]:checked`)?.value ?? '';
  const rules: Record<string, { ok: () => boolean; control: () => HTMLElement | null; err: string }> = {
    name: { ok: () => name.value.trim().length > 0, control: () => name, err: 'book-name-err' },
    phone: { ok: () => /^\d{10}$/.test(phone.value), control: () => phone, err: 'book-phone-err' },
    concern: { ok: () => concern.value !== '', control: () => concern, err: 'book-concern-err' },
    day: { ok: () => checked('day') !== '', control: () => form.querySelector('input[name="day"]'), err: 'book-day-err' },
    slot: { ok: () => checked('slot') !== '', control: () => form.querySelector('input[name="slot"]'), err: 'book-slot-err' },
  };
  const show = (key: string, bad: boolean) => {
    const rule = rules[key];
    const err = document.getElementById(rule.err);
    if (err) err.hidden = !bad;
    const control = rule.control();
    if (control && (key === 'name' || key === 'phone' || key === 'concern')) {
      if (bad) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
  };
  let attempted = false;
  const recheck = (key: string) => attempted && show(key, !rules[key].ok());
  name.addEventListener('input', () => recheck('name'));
  phone.addEventListener('input', () => recheck('phone'));
  concern.addEventListener('change', () => recheck('concern'));
  form.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'day' || target.name === 'slot') recheck(target.name);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;
    if (status) status.hidden = true;
    let firstBad: HTMLElement | null = null;
    for (const key of Object.keys(rules)) {
      const bad = !rules[key].ok();
      show(key, bad);
      if (bad && !firstBad) firstBad = rules[key].control();
    }
    if (firstBad) {
      firstBad.focus();
      return;
    }

    const message = bookingMessage({
      name: name.value.trim().replace(/\s+/g, ' '),
      phone: phone.value,
      concern: concern.value,
      visit: checked('visit'),
      day: checked('day'),
      slot: checked('slot'),
    });
    track('whatsapp_click', { location: 'booking-form', concern: concern.value });
    openWhatsApp(`https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(message)}`);
    if (status) {
      status.textContent = 'WhatsApp is opening with your request. Send the message there — the clinic will reply to confirm your slot.';
      status.hidden = false;
    }
  });
}
