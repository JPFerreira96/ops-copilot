import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"



export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user) return null

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (isPasswordValid) {
                    return { id: user.id, name: user.name, email: user.email }
                }

                return null
            },
        }),
    ],
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isApiRoute = nextUrl.pathname.startsWith('/api');
            const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
            const isOnLogin = nextUrl.pathname.startsWith('/login');

            if (isApiRoute && !isAuthRoute && !isLoggedIn) {
                return false;
            }

            if (!isLoggedIn && !isOnLogin && !isApiRoute) {
                return Response.redirect(new URL('/login', nextUrl));
            }

            if (isLoggedIn && isOnLogin) {
                return Response.redirect(new URL('/tickets', nextUrl));
            }

            return true;
        },
    },
})
