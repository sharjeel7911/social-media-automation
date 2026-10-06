// ============================================================================
// WHAT IS THIS FILE?
// The screen where you connect (or disconnect) a LinkedIn account. Right
// now, clicking "Connect" talks to the TEMPORARY mock backend
// (electron/ipc/linkedin.ipc.ts) which fakes a successful login after a
// short delay — once Person 3 builds the real OAuth flow
// (modules/linkedin/auth/oauth.ts), this exact same screen will show a
// real LinkedIn account with zero changes needed here.
// ============================================================================

import { useEffect } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import { LinkedInMark } from "./LinkedInMark";

export function LinkedInConnect() {
  const { account, accountLoading, connecting, loadAccount, connect, disconnect } = usePostsStore();

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  return (
    <div className="connect-card">
      {accountLoading ? (
        <div className="loading-row">
          <Loader2 size={16} className="spin" /> Checking connection…
        </div>
      ) : account ? (
        // A LinkedIn account is connected — show who, plus a Disconnect button.
        <>
          <div className="connect-card__account">
            <div className="li-preview__avatar li-preview__avatar--lg">
              {account.profile_picture_url ? (
                <img src={account.profile_picture_url} alt="" />
              ) : (
                <span>{account.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="connect-card__name">{account.name}</p>
              <p className="muted-text">{account.headline ?? "LinkedIn account connected"}</p>
              <p className="muted-text">Connected {new Date(account.connected_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button className="secondary-button" onClick={disconnect}>
            <LogOut size={14} /> Disconnect
          </button>
        </>
      ) : (
        // Nothing connected yet — show the Connect button.
        <>
          <LinkedInMark size={40} />
          <p className="connect-card__title">No LinkedIn account connected</p>
          <p className="muted-text connect-card__subtitle">
            Connect your LinkedIn account to schedule and publish posts directly from the calendar.
          </p>
          <button className="primary-button" onClick={connect} disabled={connecting}>
            {connecting ? <Loader2 size={14} className="spin" /> : <LinkedInMark size={14} />}
            {connecting ? "Connecting…" : "Connect LinkedIn"}
          </button>
        </>
      )}
    </div>
  );
}
