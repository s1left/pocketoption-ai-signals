import React from "react";
import { useGetAllUsers, useUpdateUserAccess } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";
import { ShieldAlert, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Admin() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { data: users, refetch } = useGetAllUsers({ query: { enabled: isAdmin } });
  const updateAccess = useUpdateUserAccess();

  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  const handleGrantAccess = (userId: string) => {
    updateAccess.mutate({
      userId,
      data: {
        hasAccess: true,
        status: "active",
        // Grant 30 days access
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
      }
    }, {
      onSuccess: () => refetch()
    });
  };

  const handleRevokeAccess = (userId: string) => {
    updateAccess.mutate({
      userId,
      data: {
        hasAccess: false,
        status: "blocked"
      }
    }, {
      onSuccess: () => refetch()
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <ShieldAlert className="text-primary w-8 h-8" />
        <h1 className="text-3xl font-orbitron font-bold tracking-widest text-foreground">
          ADMIN <span className="text-primary">OVERRIDE</span>
        </h1>
      </div>

      <div className="bg-card border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h2 className="font-orbitron font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            USER DIRECTORY
          </h2>
          <Badge variant="outline" className="font-mono bg-primary/10 text-primary border-primary/20">
            {users?.length || 0} TOTAL RECORDS
          </Badge>
        </div>

        <div className="grid grid-cols-6 p-4 border-b border-border text-xs font-mono tracking-widest text-muted-foreground">
          <div className="col-span-2">TELEGRAM ID / USERNAME</div>
          <div>STATUS</div>
          <div>ACCESS</div>
          <div>EXPIRES</div>
          <div className="text-right">ACTIONS</div>
        </div>
        
        <div className="divide-y divide-border">
          {users?.map((user) => (
            <div key={user.telegramId} className="grid grid-cols-6 p-4 items-center hover:bg-background/50 transition-colors">
              <div className="col-span-2 flex flex-col gap-1">
                <div className="font-mono font-bold text-foreground">{user.telegramId}</div>
                <div className="text-xs text-muted-foreground">{user.username}</div>
              </div>
              
              <div>
                <Badge variant="outline" className={`font-mono uppercase tracking-widest ${
                  user.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  user.status === "blocked" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }`}>
                  {user.status}
                </Badge>
              </div>

              <div>
                {user.hasAccess ? (
                  <span className="flex items-center gap-1 text-green-500 font-mono text-sm">
                    <CheckCircle className="w-4 h-4" /> GRANTED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-500 font-mono text-sm">
                    <XCircle className="w-4 h-4" /> DENIED
                  </span>
                )}
              </div>

              <div className="text-sm font-mono text-muted-foreground flex items-center gap-1">
                {user.expiresAt ? (
                  <>
                    <Clock className="w-3 h-3" />
                    {new Date(user.expiresAt).toLocaleDateString()}
                  </>
                ) : "NEVER"}
              </div>
              
              <div className="text-right flex items-center justify-end gap-2">
                {!user.hasAccess || user.status !== "active" ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="font-orbitron text-xs tracking-wider border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => handleGrantAccess(user.telegramId)}
                    disabled={updateAccess.isPending}
                  >
                    GRANT
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="font-orbitron text-xs tracking-wider border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleRevokeAccess(user.telegramId)}
                    disabled={updateAccess.isPending}
                  >
                    REVOKE
                  </Button>
                )}
              </div>
            </div>
          ))}

          {(!users || users.length === 0) && (
            <div className="p-12 text-center text-muted-foreground font-mono">
              NO USERS FOUND IN DATABASE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
