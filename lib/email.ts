export function canonicalizeEmail(raw: string) {
  const s = raw.trim().toLowerCase();
  const at = s.lastIndexOf("@");
  if (at < 0) return s;
  const local = s.slice(0, at);
  let domain = s.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";

  if (domain === "gmail.com") {
    const noPlus = local.split("+")[0];
    const noDots = noPlus.replace(/\./g, "");
    return `${noDots}@${domain}`;
  }
  return `${local}@${domain}`;
}
