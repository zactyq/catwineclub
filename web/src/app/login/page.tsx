import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center sm:px-6">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-display text-heading-lg text-heading-charcoal">Sign In</h1>
        <p className="max-w-sm text-body text-body-brown">
          No password needed — we&apos;ll email you a link that signs you in for a year.
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
