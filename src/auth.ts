import NextAuth, { type NextAuthConfig } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";

function hasPair(id?: string, secret?: string) {
  return Boolean(id && secret);
}

const providers: NextAuthConfig["providers"] = [];

if (hasPair(process.env.AUTH_GOOGLE_ID, process.env.AUTH_GOOGLE_SECRET)) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  );
}

if (hasPair(process.env.AUTH_LINE_ID, process.env.AUTH_LINE_SECRET)) {
  providers.push(
    LineProvider({
      clientId: process.env.AUTH_LINE_ID!,
      clientSecret: process.env.AUTH_LINE_SECRET!,
    }),
  );
}

if (
  process.env.NEXT_PUBLIC_ENABLE_APPLE === "true" &&
  hasPair(process.env.AUTH_APPLE_ID, process.env.AUTH_APPLE_SECRET)
) {
  providers.push(
    AppleProvider({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
    }),
  );
}

export function hasConfiguredAuthProvider() {
  return providers.length > 0;
}

export function hasAuthSecret() {
  return Boolean(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
}

export function isAuthRuntimeConfigured() {
  return hasConfiguredAuthProvider() && hasAuthSecret();
}

export function shouldUseDemoAuthFallback() {
  if (process.env.ALLOW_DEMO_AUTH === "true") {
    return true;
  }

  if (process.env.ALLOW_DEMO_AUTH === "false") {
    return false;
  }

  return !isAuthRuntimeConfigured();
}

export const authConfig: NextAuthConfig = {
  providers,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? token.email ?? "unknown");
      }

      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
