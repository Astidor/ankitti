// The Android app is a WebView that adds "AnkittiApp/<version>" to its user agent and exposes
// window.AnkittiAndroid. Anything the site needs from the phone goes through here.

interface AndroidBridge {
  /** Opens the system "save as" screen for a file. `base64` is the file's bytes. */
  saveFile(name: string, mime: string, base64: string): void;
  /** Matches the status and navigation bars to the theme on screen. */
  setTheme(theme: 'light' | 'dark'): void;
}

const bridge = (): AndroidBridge | undefined =>
  typeof window !== 'undefined' ? (window as any).AnkittiAndroid : undefined;

export const isAndroidApp = (): boolean =>
  typeof navigator !== 'undefined' && /\bAnkittiApp\//.test(navigator.userAgent);

const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};

/** Saves text, a Blob or a data: / http(s) URL as a file: a download on the web, "save as" in the app. */
export async function saveFile(name: string, mime: string, data: string | Blob, opts: { isUrl?: boolean } = {}) {
  const app = bridge();
  if (app) {
    let base64: string;
    if (opts.isUrl && typeof data === 'string' && data.startsWith('data:')) {
      base64 = data.slice(data.indexOf(',') + 1);
    } else {
      const blob = typeof data === 'string' ? (opts.isUrl ? await (await fetch(data)).blob() : new Blob([data])) : data;
      base64 = toBase64(new Uint8Array(await blob.arrayBuffer()));
    }
    app.saveFile(name, mime, base64);
    return;
  }

  const href = opts.isUrl && typeof data === 'string' ? data : URL.createObjectURL(typeof data === 'string' ? new Blob([data], { type: mime }) : data);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (href.startsWith('blob:')) URL.revokeObjectURL(href);
}
