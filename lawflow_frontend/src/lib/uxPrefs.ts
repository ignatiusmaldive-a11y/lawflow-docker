export type UxPrefs = {
  tipsEnabled: boolean;
  calendarAlertsEnabled: boolean;
};

const LS_UX_PREFS = "lawflow.ux.prefs.v1";

export function loadUxPrefs(): UxPrefs {
  try {
    const raw = localStorage.getItem(LS_UX_PREFS);
    if (!raw) return { tipsEnabled: false, calendarAlertsEnabled: false };
    const p = JSON.parse(raw);
    return {
      tipsEnabled: Boolean(p?.tipsEnabled),
      calendarAlertsEnabled: Boolean(p?.calendarAlertsEnabled),
    };
  } catch {
    return { tipsEnabled: false, calendarAlertsEnabled: false };
  }
}

export function saveUxPrefs(prefs: UxPrefs) {
  try {
    localStorage.setItem(LS_UX_PREFS, JSON.stringify(prefs));
  } catch {}
}

