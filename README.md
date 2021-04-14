# A4: Food for Thought Project Documentation

## Background 

Our team chose to focus on the environmental impact of food based on our common interests in social impact and topics that affect people around the world. Thus, every decision in our design process was guided by a desire to leave an impact and strong impression on the average user audience of our tool without being overwhelming or overly complex. 

In our research, we came across a paper that seemed to be cited repeatedly in the [articles](https://ourworldindata.org/environmental-impacts-of-food) we read: [Reducing food’s environmental impacts through producers and consumers](https://science.sciencemag.org/content/360/6392/987) (Poore and Nemecek, 2018). This paper includes a broad overview of the global impacts of food production, comparing various types of production systems for more than 40 agricultural commodities from around the world. The dataset from the paper measures impact through five environmental indicators: greenhouse gas (GHG) emissions, land use, freshwater withdrawal, eutrophication potential, and acidification potential. While we often only consider emissions in our analysis of environmental impact, this dataset is unique in that it includes a more comprehensive account of factors that can cause environmental trade-offs and can't be captured through only emissions data. 

## Design Decisions

We first decided to create a set of interactive visualizations with the animation technique of "scrollytelling," as we analyzed in some of the lecture examples. We felt this medium would best incorporate a strong narrative into our visualization, allowing each graph to tell a story that builds on the previous one. Especially for users without much background on the topic, we thought this format would be more digestible and conducive to a linear story. The small text sections on the right are directed at the user and written in a casual, personalized tone that is engaging and simple to understand. We also added icons of GHG emissions, water use, and land use to bring a visual image of what the user is looking at and improve the overall user experience and design of our webpage. The title page was another addition that we felt would make our UI cleaner and also give the user some directions on how to navigate our visualization before being faced with a graph that may be initially confusing. 

For the first graph, we wanted to use a format that gave a broad overview of how food production has a significant environmental impact. In our research, one of the facts that stood out to us was that **food contributes to nearly a third of global GHG emissions.** To illustrate this to our users, we thought it would be best to use a treemap format. The treemap first shows both food and non-food as the main categories, but we wanted to keep the subcategories underneath food and non-food still visible (grayed out) as to draw the reader in to the many complex processes that go into the main categories, which we usually don't notice or think about. We wanted the color scheme we used to be consistent across visualizations and have muted, colorful earth tones to be memorable and also subtly relate back to the theme of our site. We intentionally made the top bar the bar to click back to a previous category because we wanted the user to notice where they were in the hierarchy of categories as their eyes traveled back to the top bar. As suggested in our peer feedback, we ensured that the color themes of each category were similar to relay the categorical data to the user visually. In addition, we made sure that the animation used for zooming in and out quickly expanded a different category wider than the size of the graph to give the user a feeling for the scale of where they are in the categories and make them aware of the context of their zooming. 

For our second graph, we wanted to highlight the freshwater withdrawal from the production of different foods because water isn't something we often think about when considering environmental impact. We also wanted to follow a story-telling path that went from a broad overview--the first graph giving a general breakdown of GHG emissions--to more specific--the next graphs go into depth on specific food commodities. One consistency we wanted to keep across our animations was the feeling of context: a smooth animation of zooming in and out to hone in on details while keeping the user aware of the big picture. This graph incorporates zooming through a selection of food through the dropdown menu. This filtering feature then highlights the food of interest, using a similar color scheme of blue and orange as the previous visualization, and zooms in to its nearest ranked neighbors in terms of the food's water use. This design choice was both logistically rational (displaying all 40 food commodities on the same graph would be overwhelming to the user), maintained consistency from the previous visualization, and paired well with the overall smooth scrolling animations of our webpage. We standardized all the data to ensure that all foods were in units per 1000 kilocalories (kcal), allowing the user to fairly compare water use between foods in a way that is more understandable to them. 1000 kilocalories is about how much an average person would eat in one heavy meal. Thus, if prawns use 3413 liters of water per 1000 kcal, that's using about 11 bathtubs of water for one "meal" of prawn. We included this context in the visualization to give the user an understanding of what the numbers meant. We also highlighted the amount of L/kcal for the selected food with a large visual label on the graph to make the number immediately stand out to the user. In terms of other features, we implemented zooming and searching based on our peer feedback to make it easier for users to navigate the bar chart and select foods of interest. 

For the third graph, we wanted to bring the focus to land use, another often overlooked environmental indicator that causes significant degradation to ecological habitats and biodiversity worldwide. This graph follows the more specific theme of the previous one, honing in on even fewer of the most popular food commodities. It shows the distribution of the land use of specific farms in the dataset. This is a relatively simple univariate analysis of the data, but it tells an important story and shows the user that even if some farms are doing a good job at decreasing land use, for foods like beef, the distribution has a much higher range than plant-based proteins generally do. In fact, some farms even report negative land use--this is not an error, but actually a result of farms offsetting their land use or using processes that actually reuse or rotate the land used, causing a net negative total for land use. When specific foods are selected, the graph uses a dynamic scaling algorithm to zoom in on only the selected foods' graphs and remove the other distributions, giving users an ability to see the details of each distribution but also see the big picture visualization when desired. We also used a KDE smoothing algorithm to transform the data and make areas with less data more visible given the smaller scale of the visualization. While this might not give users the best view of each individual data point in each distribution, it allows for a more cohesive big picture view for the purpose of this visualization, which is intended for simple user data exploration and storytelling. Like the last graph, we kept the filtering buttons on the left sidebar below the text to stay consistent and declutter the graph. Based on peer feedback, we increased the number of commodities included and added some more explanation of what the graph is showing in terms of the distribution. We also changed the filtering feature to include a text pop-up based on the selected foods; this gives users more context on how to interpret the graphs and what each distribution means.  

We didn't include uncertainties on any of the graphs because of the reasons cited in the [paper](https://ieeexplore.ieee.org/document/8805422) we read in class. However, for a visualization aimed at a different audience or for a more analytical purpose, visualizing uncertainty would definitely be important in order to avoid misleading any viewers. 

## Development Process

We kept a [detailed document](https://docs.google.com/document/d/1ion0fPCR9kv_oxrwtSAnY4OMmPUoXg2SYjhlvtjqQC0/edit?usp=sharing) of our task allocation, meeting minutes, and project management throughout the process to stay organized and keep track of where we were based on the upcoming deadlines. Since we had three smaller visualizations within our project, we split it up so we could each focus on one. A general breakdown of our tasks is outlined in the table below. 

| Task                               | Point Person(s)  | # People | # Hours   | People-Hours |
| ---------------------------------- | ---------------- | -------- | --------- | ------------ |
| Brainstorming/Exploratory Analysis | All              | 3        | 4         | 12           |
| Treemap                            | Anushree         | 2        | 10        | 20           |
| Bar Graph                          | Yuebin           | 1        | 10        | 10           |
| Area Plot                          | Raunak           | 1        | 10        | 10           |
| Scrolling                          | Raunak           | 1        | 5         | 5            |
| Narrative Text                     | All              | 3        | 2         | 6            |
| Prototype Presentation             | Anushree, Yuebin | 2        | 3         | 6            |
| Project Management                 | Anushree         | 1        | 2         | 2            |
| README.md                          | Anushree         | 1        | 3         | 3            |
| Team Meetings                      | All              | 3        | 7         | 21           |
| Polish                             | All              | 3        | 10        | 30           |
| -                                  | -                | -        | **Total** | **125**      |

Generating each graph, polishing after receiving peer feedback, and our team meetings probably took the longest amount of time, as seen in the table. **Overall, we split up tasks evenly, and we all contributed equally to the final product, working 125 people-hours total or about 42 hours per person.** We communicated through a shared Slack chat. It was great to work with each other and we were able to put together a visualization we're all really excited about. We hope you enjoy it too!

## Sources

#### Main Dataset

[Reducing food’s environmental impacts through producers and consumers](https://science.sciencemag.org/content/360/6392/987#)

#### Other Minor Data Sources

[Protein Content of Common Foods](https://www.hopkinsmedicine.org/bariatrics/_documents/nutrition_protein_content_common_foods.pdf)

[Sources of GHG Emissions](https://www.epa.gov/ghgemissions/global-greenhouse-gas-emissions-data) (IPCC 2014 Report and EPA)

#### Visualization Inspiration

[Our World in Data](https://ourworldindata.org/environmental-impacts-of-food)

#### Starter Code

[KDE Density Plot Starter Code](https://www.d3-graph-gallery.com/graph/density_basic.html)

[Scroller Starter Code](https://github.com/cuthchow/college-majors-visualisation)

[Zoomable Treemap Starter Code](https://observablehq.com/@d3/zoomable-treemap)

[Bar Graph Starter Code (From Lecture)](https://observablehq.com/d/4c93c3a516d35624)

