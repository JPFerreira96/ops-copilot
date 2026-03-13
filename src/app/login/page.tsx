import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <Card className="w-[400px]">
                <CardHeader>
                    <Bot className="h-6 w-6" />
                    <CardTitle className="text-2xl">Ops Copilot</CardTitle>
                    <CardDescription>
                        Entre com suas credenciais de administrador.
                    </CardDescription>
                </CardHeader>
                <form
                    action={async (formData) => {
                        "use server";
                        try {
                            await signIn("credentials", formData);
                        } catch (error) {
                            if (
                                typeof error === "object" &&
                                error !== null &&
                                "kind" in error &&
                                (error as { kind?: string }).kind === "redirect"
                            ) {
                                throw error;
                            }
                            redirect("/login?error=CredentialsSignin");
                        }
                    }}
                >
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit">
                            Entrar
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
