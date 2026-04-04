import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (user.app_metadata.role === 'team_member') {
      redirect('/team')
    }

    redirect('/admin')
  }

  redirect('/login')
}
