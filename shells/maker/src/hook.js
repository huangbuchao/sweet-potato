//@flow

import {installHook} from "agent/hook";
import { isFirefox } from "shared/env";

if(document instanceof HTMLDocument) {
  const source = ";(" + installHook.toString() + ")(window)";

  if(isFirefox) {
    window.eval(source);
  }else{
    const script = document.createElement("script");
    script.textContent = source;
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  }
}