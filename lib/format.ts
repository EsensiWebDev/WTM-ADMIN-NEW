export function formatCurrency(nominal: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    trailingZeroDisplay: "stripIfInteger",
  }).format(nominal);
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions = {}
) {
  if (!date) return "";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      month: opts.month ?? "long",
      day: opts.day ?? "numeric",
      year: opts.year ?? "numeric",
      ...opts,
    }).format(new Date(date));
  } catch (_err) {
    return "";
  }
}

// Formats date as '18 February 2025 | 13:35:46 WIB' (Asia/Jakarta)
export function formatDateTimeWIB(date: Date | string | number | undefined) {
  if (!date) return "";
  try {
    const d = new Date(date);
    // Date part
    const datePart = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
    // Time part
    const timePart = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
    return `${datePart} | ${timePart} WIB`;
  } catch (_err) {
    return "";
  }
}

export function formatUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Check if URL already starts with http:// or https://
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Prepend http:// to URLs that don't have a protocol
  return `http://${url}`;
}
