class CandleStick {

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

    /**
     * this function is used to initialize scales/axes and append static elements
     */
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


        vis.xScale = d3.scaleTime().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);


        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale).tickFormat(d3.format(".2f"));


        vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.height + vis.config.margin.bottom + 15)
            .style('text-anchor', 'middle')
            .text('Date');


        vis.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', `rotate(-90)`)
            .attr('y', -vis.config.margin.left + 20)
            .attr('x', -(vis.height / 2))
            .style('text-anchor', 'middle')
            .text('Price ($)');
    }

    /**
     * Update visualization
     */
    updateVis() {
        let vis = this;


        vis.xScale.domain(d3.extent(vis.data, d => d.Date));
        vis.yScale.domain([d3.min(vis.data, d => d.Low), d3.max(vis.data, d => d.High)]);


        const tickIncrement = 10;
        const minLow = Math.floor(d3.min(vis.data, d => d.Low));
        const maxHigh = Math.ceil(d3.max(vis.data, d => d.High));


        const tickValues = d3.range(minLow, maxHigh + tickIncrement, tickIncrement);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickValues(tickValues)
            .tickFormat(d3.format(".2f"));

        let tickFormat = d3.timeFormat("%b %Y");
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(tickFormat)
            .ticks(d3.timeMonth.every(4));

        vis.svg.select('.x-axis').call(vis.xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        vis.svg.select('.y-axis').call(vis.yAxis);


        vis.renderVis();
    }

    /**
     * this function contains the d3 code for binding data visual elements
     */
    renderVis() {
        let vis = this;
        const candleWidth = Math.max(vis.width / vis.data.length - 1, 1);


        let candles = vis.svg.selectAll('.candle')
            .data(vis.data)
            .enter()
            .append('g')
            .attr('class', 'candle')
            .attr('transform', d => `translate(${vis.xScale(d.Date)},0)`);

        // Draw rectangles for the Open-Close
        candles.append('rect')
            .attr('x', d => Math.max(0, vis.xScale(d.Date) - candleWidth / 2))
            .attr('y', d => vis.yScale(Math.max(d.Open, d.Close)))
            .attr('width', candleWidth)
            .attr('height', d => Math.abs(vis.yScale(d.Open) - vis.yScale(d.Close)))
            .attr('fill', d => d.Open > d.Close ? 'red' : 'green');

        // Draw lines for the High-Low
        candles.append('line')
            .attr('class', 'stem')
            .attr('x1', d => vis.xScale(d.Date))
            .attr('x2', d => vis.xScale(d.Date))
            .attr('y1', d => vis.yScale(d.High))
            .attr('y2', d => vis.yScale(d.Low))
            .attr('stroke', d => d.Open > d.Close ? 'red' : 'green');
    }
}
