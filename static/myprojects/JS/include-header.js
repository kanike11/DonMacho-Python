
(async function () {
  const mount = document.getElementById("siteHeader");
  if (!mount) return;

  const res = await fetch("{% static 'myprojects/components/header.html' %}", {
    cache: "no-cache",
  });

  mount.innerHTML = await res.text();

  // Make sure header stays above the page
  mount.style.position = "relative";
  mount.style.zIndex = "30";
})();

