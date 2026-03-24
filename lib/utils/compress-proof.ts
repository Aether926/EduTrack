import imageCompression from "browser-image-compression";

export async function compressProofFile(file: File) {
  // don't compress PDFs
  if (file.type === "application/pdf") return file;

  // only compress images
  if (!file.type.startsWith("image/")) return file;

  // already small enough
  if (file.size <= 900 * 1024) return file;

  const options = {
    maxSizeMB: 0.85,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.7,
    fileType: "image/jpeg",
  };

  const compressed = await imageCompression(file, options);
  const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
  return new File([compressed], safeName, { type: "image/jpeg" });
}
