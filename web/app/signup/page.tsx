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
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", backgroundColor: "#FFF9DB", minHeight:"100vh" }}>
      <div style={{textAlign:"center", marginBottom:"0.5rem"}}>
        <h1 style={{fontSize: "2rem", fontWeight:"bold", margin:"0"}}>Welcome to AnyPrompt!</h1>
      </div>
      <SignupPageClient supabaseConfig={supabaseConfig} signupTemplate={signupTemplate} />
    </main>
  );
}
