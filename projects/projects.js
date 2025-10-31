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


import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from "../global.js";

async function initProjects() {
  const projects = await fetchJSON("../lib/projects.json");
  const container = document.querySelector(".projects");
  renderProjects(projects, container, "h2");

  const title = document.querySelector(".projects-title");
  if (title) title.textContent = `Projects (${projects.length})`;

  const rolledData = d3.rollups(projects, v => v.length, d => d.year);
  const data = rolledData.map(([year, count]) => ({ label: year, value: count }));

  const svg = d3.select("#projects-pie-plot");
  svg.selectAll("*").remove();

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const pie = d3.pie().value(d => d.value);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);
  const arcs = pie(data);

  svg.selectAll("path")
    .data(arcs)
    .join("path")
    .attr("d", arcGenerator)
    .attr("fill", (_, i) => colors(i));

  const legend = d3.select(".legend");
  legend.html("");
  data.forEach((d, i) => {
    legend.append("li").html(`
      <span style="background:${colors(i)};display:inline-block;width:1em;height:1em;border-radius:0.2em;margin-right:0.5em;"></span>
      ${d.label} (${d.value})
    `);
  });

  const searchInput = document.querySelector(".searchBar");
  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const filtered = projects.filter(p =>
      Object.values(p).join(" ").toLowerCase().includes(query)
    );
    renderProjects(filtered, container, "h2");
  });
}

initProjects();
