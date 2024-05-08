class CyclePlot {
    /**
     * Constructs a new Cycle Plot.
     * @param {Object} _config - The configuration object.
     * @param {HTMLElement} _config.parentElement - The parent element to which the plot will be appended.
     * @param {number} _config.containerWidth - The width of the container.
     * @param {number} _config.containerHeight - The height of the container.
     * @param {Object} [_config.margin] - The margin object specifying the top, right, bottom, and left margins.
     * @param {Array} _data - The data array.
     * @param {d3.Scale} _colorScale - The color scale for the plot.
     */
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 20 }
        };
        // Data and color scale
        this.data = _data;
        this.colorScale = _colorScale;
        this.clickedData = []; // Array to store clicked data
        this.initVis();
    }

    /**
     * Initializes the visualization.
     */
    initVis() {
        let vis = this;
        // Remove existing elements from the container
        d3.select('#cyclePlot').selectAll("*").remove();
        // Calculate dimensions based on container size and margins
        var cardContainer = document.querySelector('.card.candle-stick-height-card');
        var cardWidth = cardContainer.clientWidth;
        var cardHeight = cardContainer.clientHeight - 30;
        vis.width = (cardWidth) - vis.config.margin.left - vis.config.margin.right;
        vis.height = (cardHeight) - vis.config.margin.top - vis.config.margin.bottom;

        // Create SVG element
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', "100%")
            .attr('height', "100%")
            .attr("viewBox", `0 0 ${cardWidth} ${cardHeight}`)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
    }

    /**
     * Updates the visualization with new data.
     */
    updateVis() {
        let vis = this;
        vis.quarterlyData = d3.rollup(vis.data, v => d3.mean(v, d => d.Volume), d => {
            const quarter = Math.floor((d.Date.getMonth() + 3) / 3);
            return `${d.Date.getFullYear()}-Q${quarter}`;
        });

        // Convert aggregated data to array
        vis.quarterlyVolumes = Array.from(vis.quarterlyData, ([key, value]) => ({ Quarter: key, Volume: value }));
        const maxVolume = d3.max(vis.quarterlyVolumes, d => d.Volume);
        const maxVolumeRoundUp = Math.ceil(maxVolume / 10000000) * 10000000;
        // Update scales domain
        vis.xScale.domain(vis.quarterlyVolumes.map(d => d.Quarter));
        vis.yScale.domain([0, maxVolumeRoundUp]).nice();
        // Render visualization
        vis.renderVis();
    }

    /**
     * Renders the visualization.
     */
    renderVis() {
        let vis = this;
        let hoveredQuarter;
        let hoveredQuarterDatum;
        let clickedPoint;

        // Define line generator
        vis.lineGenerator = d3.line()
            .x(d => vis.xScale(d.Quarter) + vis.xScale.bandwidth() / 2)
            .y(d => vis.yScale(d.Volume));
        const yearGroups = Array.from(d3.group(vis.data, d => d.Date.getFullYear()), ([key]) => key);
        // Define custom colors
        var customColors = ['#0DFF0D', '#8c564b', '#ff7f0e', '#00FFFF', '#DE00DE'];
        
        // Define color scale based on year groups
        vis.colorScale = d3.scaleOrdinal()
            .domain(yearGroups)
            .range(customColors);
        yearGroups.forEach(year => {
            const yearData = vis.quarterlyVolumes.filter(d => d.Quarter.startsWith(year));
             // Append path for each year
            vis.svg.append("path")
                .datum(yearData)
                .attr("fill", "none")
                .attr("stroke", vis.colorScale(year))
                .attr("stroke-width", 3)
                .attr("d", vis.lineGenerator)
                .on("mouseover", function (event, d) {
                    vis.svg.selectAll(".markup-point").remove();
                    const mouseX = d3.pointer(event, vis.svg.node())[0]; // Get x-coordinate relative to the SVG
                    const hoveredQuarterIndex = Math.floor((mouseX / vis.width) * vis.quarterlyVolumes.length);
                    const hoveredQuarterData = vis.quarterlyVolumes[hoveredQuarterIndex];
                    hoveredQuarter = hoveredQuarterData.Quarter;
                    hoveredQuarterDatum = yearData.find(d => d.Quarter === hoveredQuarter);
                    const markupX = vis.xScale(hoveredQuarter) + vis.xScale.bandwidth() / 2;
                    const markupY = vis.yScale(hoveredQuarterDatum.Volume);
                    vis.svg.append("circle")
                        .attr("cx", markupX)
                        .attr("cy", markupY)
                        .attr("r", 7)
                        .attr("fill", "red")
                        .attr("class", "markup-point")
                        .on("click", function (d) {
                            const clickedPoint = d3.select(this); // Define clickedPoint as a local variable
                            if (clickedPoint.classed("clicked-point")) {
                                clickedPoint.classed("clicked-point", false);
                                clickedPoint.classed("markup-point", true);
                                clickedPoint.attr("stroke", null).attr("stroke-width", null);
                                clickedPoint.remove();
                            } else {
                                clickedPoint.attr("stroke", "black")
                                    .attr("stroke-width", 2);
                                clickedPoint.classed("clicked-point", true);
                                clickedPoint.classed("markup-point", false);
                                const clickedQuarter = hoveredQuarterDatum.Quarter; // Define clickedQuarter
                                const selectedData = vis.data.filter(item => {
                                    const itemQuarter = `${item.Date.getFullYear()}-Q${Math.floor((item.Date.getMonth() + 3) / 3)}`;
                                    return itemQuarter === clickedQuarter;
                                });
                                vis.clickedData.push(selectedData); // Store clicked data
                                let quarterData = []

                                for (let i = 0; i < vis.clickedData.length; i++) {
                                    quarterData = quarterData.concat(vis.clickedData[i])
                                }

                                quarterData = new Set(quarterData)
                                quarterData = Array.from(quarterData)
                                quarterData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
                                genRaw = quarterData
                                volumnChartData = quarterData
                                bollingerChartData = quarterData
                                const company = document.getElementById('company-selector').value;
                                loadData(company, true)
                            }

                        });
                })
                .on("mouseout", function () {
                })
                .on("click", function () {
                });

            // Remove clicked points outside the plot area
            d3.select("#cyclePlot").on("click", function (event) {
                if (!vis.svg.node().contains(event.target)) {
                    vis.svg.selectAll(".clicked-point").remove();
                }
            });

            const lastQuarterOfYear = `${year}-Q4`;
            const lastQuarterData = yearData.find(d => d.Quarter === lastQuarterOfYear);
            const spaceBetweenLastQuarterAndLine = 15;
            // Append line for last quarter of the year
            if (lastQuarterData) {
                const lastQuarterX = vis.xScale(lastQuarterOfYear) + vis.xScale.bandwidth() / 2 + spaceBetweenLastQuarterAndLine;
                const lastQuarterY = vis.yScale(lastQuarterData.Volume);
                vis.svg.append("line")
                    .attr("x1", lastQuarterX)
                    .attr("y1", 0)
                    .attr("x2", lastQuarterX)
                    .attr("y2", vis.height)
                    .attr("stroke", "gray")
                    .attr("stroke-dasharray", "5,5");
            }
        });

        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");

        vis.svg.append("text")
            .attr("transform", `translate(${vis.width / 2},${vis.height + 60})`)
            .style("text-anchor", "middle")
            .text("Quarter/Value");

        vis.svg.append("g")
            .call(d3.axisLeft(vis.yScale)
                .tickValues(d3.range(0, vis.yScale.domain()[1] + 1, 10000000))
                .tickFormat(d3.format(".2s")));

        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", -vis.height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Avg. Volume");

    }
}
