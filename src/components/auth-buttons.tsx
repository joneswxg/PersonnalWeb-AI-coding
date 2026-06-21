import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function AuthButtons() {
  const session = await auth();

  if (!session?.githubUsername) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          Sign in with GitHub
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{session.githubUsername}</span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit" variant="outline" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}
