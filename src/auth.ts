import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    githubUsername?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile }) {
      if (profile && typeof profile.login === "string") {
        token.githubUsername = profile.login;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.githubUsername === "string") {
        session.githubUsername = token.githubUsername;
      }
      return session;
    },
  },
});
