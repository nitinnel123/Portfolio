console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

const currentLink = navLinks.find(
  (a) =>
    a.host === location.host &&
    (location.pathname === a.pathname ||
     location.pathname === a.pathname + "index.html" ||
     location.pathname.startsWith(a.pathname))
);

currentLink?.classList.add("current");