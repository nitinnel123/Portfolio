import { fetchJSON, renderProjects } from "../global.js";

async function initProjects() {

  const projects = await fetchJSON("../lib/projects.json");
  const container = document.querySelector(".projects");
  renderProjects(projects, container, "h2");


  const title = document.querySelector(".projects-title");
  if (title) {
    title.textContent = `Projects (${projects.length})`;
  }


  try {
    const username = "nitinnel123";
    const url = `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`;

    const githubRepos = await fetchJSON(url);
    console.log("Fetched GitHub Repos:", githubRepos);

    const githubProjects = githubRepos.map((repo) => ({
      title: repo.name,
      image: "../images/github.svg",
      description: repo.description || "No description available.",
      url: repo.html_url,
    }));


    githubProjects.forEach((proj) => {
      const article = document.createElement("article");
      article.innerHTML = `
        <h2>${proj.title}</h2>
        <img src="${proj.image}" alt="${proj.title}">
        <p>${proj.description}</p>
        <p><a href="${proj.url}" target="_blank">View on GitHub</a></p>
      `;
      container.appendChild(article);
    });
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
  }
}

initProjects();
