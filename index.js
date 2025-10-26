import { fetchJSON, renderProjects } from "./global.js";

async function showLatestProjects() {
  const allProjects = await fetchJSON("./lib/projects.json");
  const latestProjects = allProjects.slice(0, 3);

  const container = document.querySelector(".projects");
  renderProjects(latestProjects, container, "h2");
}

showLatestProjects();

import { fetchGitHubData } from "./global.js";

async function init() {
  const username = "nitinnel123"; 
  const githubData = await fetchGitHubData(username);

  console.log("Fetched GitHub Data:", githubData);

  const profileStats = document.querySelector("#profile-stats");
  if (profileStats) {
    profileStats.innerHTML = `
      <h2>GitHub Profile Stats</h2>
      <dl class="stats-grid">
        <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
        <dt>Followers:</dt><dd>${githubData.followers}</dd>
        <dt>Following:</dt><dd>${githubData.following}</dd>
      </dl>
    `;
  }
}

init();