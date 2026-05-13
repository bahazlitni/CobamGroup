export default function FormError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-2 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}