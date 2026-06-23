// MFA / Security Center service hooks.
// All recovery codes are hashed (SHA-256) in the browser before being sent to the server.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------- helpers ----------
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomCode(): string {
  // 10 chars, base32-ish, grouped 5-5
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  const raw = Array.from(arr, (b) => alphabet[b % alphabet.length]).join("");
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export function generatePlaintextRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, randomCode);
}

// ---------- types ----------
export type SecurityOverview = {
  mfa_enabled: boolean;
  totp_enrolled: boolean;
  recovery_codes_remaining: number;
  trusted_devices_count: number;
  active_sessions_count: number;
  last_security_event_at: string | null;
  last_mfa_verified_at: string | null;
  security_score: number;
};

export type TeamSecurityPosture = {
  total_members: number;
  members_with_mfa: number;
  members_without_mfa: number;
  stale_trusted_devices: number;
  recent_security_events: number;
  risky_sessions: number;
};

// ---------- queries ----------
export function useSecurityOverview() {
  return useQuery({
    queryKey: ["security-overview"],
    queryFn: async (): Promise<SecurityOverview | null> => {
      const { data, error } = await supabase.rpc("get_my_security_overview");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as SecurityOverview) ?? null;
    },
  });
}

export function useMfaFactors() {
  return useQuery({
    queryKey: ["mfa-factors"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data;
    },
  });
}

export function useTeamSecurityPosture(teamId: string | null | undefined) {
  return useQuery({
    queryKey: ["team-security-posture", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamSecurityPosture | null> => {
      const { data, error } = await supabase.rpc("get_team_security_posture", { p_team_id: teamId! });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as TeamSecurityPosture) ?? null;
    },
  });
}

// ---------- MFA enrollment ----------
export type EnrollResult = {
  factorId: string;
  qr: string; // svg/data url returned by supabase
  secret: string;
  uri: string;
};

export async function startMfaEnrollment(friendlyName = "RemoteDesk"): Promise<EnrollResult> {
  await supabase.rpc("record_mfa_enrollment_started").catch(() => {});
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName });
  if (error) throw error;
  return {
    factorId: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  };
}

export async function verifyMfaEnrollment(factorId: string, code: string): Promise<void> {
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error) throw challenge.error;
  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code,
  });
  if (verify.error) throw verify.error;
  const { error } = await supabase.rpc("enable_mfa_after_verification");
  if (error) throw error;
}

export async function cancelMfaEnrollment(factorId: string): Promise<void> {
  await supabase.auth.mfa.unenroll({ factorId }).catch(() => {});
}

export function useDisableMfa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reason }: { reason?: string }) => {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const all = [...(factors?.totp ?? [])];
      for (const f of all) {
        await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
      }
      const { error } = await supabase.rpc("disable_mfa", { p_reason: reason ?? null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Two-factor authentication disabled");
      qc.invalidateQueries({ queryKey: ["security-overview"] });
      qc.invalidateQueries({ queryKey: ["mfa-factors"] });
      qc.invalidateQueries({ queryKey: ["security-events"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- Recovery codes ----------
export function useGenerateRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<string[]> => {
      const codes = generatePlaintextRecoveryCodes(10);
      const hashes = await Promise.all(codes.map(sha256Hex));
      const { error } = await supabase.rpc("generate_recovery_codes", { p_code_hashes: hashes });
      if (error) throw error;
      return codes;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["security-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function verifyRecoveryCode(code: string): Promise<boolean> {
  const hash = await sha256Hex(code.trim().toUpperCase());
  const { data, error } = await supabase.rpc("verify_recovery_code", { p_code_hash: hash });
  if (error) throw error;
  return !!data;
}
