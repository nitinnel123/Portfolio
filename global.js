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
  { url: "https://github.com/nitinnel123", title: "GitHub" },
];


const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/Portfolio/";

const nav = document.createElement("nav");
document.body.prepend(nav);

function normalize(path) {
  return path.replace(/index\.html$/, "").replace(/\/$/, "");
}


for (const p of pages) {
  const url = p.url.startsWith("http") ? p.url : BASE_PATH + p.url;
  const a = document.createElement("a");
  a.href = url;
  a.textContent = p.title;

  const currentPage = location.pathname.split("/").filter(Boolean).pop() || "";
  const linkPage = a.pathname.split("/").filter(Boolean).pop() || "";

  if (a.host === location.host && currentPage === linkPage) {
    a.classList.add("current");
  }

  if (a.host !== location.host) a.target = "_blank";

  nav.append(a);
}

console.log("Current page path:", location.pathname);
$$("nav a").forEach((a) => {
  console.log("Link:", a.textContent, "→", a.pathname);
});

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);


const schemeLabel = document.querySelector(".color-scheme");
schemeLabel.style.position = "absolute";
schemeLabel.style.top = "1rem";
schemeLabel.style.right = "1rem";
schemeLabel.style.fontSize = "0.8rem";
schemeLabel.style.fontFamily = "inherit";
schemeLabel.style.userSelect = "none";


const select = schemeLabel.querySelector("select");


function applyScheme(value) {
  document.documentElement.style.setProperty("color-scheme", value);
}


if ("colorScheme" in localStorage) {
  const saved = localStorage.colorScheme;
  applyScheme(saved);
  select.value = saved;
}


select.addEventListener("input", (e) => {
  const value = e.target.value;
  applyScheme(value);
  localStorage.colorScheme = value; 
});

console.log("Color scheme applied:", getComputedStyle(document.documentElement).getPropertyValue("color-scheme"));

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
    return [];
  }
}

export function renderProjects(projects, containerElement, headingLevel = "h2") {
  if (!Array.isArray(projects) || !containerElement) return;

  containerElement.innerHTML = "";

  projects.forEach((project) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
      ${project.year ? `<p class="project-year"><em>(${project.year})</em></p>` : ""}
      ${project.url ? `<p><a href="${project.url}" target="_blank">View Project</a></p>` : ""}
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}