#!/usr/bin/env python3
"""Fix toDateYMD — avoid UTC shift when formatting PostgreSQL DATE values."""

from pathlib import Path

INDEX = Path('/opt/bookingo-api/src/index.js')
text = INDEX.read_text()

OLD = """function toDateYMD(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}"""

NEW = """function toDateYMD(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const m = value.match(/^(\\d{4}-\\d{2}-\\d{2})/);
    return m ? m[1] : value.slice(0, 10);
  }
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value);
  const m = s.match(/^(\\d{4}-\\d{2}-\\d{2})/);
  return m ? m[1] : s.slice(0, 10);
}"""

if OLD in text:
    text = text.replace(OLD, NEW)
    INDEX.write_text(text)
    print('toDateYMD patched')
elif 'value.getFullYear()' in text and 'toDateYMD' in text:
    print('already patched')
else:
    raise SystemExit('toDateYMD block not found')
