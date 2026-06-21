import { db } from "@/db";
import { trustedUsers } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTrustedUser, removeTrustedUser } from "./actions";

export default async function TrustedUsersPage() {
  const users = await db
    .select()
    .from(trustedUsers)
    .orderBy(trustedUsers.addedAt);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Trusted Users</h1>
      <p className="text-muted-foreground text-sm">
        GitHub accounts on this list can sign in and view your{" "}
        <code>private</code> articles, in addition to anything <code>public</code>.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Add a trusted user</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addTrustedUser} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor="githubUsername">GitHub username</Label>
              <Input
                id="githubUsername"
                name="githubUsername"
                placeholder="octocat"
                required
              />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current allow-list</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">No trusted users yet.</p>
          ) : (
            <ul className="divide-y">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between py-2"
                >
                  <span>{user.githubUsername}</span>
                  <form action={removeTrustedUser.bind(null, user.githubUsername)}>
                    <Button type="submit" variant="outline" size="sm">
                      Remove
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
