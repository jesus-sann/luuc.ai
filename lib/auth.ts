import { createClient } from "@/lib/supabase/server";

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_id: string | null;
  role: "owner" | "admin" | "member" | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "enterprise";
  usage_documents: number;
  usage_analyses: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_id: string | null;
  role: "owner" | "admin" | "member" | null;
  usage_count: number;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Buscar usuario en nuestra tabla users
  const { data: dbUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (dbUser) {
    const user = dbUser as DbUser;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      company: user.company,
      company_id: user.company_id,
      role: user.role,
      usage_count: user.usage_documents || 0,
      plan: user.plan || "free",
      created_at: user.created_at,
    };
  }

  // Si no existe en nuestra tabla, retornar datos básicos del auth user
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: authUser.user_metadata?.name || null,
    company: null,
    company_id: null,
    role: null,
    usage_count: 0,
    plan: "free",
    created_at: authUser.created_at || new Date().toISOString(),
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autorizado");
  }
  return user;
}
