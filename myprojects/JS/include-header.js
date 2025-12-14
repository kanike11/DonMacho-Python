(async function () {
  const mount = document.getElementById("siteHeader");
  if (!mount) return;

  const res = await fetch("/static/myprojects/components/header.html", {
    cache: "no-cache",
  });

  mount.innerHTML = await res.text();

  // ✅ ensure header does NOT block clicks
  mount.style.position = "relative";
  mount.style.zIndex = "10";
})();
