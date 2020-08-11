const search = require("../javascripts/software-search");

let index;

beforeAll(async () => {
  const software = await search.getSoftware();
  index = search.buildIndex(software);
});

test("returns five results", () => {
  expect(index.search("github").length).toBe(5);
});
