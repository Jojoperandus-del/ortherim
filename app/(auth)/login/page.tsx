"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const supabase = createClient();
const router = useRouter();

useEffect(() => {
const { data: listener } = supabase.auth.onAuthStateChange(
(event, session) => {
if (session) {
router.push("/dashboard"); // 👈 REDIRECTION
}
}
);

return () => {
listener.subscription.unsubscribe();
};
}, []);

return <div>Login page</div>;
}
