export default function InvalidQRPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full border rounded-lg p-6 space-y-2">
        <div className="text-lg font-semibold">INVALID QR CODE ❗</div>
        <p className="text-sm opacity-80">
          This qr is expired or was replaced by a new one.
        </p>
      </div>
    </div>
  );
}
