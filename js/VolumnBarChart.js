class VolumnBarChart {
    /**
     * class constructor with basic chart configuration
     * @param {Object} _config 
     * @param {Array} _data 
     * @param {d3.Scale} _colorScale 
     */
    constructor(_config, _data, _colorScale) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || { top: 25, right: 20, bottom: 20, left: 35 }
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    }

    updateVis() {
        let vis = this;

        vis.quarterlyVolumes = Array.from(
            d3.rollup(vis.data, v => d3.mean(v, d => d.Volume), d => {
                return `${d.Date}`;
            }),
            ([key, value]) => ({ Quarter: key, Volume: value })
        );

        const maxVolume = d3.max(vis.quarterlyVolumes, d => d.Volume);
        const maxVolumeRoundUp = Math.ceil(maxVolume / 10000000) * 10000000;

        vis.xScale = d3.scaleBand()
            .domain(vis.quarterlyVolumes.map(d => d.Quarter))
            .range([0, vis.width])
            .padding(0.1);

        vis.yScale = d3.scaleLinear()
            .domain([0, maxVolumeRoundUp])
            .nice()
            .range([vis.height, 0]);

        vis.xAxisCall = d3.axisBottom(vis.xScale);

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.chart.selectAll('.bar')
            .data(vis.quarterlyVolumes)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(d.Quarter))
            .attr('width', vis.xScale.bandwidth())
            .attr('y', d => vis.yScale(d.Volume))
            .attr('height', d => vis.height - vis.yScale(d.Volume))
            .attr('fill', 'steelblue');

        vis.chart.append('g')
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxisCall)
            .selectAll('text')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'end')
            .style('font-size', '12px');

        // Label for x-axis
        vis.svg.append("text")
            .attr("transform", `translate(${vis.width / 2},${vis.height + 130})`)
            .style("text-anchor", "middle")
            .text("Dates");

        // Label for y-axis
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Volume");

        vis.chart.append('g')
            .call(d3.axisLeft(vis.yScale)
                .tickValues(d3.range(0, vis.yScale.domain()[1] + 1, 10000000))
                .tickFormat(d3.format(".2s")));

    }
}
