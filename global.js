console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

let currentPath = location.pathname;


const repoName = "Portfolio";
if (currentPath.startsWith(repoName)) {
  currentPath = currentPath.replace(repoName, "/");
}

if (currentPath.endsWith("index.html")) {
  currentPath = currentPath.replace("index.html", "");
}

const currentLink = navLinks.find((a) => {
  let linkPath = a.pathname;
  if (linkPath.endsWith("index.html")) {
    linkPath = linkPath.replace("index.html", "");
  }
  return a.host === location.host && linkPath === currentPath;
});

currentLink?.classList.add("current");

console.log("Current page path:", location.pathname);
$$("nav a").forEach((a) => {
  console.log("Link:", a.textContent, "→", a.pathname);
});