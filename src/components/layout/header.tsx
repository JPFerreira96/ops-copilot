import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Bot, LogOut } from "lucide-react";
import Link from "next/link";

export default async function Header() {
    const session = await auth();

    if (!session?.user) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 text-primary font-semibold">
                    <Bot className="h-6 w-6" />
                    <span>Ops Copilot</span>
                </Link>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-600 font-medium">
                        {session.user.email}
                    </span>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <Button variant="outline" size="sm" type="submit">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    );
}
