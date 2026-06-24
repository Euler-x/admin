"use client";

import { forwardRef } from "react";
import { Turnstile as ReactTurnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

/**
 * Thin wrapper around @marsidev/react-turnstile.
 * Reads the site key from NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY.
 * Forward the ref if you need to call .reset() on failed submission.
 */
const Turnstile = forwardRef<TurnstileInstance, TurnstileProps>(
  ({ onSuccess, onExpire, onError }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY ?? "";

    if (!siteKey) return null;

    return (
      <ReactTurnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{
          theme: "dark",
          size: "flexible",
        }}
      />
    );
  }
);

Turnstile.displayName = "Turnstile";

export default Turnstile;
export type { TurnstileInstance };
