
class CyclePlot {

    /**
     * class constructor with basic chart configuration
     * @param {Object} _config
     * @param {Array} _data
     * @param {d3.Scale} _colorScale
     */
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 900,
            containerHeight: _config.containerHeight || 400,
            margin: _config.margin || { top: 25, right: 90, bottom: 75, left: 50 }
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }


    initVis() {
        let vis = this;

        d3.select('#cyclePlot').selectAll("*").remove();

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

    }

    updateVis() {
        let vis = this;
        vis.quarterlyData = d3.rollup(vis.data, v => d3.mean(v, d => d.Volume), d => {
            const quarter = Math.floor((d.Date.getMonth() + 3) / 3);
            return `${d.Date.getFullYear()}-Q${quarter}`;
        });

        vis.quarterlyVolumes = Array.from(vis.quarterlyData, ([key, value]) => ({ Quarter: key, Volume: value }));

        const maxVolume = d3.max(vis.quarterlyVolumes, d => d.Volume);
        const maxVolumeRoundUp = Math.ceil(maxVolume / 10000000) * 10000000;

        vis.xScale.domain(vis.quarterlyVolumes.map(d => d.Quarter));
        vis.yScale.domain([0, maxVolumeRoundUp]).nice();

        vis.renderVis();
    }


    renderVis() {
        let vis = this;
        let hoveredQuarter;
        let hoveredQuarterDatum;
        let clickedPoint;

        vis.lineGenerator = d3.line()
            .x(d => vis.xScale(d.Quarter) + vis.xScale.bandwidth() / 2)
            .y(d => vis.yScale(d.Volume));

        const yearGroups = Array.from(d3.group(vis.data, d => d.Date.getFullYear()), ([key]) => key);

        var customColors = ['#0DFF0D', '#8c564b', '#ff7f0e', '#00FFFF', '#DE00DE'];

        vis.colorScale = d3.scaleOrdinal()
            .domain(yearGroups)
            .range(customColors);


        yearGroups.forEach(year => {
            const yearData = vis.quarterlyVolumes.filter(d => d.Quarter.startsWith(year));

            vis.svg.append("path")
                .datum(yearData)
                .attr("fill", "none")
                .attr("stroke", vis.colorScale(year))
                .attr("stroke-width", 3)
                .attr("d", vis.lineGenerator)
                .on("mouseover", function (event, d) {

                    vis.svg.selectAll(".markup-point").remove();

                    const mouseX = event.offsetX - vis.config.margin.left;
                    const hoveredQuarterIndex = Math.floor((mouseX / vis.width) * vis.quarterlyVolumes.length);
                    const hoveredQuarterData = vis.quarterlyVolumes[hoveredQuarterIndex];
                    hoveredQuarter = hoveredQuarterData.Quarter;

                    hoveredQuarterDatum = yearData.find(d => d.Quarter === hoveredQuarter);

                    //  const text = vis.svg.append("text")
                    //      .attr("x", vis.xScale(hoveredQuarter) + vis.xScale.bandwidth() / 2)
                    //      .attr("y", vis.yScale(hoveredQuarterDatum.Volume) - 10) // Adjust y position as needed
                    //      .attr("text-anchor", "middle")
                    //      .attr("font-size", "12px")
                    //      .text(`Average Volume\n: ${parseFloat(hoveredQuarterDatum.Volume.toFixed(2))}`);

                    const markupX = vis.xScale(hoveredQuarter) + vis.xScale.bandwidth() / 2;
                    const markupY = vis.yScale(hoveredQuarterDatum.Volume);
                    vis.svg.append("circle")
                        .attr("cx", markupX)
                        .attr("cy", markupY)
                        .attr("r", 7)
                        .attr("fill", "red")
                        .attr("class", "markup-point");

                    // vis.hoveredText = text;

                })



                .on("mouseout", function () {



                })
                .on("click", function () {



                });

            let previousClickedPoint = null;
            let previousClickedQuarter = null;

            vis.svg.on("click", function (event) {
                const targetClass = event.target.getAttribute("class");
                // Check if the clicked element is a markup point circle
                if (targetClass && targetClass.includes("markup-point")) {
                    // Get the quarter associated with the clicked point
                    const clickedQuarter = hoveredQuarter;
                    // Check if there was a previously clicked point and if its quarter is different from the clicked quarter
                    
                    if (previousClickedPoint && previousClickedQuarter !== clickedQuarter) {
                        // Remove the stroke from the previously clicked point
                        previousClickedPoint.attr("stroke", null).attr("stroke-width", null);
                    }
                    // Add the clicked-markup class to the clicked point and apply stroke
                    const clickedPoint = d3.select(event.target).classed("clicked-markup", true)
                        .attr("stroke", "black").attr("stroke-width", 2);

                    // Store the reference to the clicked point and its quarter as the previousClickedPoint and previousClickedQuarter
                    previousClickedPoint = clickedPoint;
                    previousClickedQuarter = clickedQuarter;

                    const selectedData = vis.data.filter(item => {
                        const itemQuarter = `${item.Date.getFullYear()}-Q${Math.floor((item.Date.getMonth() + 3) / 3)}`;
                        return itemQuarter === clickedQuarter;
                    });

                    console.log("Selected quarter and year from cycle plot:", clickedQuarter);
                    console.log("Original data for selected quarter from cycle plot:", selectedData);
                }
            });



            d3.select("body").on("click", function (event) {
                // Check if the click event target is outside of the graph area
                if (!vis.svg.node().contains(event.target)) {
                    // Remove all markup points
                    vis.svg.selectAll(".markup-point").remove();
                }
            });


            const lastQuarterOfYear = `${year}-Q4`;
            const lastQuarterData = yearData.find(d => d.Quarter === lastQuarterOfYear);

            const spaceBetweenLastQuarterAndLine = 15;


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