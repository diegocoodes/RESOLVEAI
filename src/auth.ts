import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { getServerConfiguration } from "@/lib/server-config";

const serverConfiguration = getServerConfiguration();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: serverConfiguration.databaseConfigured ? PrismaAdapter(getPrisma()) : undefined,
  secret: process.env.AUTH_SECRET,
  trustHost: serverConfiguration.trustedHostConfigured,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "E-mail e senha",
      credentials: { email: { label: "E-mail", type: "email" }, password: { label: "Senha", type: "password" } },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success || !serverConfiguration.ready) return null;
        const user = await getPrisma().user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user?.id) token.sub = user.id; return token; },
    session({ session, token }) { if (session.user && token.sub) session.user.id = token.sub; return session; },
  },
});
