import type { ComponentType } from "react";
import ComingSoon from "./pages/ComingSoon";

export function stub(path: string): ComponentType {
  return function StubPage() {
    return <ComingSoon path={path} />;
  };
}
