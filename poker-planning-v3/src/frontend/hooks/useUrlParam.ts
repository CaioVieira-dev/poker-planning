import { useEffect, useState } from "react";

export function useUrlParam(paramName: string, defaultValue: string = "") {
  const [value, setValue] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || defaultValue;
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get(paramName) || defaultValue;
    setValue(paramValue);
  }, [paramName, defaultValue]);

  return value;
}
