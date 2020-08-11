// if running in Node
if (typeof require === "function") {
  Papa = require("./papaparse.min");
  Fuse = require("./fuse");
}

const getSoftware = async () => {
  const source =
    "https://raw.githubusercontent.com/GSA/data/master/enterprise-architecture/it-standards.csv";
  const response = await fetch(source);
  const csv = await response.text();
  const results = Papa.parse(csv, { header: true });
  return results.data;
};

const buildIndex = (software) => {
  return new Fuse(software, {
    // isCaseSensitive: false,
    includeScore: true,
    // shouldSort: true,
    // reverse
    sortFn: (a, b) => b.score - a.score,
    // includeMatches: false,
    findAllMatches: true,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    ignoreLocation: true,
    // ignoreFieldNorm: false,
    keys: [{ name: "Standard Name", weight: 2 }, "Description"],
  });
};

const toClassStr = (str) => str.replace(/[^\w]+/, "-").toLowerCase();

const addNameCell = (row, entry) => {
  const th = document.createElement("th");
  th.setAttribute("scope", "row");
  const text = document.createTextNode(entry["Standard Name"]);
  th.appendChild(text);
  row.appendChild(th);
};

const addCell = (row, entry, field) => {
  const cell = row.insertCell();
  const text = document.createTextNode(entry[field]);
  cell.appendChild(text);
};

const addRow = (tBody, entry) => {
  const row = tBody.insertRow();

  const status = toClassStr(entry["Status"]);
  row.classList.add(`status-${status}`);

  addNameCell(row, entry);

  const fields = [
    "Description",
    "Category",
    "Status",
    "Deployment Type",
    "Approval Expiration Date",
  ];
  fields.forEach((field) => addCell(row, entry, field));
};

const displayResults = (software) => {
  const table = document.getElementById("software-search-results");
  const tBody = table.tBodies[0];

  // remove existing results
  tBody.innerHTML = "";

  software.forEach((entry) => addRow(tBody, entry));

  // only show table if there are results
  table.style.display = software.length == 0 ? "none" : null;
};

const doSearch = (query, index) => {
  const nResults = 5;
  const searchResults = index.search(query).slice(-1 * nResults);

  // retrieve the matching software entries
  const softwareResults = searchResults.map((result) => result.item);
  displayResults(softwareResults);
};

const init = async () => {
  const input = document.querySelector('#software-search input[name="search"]');
  if (location.hash) {
    // use the search value from the URL
    const hash = location.hash.replace(/^#/, "");
    input.value = decodeURIComponent(hash);
  }

  const software = await getSoftware();
  const index = buildIndex(software);

  input.addEventListener("input", async (event) => {
    const query = event.target.value;
    doSearch(query, index);
    window.location = `#${encodeURIComponent(query)}`;
  });

  doSearch(input.value, index);
};

if (typeof module === "object") {
  // export functions for testing
  module.exports = {
    getSoftware,
    buildIndex,
  };
} else {
  init();
}
