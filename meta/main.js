import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


async function loadData() {
  const data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    language: row.language || "Unknown",
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

  return { averageFileLength, deepestFile, longestLine, busiestPeriod };
}

const stats = computeStats(data);

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

renderQuantitativeStats(stats);


function renderScatterplot(data) {
  const svg = d3.select("#scatterplot");
  const width = 1000;
  const height = 600;
  svg.attr("width", width).attr("height", height);
  const margin = { top: 30, right: 30, bottom: 40, left: 50 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  data.forEach((d) => {
    d.dateObj = new Date(d.datetime);
    d.day = days[d.dateObj.getDay()];
    d.hour = d.dateObj.getHours() + d.dateObj.getMinutes() / 60;
  });

  const xScale = d3.scaleBand().domain(days).range([0, innerWidth]).padding(0.1);
  const yScale = d3.scaleLinear().domain([0, 24]).range([innerHeight, 0]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}:00`);

  g.append("g").attr("transform", `translate(0,${innerHeight})`).call(xAxis);

  const yGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat("");
  g.append("g")
    .attr("class", "grid")
    .call(yGrid)
    .selectAll("line")
    .attr("stroke", "#ccc")
    .attr("stroke-opacity", 0.5);

  g.append("g").call(yAxis);

  const [minLines, maxLines] = d3.extent(data, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const sortedCommits = d3.sort(data, (d) => -d.totalLines);

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById("commit-tooltip");
    tooltip.hidden = !isVisible;
  }

  g.selectAll("circle")
    .data(sortedCommits)
    .join("circle")
    .attr("cx", (d) => xScale(d.day) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d.hour))
    .attr("r", (d) => rScale(d.totalLines))
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.7)
    .on("mouseenter", (event, commit) => {
      d3.select(event.currentTarget).style("fill-opacity", 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mousemove", (event) => updateTooltipPosition(event))
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget).style("fill-opacity", 0.7);
      updateTooltipVisibility(false);
    });

  g.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Commit Time by Day of Week");


  function createBrushSelector(svg) {
    const brush = d3.brush().on("start brush end", brushed);
    svg.call(brush);

    svg.selectAll(".overlay").lower();
    svg.selectAll("circle").raise();

    function brushed(event) {
      const selection = event.selection;

      if (!selection) {
        g.selectAll("circle").attr("stroke", null).style("opacity", 0.7);
        d3.select("#selected-summary").html("");
        return;
      }

      const [[x0, y0], [x1, y1]] = selection;
      const selected = [];

      g.selectAll("circle")
        .attr("stroke", (d) => {
          const cx = xScale(d.day) + xScale.bandwidth() / 2;
          const cy = yScale(d.hour);
          const inside = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
          if (inside) selected.push(d);
          return inside ? "black" : null;
        })
        .style("opacity", (d) => {
          const cx = xScale(d.day) + xScale.bandwidth() / 2;
          const cy = yScale(d.hour);
          return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? 1 : 0.3;
        });


      const summaryDiv = d3.select("#selected-summary").html("");
      summaryDiv.append("p").text(`${selected.length} commits selected`);

     
      if (selected.length > 0) {
        const allLines = selected.flatMap((c) => c.lines);
        const languageCounts = d3.rollups(
          allLines,
          (v) => v.length,
          (d) => d.language
        );
        const total = d3.sum(languageCounts, (d) => d[1]);
        const languagePercentages = languageCounts.map(([lang, count]) => ({
          lang,
          pct: ((count / total) * 100).toFixed(1),
        }));

        summaryDiv.append("h4").text("Language Breakdown");
        const ul = summaryDiv.append("ul");
        languagePercentages.forEach((d) => {
          ul.append("li").text(`${d.lang}: ${d.pct}%`);
        });
      }
    }
  }

  createBrushSelector(svg);
}

renderScatterplot(commits);

function renderTooltipContent(commit) {
  const link = document.getElementById("commit-link");
  const date = document.getElementById("commit-date");
  const author = document.getElementById("commit-author");
  const lines = document.getElementById("commit-lines");

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime.toLocaleString("en", {
    dateStyle: "full",
    timeStyle: "short",
  });
  author.textContent = commit.author || "Unknown";
  lines.textContent = commit.lines?.length || 0;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById("commit-tooltip");
  const offsetX = 15;
  const offsetY = 15;
  tooltip.style.left = `${event.pageX + offsetX}px`;
  tooltip.style.top = `${event.pageY - offsetY}px`;
}
