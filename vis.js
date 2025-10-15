const myColors = [
  "#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd",
  "#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf",
  "#393b79","#637939","#8c6d31","#843c39","#7b4173",
  "#3182bd","#e6550d","#31a354","#756bb1","#636363"
];

const genreColors = {
  Action: "#1f77b4",
  Sports: "#ff7f0e",
  "Role-Playing": "#2ca02c",
  Shooter: "#d62728",
  Racing: "#9467bd",
  Platform: "#8c564b",
  Puzzle: "#e377c2",
  Simulation: "#7f7f7f",
  Fighting: "#bcbd22",
  Adventure: "#17becf",
  Misc: "#393b79",
  Strategy: "#637939"
};

const genreDomain = Object.keys(genreColors);
const genreRange = Object.values(genreColors);


// Load data from datasets/videogames_wide.csv using d3.csv and then make visualizations
async function fetchData() {
  const data = await d3.csv("./dataset/videogames_wide.csv");
  return data;
}

fetchData().then(async (data) => {
  const vlSpec = vl
    .markBar()
    .data(data)
    .encode(
      vl.y().fieldN("Platform").sort("-x"),
      vl.x().fieldQ("Global_Sales").aggregate("sum")
    )
    .width("container")
    .height(400)
    .toSpec();

  const vlSpec2 = vl
    .markBar()
    .data(data)
    .encode(
      vl.y().fieldN("Genre").sort("-x"),
      vl.x().fieldQ("Global_Sales").aggregate("sum"),
      vl.color().value("teal")
    )
    .width("container")
    .height(400)
    .toSpec();
  
  const vlSpec3 = vl
    .markBar()
    .data(data)
    // per-platform, per-genre totals
    .transform(
      vl.joinaggregate({
        op: "sum",
        field: "Global_Sales",
        as: "platformGenreTotal"
      }).groupby(["Platform","Genre"])
    )
    .encode(
      vl.y().fieldN("Platform").sort("-x"),
      vl.x().fieldQ("Global_Sales").aggregate("sum"),
  
      // legend order (global); optional
      vl.color()
        .fieldN("Genre")
        .scale({ domain: genreDomain, range: genreRange }),
      // key: order segments within each bar by that platform’s genre total
      vl.order().field("platformGenreTotal").sort("descending")
    )
    .width("container")
    .height(400)
    .toSpec();

  const vlSpec3Small = vl
    .markBar()
    .data(data)
    .transform(
      vl.filter({
        field: "Platform",
        oneOf: ["SCD", "NG", "WS", "TG16", "3DO", "GG", "PCFX"]
      }),
      vl.joinaggregate({
        op: "sum",
        field: "Global_Sales",
        as: "platformGenreTotal"
      }).groupby(["Platform", "Genre"])
    )
    .encode(
      vl.y().fieldN("Platform").sort("-x"),
      vl.x().fieldQ("Global_Sales").aggregate("sum"),
      vl.color()
        .fieldN("Genre")
        .scale({ domain: genreDomain, range: genreRange }),
      vl.order().field("platformGenreTotal").sort("descending")
    )
    .width("container")
    .height(200)
    .toSpec();
  
// Visualization 2: Stacked areas over time by Manufacturer (rows) and Genre (colors)
const vlSpec4Platform = vl
  .markArea({ opacity: 0.7 })
  .data(data)
  .transform(
    vl.filter({
      not: { field: "Platform", oneOf: ["SCD", "NG", "WS", "TG16", "3DO", "GG", "PCFX"] }
    })
  )
  .encode(
    // Year on X axis
    vl.x().fieldQ("Year").title("Year"), // use fieldT("Year") if it's a date
    // Global Sales on Y axis
    vl.y().fieldQ("Global_Sales").aggregate("sum").title("Global Sales"),
    // Color by Genre
    vl.color()
      .fieldN("Genre")
      .scale({ domain: genreDomain, range: genreRange }),
    // One area per Platform (separate stack per console)
    vl.facet().fieldN("Platform").columns(1)
  )
  .width("container")
  .height(300)
  .toSpec();

const vlSpec4PlatformSmall = vl
  .markArea({ opacity: 0.7 })
  .data(data)
  .transform(
    vl.filter({
      field: "Platform",
      oneOf: ["SCD", "NG", "WS", "TG16", "3DO", "GG", "PCFX"]
    }),
  )
  .encode(
    // Year on X axis
    vl.x().fieldQ("Year").title("Year"), // use fieldT("Year") if it's a date
    // Global Sales on Y axis
    vl.y().fieldQ("Global_Sales").aggregate("sum").title("Global Sales"),
    // Color by Genre
    vl.color()
      .fieldN("Genre")
      .scale({ domain: genreDomain, range: genreRange }),
    // One area per Platform (separate stack per console)
    vl.facet().fieldN("Platform").columns(1)
  )
  .width("container")
  .height(300)
  .toSpec();


  
  render("#view", vlSpec);  
  render("#view2", vlSpec2);
  render("#view3", vlSpec3);
  render("#view4", vlSpec3Small);
  render('#view5', vlSpec4Platform);
  render('#view6', vlSpec4PlatformSmall);
});

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}
