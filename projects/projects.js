import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, renderProjects } from "../global.js";

async function initProjects() {
  const container = document.querySelector(".projects");


  const projects = await fetchJSON("../lib/projects.json");
  renderProjects(projects, container, "h2");

  const title = document.querySelector(".projects-title");
  if (title) title.textContent = `Projects (${projects.length})`;

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
      year: "2025" 
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

    projects.push(...githubProjects);
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
  }
  const rolledData = d3.rollups(projects, v => v.length, d => d.year || "Unknown");
  const data = rolledData.map(([year, count]) => ({ label: year, value: count }));

  const radius = 100;

const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)
  .padAngle(0)    
  .cornerRadius(0);  

const pie = d3.pie()
  .value(d => d.value)
  .sort(null);         

const colors = d3.scaleOrdinal(d3.schemeTableau10);
const arcs = pie(data);

const svg = d3.select("#projects-pie-plot")
  .attr("width", 250)
  .attr("height", 250)
  .attr("viewBox", [-radius , -radius, radius * 2 , radius * 2 ])
  .attr("preserveAspectRatio", "xMidYMid meet");

svg.selectAll("*").remove();
svg.selectAll("path")
  .data(arcs)
  .join("path")
  .attr("d", arcGenerator)
  .attr("fill", (_, i) => colors(i))
  .attr("stroke", "white")
  .attr("stroke-width", 1.5)
  .attr("stroke-linejoin", "round")
  .on("click", function(event, d) {
    svg.selectAll("path").classed("selected", false);
    d3.select(this).classed("selected", true);
    d3.selectAll(".legend li").classed("selected", item => item.label === d.data.label);
  });

  

  const legend = d3.select(".legend");
  legend.html("");
  data.forEach((d, i) => {
    legend.append("li").html(`
      <span style="background:${colors(i)};display:inline-block;width:1em;height:1em;border-radius:0.2em;margin-right:0.5em;"></span>
      ${d.label} (${d.value})
    `);
  });

  const searchInput = document.querySelector(".searchBar");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      const filtered = projects.filter(p =>
        Object.values(p).join(" ").toLowerCase().includes(query)
      );
      renderProjects(filtered, container, "h2");
    });
  }
}

initProjects();
