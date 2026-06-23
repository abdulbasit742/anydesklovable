import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentTeam } from "@/hooks/use-current-team";
import {
  SecurityScoreCard, MfaStatusCard, MfaEnrollmentWizard, RecoveryCodesPanel, DisableMfaDialog,
  TrustedDevicesTable, ActiveSessionsPanel, SecurityEventsTimeline, TeamSecurityPostureCard,
  useSecurityOverview,
} from "@/components/app/security/SecurityCenter";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security — RemoteDesk" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  const overviewQ = useSecurityOverview();
  const overview = overviewQ.data ?? null;
  const team = useCurrentTeam();
  const teamId = (team.data as { team_id?: string } | null | undefined)?.team_id ?? null;
  const teamRole = (team.data as { role?: string } | null | undefined)?.role ?? null;
  const isAdmin = teamRole === "owner" || teamRole === "admin";

  const [enrollOpen, setEnrollOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);

  return (
    <AppShell title="Security">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mfa">Two-factor</TabsTrigger>
          <TabsTrigger value="devices">Trusted devices</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          {isAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <SecurityScoreCard overview={overview} />
            <MfaStatusCard
              overview={overview}
              onEnable={() => setEnrollOpen(true)}
              onDisable={() => setDisableOpen(true)}
              onGenerateCodes={() => { /* handled in MFA tab */ }}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Trusted devices</CardTitle>
                <CardDescription>{overview?.trusted_devices_count ?? 0} active</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Manage on the Trusted devices tab.</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Active sessions</CardTitle>
                <CardDescription>{overview?.active_sessions_count ?? 0} signed in</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Manage on the Sessions tab.</CardContent>
            </Card>
          </div>
          <SecurityEventsTimeline />
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <MfaStatusCard
            overview={overview}
            onEnable={() => setEnrollOpen(true)}
            onDisable={() => setDisableOpen(true)}
            onGenerateCodes={() => { /* inline panel below */ }}
          />
          <RecoveryCodesPanel overview={overview} />
        </TabsContent>

        <TabsContent value="devices">
          <TrustedDevicesTable />
        </TabsContent>

        <TabsContent value="sessions">
          <ActiveSessionsPanel />
        </TabsContent>

        <TabsContent value="events">
          <SecurityEventsTimeline />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="team">
            <TeamSecurityPostureCard teamId={teamId} />
          </TabsContent>
        )}
      </Tabs>

      <MfaEnrollmentWizard open={enrollOpen} onOpenChange={setEnrollOpen} />
      <DisableMfaDialog open={disableOpen} onOpenChange={setDisableOpen} />
    </AppShell>
  );
}
