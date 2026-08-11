declare global {
  interface Window {
    fbq?: {
      (
        command: "init",
        pixelId: string,
        advancedMatching?: { em?: string; ph?: string },
      ): void;
      (
        command: "track",
        eventName: string,
        params?: Record<string, unknown>,
        options?: { eventID?: string },
      ): void;
    };
    _fbq?: Window["fbq"];
  }
}

export {};
