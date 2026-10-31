/** Resize + compress an uploaded image in the browser (webp). Optionally place it on a white square. */
export function compressImage(file, { max = 1400, quality = 0.86, whiteSquare = false } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(1, max / Math.max(w, h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      if (whiteSquare) {
        const S = Math.max(w, h);
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, S, S);
        ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      } else {
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      }
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/webp', quality);
    };
    img.onerror = () => reject(new Error('Unsupported image'));
    img.src = url;
  });
}

export const blobToDataUrl = (blob) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
