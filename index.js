import { fetchJSON, renderProjects } from "./global.js";

async function showLatestProjects() {
  const allProjects = await fetchJSON("./lib/projects.json");
  const latestProjects = allProjects.slice(0, 3);

  const container = document.querySelector(".projects");
  renderProjects(latestProjects, container, "h2");
}

showLatestProjects();
