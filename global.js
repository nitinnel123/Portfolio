console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

/*
const navLinks = $$("nav a");

const currentLink = navLinks.find(
  (a) =>
    a.host === location.host &&
    (location.pathname === a.pathname ||
     location.pathname === a.pathname + "index.html" ||
     location.pathname.startsWith(a.pathname))
);

currentLink?.classList.add("current");
*/

const pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "cv/", title: "CV" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/nitinnel123", title: "GitHub" }
];

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"                               
    : "/Portfolio/";                    


const nav = document.createElement("nav");
document.body.prepend(nav);


for (const p of pages) {
  
  const url = p.url.startsWith("http") ? p.url : BASE_PATH + p.url;

  const a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  a.classList.toggle(
  "current",
  a.host === location.host &&
    (location.pathname === a.pathname ||
     location.pathname === a.pathname + "index.html")
);

  if (a.host !== location.host) a.target = "_blank";

  nav.append(a);
}

console.log("Current page path:", location.pathname);
$$("nav a").forEach((a) => {
  console.log("Link:", a.textContent, "→", a.pathname);
});