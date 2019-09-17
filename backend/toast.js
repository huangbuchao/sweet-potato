export function installToast(target) {
  if (typeof document === "undefined") return;
  let toastEl = null;
  let toastTimer = 0;

  const colors = {
    normal: "#3BA776",
    warn: "#DB6B00",
    error: "#DB2600"
  };

  target.__POTATO_DEVTOOLS_TOAST__ = (message, type) => {
    const color = colors[type] || colors.normal;
    console.log(
      `%c potato-devtools %c ${message} %c `,
      "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
      `background: ${color}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
      "background:transparent"
    );
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.addEventListener("click", removeToast);

      const potatoDevtoolsToast = document.createElement("div");
      potatoDevtoolsToast.id = "potato-devtools-toast";
      potatoDevtoolsToast.style.position = "fixed";
      potatoDevtoolsToast.style.bottom = "6px";
      potatoDevtoolsToast.style.left = "0";
      potatoDevtoolsToast.style.right = "0";
      potatoDevtoolsToast.style.height = "0";
      potatoDevtoolsToast.style.display = "flex";
      potatoDevtoolsToast.style.alignItems = "flex-end";
      potatoDevtoolsToast.style.justifyContent = "center";
      potatoDevtoolsToast.style.zIndex = "999999999999999999999";
      potatoDevtoolsToast.style.fontFamily = "Menlo, Consolas, monospace";
      potatoDevtoolsToast.style.fontSize = "14px";

      const potatoWrapper = document.createElement("div");
      potatoWrapper.className = "potato-wrapper";
      potatoWrapper.style.padding = "6px 12px";
      potatoWrapper.style.background = color;
      potatoWrapper.style.color = "white";
      potatoWrapper.style.borderRadius = "3px";
      potatoWrapper.style.flex = "auto 0 1";
      potatoWrapper.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.2)";
      potatoWrapper.style.cursor = "pointer";

      const potatoContent = document.createElement("div");
      potatoContent.className = "potato-content";

      potatoWrapper.appendChild(potatoContent);
      potatoDevtoolsToast.appendChild(potatoWrapper);
      toastEl.appendChild(potatoDevtoolsToast);
      document.body.appendChild(toastEl);
    } else {
      toastEl.querySelector(".potato-wrapper").style.background = color;
    }

    toastEl.querySelector(".potato-content").innerText = message;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(removeToast, 5000);
  };

  function removeToast() {
    clearTimeout(toastTimer);
    if (toastEl) {
      document.body.removeChild(toastEl);
      toastEl = null;
    }
  }
}
