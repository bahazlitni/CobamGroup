import StaffResetPasswordForm from "./reset-password-form";

export default async function StaffResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <StaffResetPasswordForm token={params.token ?? ""} />;
}
