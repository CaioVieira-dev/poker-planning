import { useMemo } from "react";
import { nanoid } from "nanoid";

export function useUserId() {
  return useMemo(() => {
    const STORAGE_KEY = "poker-user-id";
    let userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      userId = nanoid();
      localStorage.setItem(STORAGE_KEY, userId);
    }

    return userId;
  }, []);
}
