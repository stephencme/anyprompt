"use client"

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import type { User } from "@supabase/supabase-js";
import { User_custom } from "@anyprompt/core";
import { useRouter } from "next/navigation";

import { Merriweather } from "next/font/google"
import { Libre_Franklin } from "next/font/google"
import { DM_Mono } from "next/font/google"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
);

const merriweather = Merriweather({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

const dmmono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
})

const librefranklin = Libre_Franklin({
  weight: ["400", "700"],
  subsets: ["latin"],
})

// type ApiKeyRecord = {
//   id: string;
//   provider: string;
//   masked_api_key: string;
//   created_at: string;
// };

type APIKeys = {
  openai: string | null;
  anthropic: string | null;
}

export default function SettingsPageClient() {
  const [user, setUser] = useState<User | null>(null); // used to get user of the current session
  const [profile, setProfile] = useState<User_custom | null>(null); // used for querrying the "Users" table TODO: switch to using the built in User table from supa

  const router = useRouter(); //for page redirection

  // const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<APIKeys>();
  // const [error, setError] = useState("");
  // const [statusMessage, setStatusMessage] = useState("");

    // get the current user of the session
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const current_user = data?.user;
    
      setUser(current_user);
  
      // querry the "Users" table
      if(current_user){
        const { data: p, error: profileError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", current_user?.id)
          .single();
  
          if(profileError){
            return (<div>Error retrieving profile</div>)
          }
          else{
            setProfile(p);
          }
      }
    };

    const fetchKeys = async () => {
      if (profile) {
        const { data: keys, error } = await supabase
          .from("user_api_keys")
          .select("*")
          .eq("user_id", profile.id);
    
        if (error) {
          // setError(error.message);
        } else {
          var openai_key = null;
          var anthropic_key = null;

          for(var i = 0 ; i < keys.length; ++i){
            if(keys.at(i) && keys.at(i)?.provider == "OpenAI"){
              openai_key = keys.at(i)?.encrypted_api_key ?? null; //maybe decrypt this?
            }
            else if(keys.at(i)?.provider == "Anthropic"){
              anthropic_key = keys.at(i)?.encrypted_api_key ?? null; //maybe decrypt this?
            }
          }

          const api_keys: APIKeys = {
            openai: openai_key,
            anthropic: anthropic_key,
          }
          setKeys(api_keys);
        }
      } else {
        // user had no api keys
        const noKeys: APIKeys = {
          openai: null,
          anthropic: null,
        };
        setKeys(noKeys);
      }
      // setLoading(false);
    }

    // TODO
    const handlePasswordChange = async () => {

    }

    const handleSignOut = async () => {
      supabase.auth.signOut();
      router.push("/login")
    }

  useEffect(() => {
    fetchUser();
    fetchKeys();
  }, []);

  // if (loading){
  //   return <p>Loading...</p>;
  // }

  //make this pretty?
  if (!user) {
    return <p>User not logged in</p>;
  }

  // Weight	Class
  // 100	  font-thin
  // 200	  font-extralight
  // 300	  font-light
  // 400	  font-normal
  // 500	  font-medium
  // 600	  font-semibold
  // 700	  font-bold
  // 800	  font-extrabold
  // 900	  font-black
  return (
    <div className={`min-h-screen bg-[#FFFDF3] pt-7 pl-[32px] pr-[32px] text-[#222]`}>
  <h1 className={`text-2xl font-black mb-2 ${merriweather.className}`}>Settings</h1>
  
  {/* Horizontal line */}
  <hr className="border-t border-[#e0e0e0] mt-7 mb-6" />

  {/* Username + Sign out */}
  <div className="mb-8 pl-3">
    <h2 className={`text-sm mb-2 font-medium text-[#484F5E] ${dmmono.className}`}>Username</h2>
    <p className={`mb-4 text-[#0B152D] font-medium ${dmmono.className}`}>{profile?.email}</p>
    <button onClick={handleSignOut} className={`bg-burnt-orange text-white font-bold px-4 py-2 ${librefranklin.className}`}>Sign out</button>
  </div>

  {/* Password box */}
  <div className="mb-6">
    <h2 onClick={handlePasswordChange} className={`text-sm mb-2 pl-3 text-[#484F5E] font-medium ${dmmono.className}`}>Change password</h2>
    <div className="border border-[#e0e0e0] p-1 flex items-center gap-3 w-full max-w-md">
      <label className={`text-burnt-orange font-normal ${dmmono.className}`} htmlFor="password">
        <span className="pl-2 font-medium">Password:</span>
      </label>
      <input
        id="password"
        type="password"
        placeholder="password"
        className="flex-1 border-none outline-none bg-transparent text-[#6D717B] placeholder:text-[#6D717B]"
      />
      <button className={`bg-[#DC6A50] text-white px-3 py-1 border border-[#eab6a7] font-bold ${librefranklin.className}`}>
        Change
      </button>
    </div>
  </div>

  {/* API Keys */}
  <div>
    <h2 className={`text-sm mb-2 pl-3 text-[#484F5E] font-medium ${dmmono.className}`}>API keys</h2>

    <div className="border border-[#e0e0e0] px-3 py-2 mb-2 max-w-md">
      <span className={`text-burnt-orange font-medium ${dmmono.className}`}>ANTHROPIC_API_KEY:</span> 
      <span className={`text-[#6D717B] ml-2 font-normal ${dmmono.className}`}>
        {keys?.anthropic ?? 'Not set'}
      </span> 
    </div>

    <div className="border border-[#e0e0e0] px-3 py-2 max-w-md">
      <span className={`text-burnt-orange font-medium ${dmmono.className}`}>OPENAI_API_KEY:</span> 
      <span className={`text-[#6D717B] ml-2 font-normal ${dmmono.className}`}>
        {keys?.openai ?? 'Not set'}
      </span>
    </div>
    </div>
</div>
  );
}
