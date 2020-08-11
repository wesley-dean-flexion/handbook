const search = require("../javascripts/software-search");

test("matches a single result", () => {
  const index = search.buildIndex([
    {
      "Standard Name": "GitHub",
      Description: "foo bar",
    },
  ]);

  expect(index.search("github").length).toBe(1);
});
