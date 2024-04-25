
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
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || { top: 25, right: 20, bottom: 50, left: 35 }
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }

    /**
     * this function is used to initialize scales/axes and append static elements
     */
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

    /**
     * this function is used to prepare the data and update the scales before we render the actual vis
     */
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

    /**
     * this function contains the d3 code for binding data visual elements
     */
    renderVis() {
        let vis = this;

        vis.lineGenerator = d3.line()
            .x(d => vis.xScale(d.Quarter) + vis.xScale.bandwidth() / 2)
            .y(d => vis.yScale(d.Volume));


        const yearGroups = Array.from(d3.group(vis.data, d => d.Date.getFullYear()), ([key]) => key);
        vis.colorScale = d3.scaleOrdinal()
            .domain(yearGroups)
            .range(d3.schemeCategory10);


        yearGroups.forEach(year => {
            const yearData = vis.quarterlyVolumes.filter(d => d.Quarter.startsWith(year));
            vis.svg.append("path")
                .datum(yearData)
                .attr("fill", "none")
                .attr("stroke", vis.colorScale(year))
                .attr("stroke-width", 2)
                .attr("d", vis.lineGenerator);

            const lastQuarterOfYear = `${year}-Q4`;
            const lastQuarterData = yearData.find(d => d.Quarter === lastQuarterOfYear);
            if (lastQuarterData) {
                const lastQuarterX = vis.xScale(lastQuarterOfYear) + vis.xScale.bandwidth() / 2;
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
            .attr("y", -vis.config.margin.left)
            .attr("x", -vis.height / 2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Avg. Volume");

    }
}