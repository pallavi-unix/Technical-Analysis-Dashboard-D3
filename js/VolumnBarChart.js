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
    
        // Convert the Date string to a JavaScript Date object
        vis.data.forEach(d => {
            d.Date = new Date(d.Date);
        });
    
        // Calculate daily volumes
        vis.dailyVolumes = Array.from(
            d3.rollup(vis.data, v => d3.mean(v, d => d.Volume), d => {
                return d3.timeFormat('%Y-%m-%d')(new Date(d.Date));
            }),
            ([key, value]) => ({ Date: new Date(key), Volume: value })
        );
    
        const maxVolume = d3.max(vis.dailyVolumes, d => d.Volume);
        const maxVolumeRoundUp = Math.ceil(maxVolume / 10000000) * 10000000;
    
        vis.xScale = d3.scaleBand()
            .domain(vis.dailyVolumes.map(d => d.Date))
            .range([0, vis.width])
            .padding(0.2);
    
        vis.yScale = d3.scaleLinear()
            .domain([0, maxVolumeRoundUp])
            .nice()
            .range([vis.height, 0]);
    
        vis.xAxisCall = d3.axisBottom(vis.xScale)
            .tickValues(vis.dailyVolumes.filter((d, i) => i % 30 === 0).map(d => d.Date))
            .tickFormat(d3.timeFormat('%b %Y'));
    
        vis.renderVis();
    }
    
    renderVis() {
        let vis = this;
    
        vis.chart.selectAll('.bar')
            .data(vis.dailyVolumes)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(d.Date))
            .attr('width', vis.xScale.bandwidth())
            .attr('y', d => vis.yScale(d.Volume))
            .attr('height', d => vis.height - vis.yScale(d.Volume))
            .attr('fill', 'steelblue');
    
        vis.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxisCall)
            .selectAll('text')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'end')
            .attr('dx', '-0.5em')
            .attr('dy', '0.5em')
            .style('font-size', '10px');
    
        // Label for y-axis
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Volume");
    
        vis.svg.append("text")
            .attr("transform", `translate(${vis.width / 2},${vis.height + 150})`)
            .style("text-anchor", "middle")
            .text("Date");

        vis.chart.append('g')
            .call(d3.axisLeft(vis.yScale)
                .tickValues(d3.range(0, vis.yScale.domain()[1] + 1, 10000000))
                .tickFormat(d3.format(".2s")));
    }   
}
