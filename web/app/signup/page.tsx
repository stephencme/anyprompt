import SignupPageClient from "./page.client";

export default function SignupPage() {
  const supabaseConfig = {
    url: process.env.SUPABASE_URL ?? "",
    anonKey: process.env.SUPABASE_ANON_KEY ?? "",
  };

  const signupTemplate = {
    title: "Create an Account",
    description: "Fill in the form below to sign up and get started.",
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>{signupTemplate.title}</h1>
      <SignupPageClient supabaseConfig={supabaseConfig} signupTemplate={signupTemplate} />
    </main>
  );
}
