import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData() {
  const data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(`${row.date}T${row.time}${row.timezone || ""}`),
  }));
  return data;
}

const data = await loadData();
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;
      const ret = {
        id: commit,
        url: "https://github.com/nitinnel123/Portfolio/commit/" + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, "lines", { value: lines });
      return ret;
    });
}

const commits = processCommits(data);

console.log("Sample data:", data[0]);

function renderCommitInfo(data, commits) {
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);

  dl.append("dt").text("Total commits");
  dl.append("dd").text(commits.length);

  dl.append("dt").text("Number of files");
  dl.append("dd").text(d3.group(data, (d) => d.file).size);

  dl.append("dt").text("Average file depth");
  dl.append("dd").text(d3.mean(data, (d) => d.depth).toFixed(2));
}


renderCommitInfo(data, commits);

function computeStats(data) {
  
  const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (d) => d.line),  
    (d) => d.file
  );

  const averageFileLength = d3.mean(fileLengths, (d) => d[1]);

  
  const deepestFile = d3.greatest(data, (d) => d.depth);

  
  const longestLine = d3.greatest(data, (d) => d.length);

  
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length, 
    (d) => new Date(d.datetime).toLocaleString("en", { dayPeriod: "short" })
  );

  const busiestPeriod = d3.greatest(workByPeriod, (d) => d[1]);

  return {
    averageFileLength,
    deepestFile,
    longestLine,
    busiestPeriod,
  };
}

function renderQuantitativeStats(stats) {
  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  dl.append("dt").text("Average file length");
  dl.append("dd").text(stats.averageFileLength.toFixed(2));

  dl.append("dt").text("Deepest file");
  dl.append("dd").text(stats.deepestFile.file);

  dl.append("dt").text("Longest line (chars)");
  dl.append("dd").text(stats.longestLine.length);

  dl.append("dt").text("Busiest time of day");
  dl.append("dd").text(stats.busiestPeriod[0]);
}

const stats = computeStats(data);
renderQuantitativeStats(stats);

function renderScatterplot(data) {
  const svg = d3.select("#scatterplot");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 30, right: 30, bottom: 40, left: 50 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  data.forEach(d => {
    d.dateObj = new Date(d.datetime);
    d.day = days[d.dateObj.getDay()];
    d.hour = d.dateObj.getHours() + d.dateObj.getMinutes() / 60; 
  });


  const xScale = d3.scaleBand()
    .domain(days)
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `${d}:00`);

  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  const yGrid = d3.axisLeft(yScale)
  .tickSize(-innerWidth)   
  .tickFormat("");         

  g.append("g")
  .attr("class", "grid")
  .call(yGrid)
  .selectAll("line")
  .attr("stroke", "#ccc")
  .attr("stroke-opacity", 0.5);

  g.append("g").call(yAxis);


  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.day) + xScale.bandwidth() / 2)
    .attr("cy", d => yScale(d.hour))
    .attr("r", 4)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);


  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Commit Time by Day of Week");

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 35)
    .attr("text-anchor", "middle")
    .text("Day of Week");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -40)
    .attr("text-anchor", "middle")
    .text("Hour of Day");
}

renderScatterplot(data);