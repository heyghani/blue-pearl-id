declare global {
  interface Window {
    fbq?: (
      command: "init" | "track",
      eventName: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
    _fbq?: Window["fbq"];
  }
}

export {};
