class BollingerBand {

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
            margin: _config.margin || { top: 20, right: 20, bottom: 30, left: 50 }
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

        console.log("MKS", vis.width, vis.height)
        console.log(vis.config.parentElement)

        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleTime().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);


        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        vis.svg.append('g')
            .attr('class', 'axis y-axis');

        vis.lineGenerator = d3.line()
            .defined(d => d.movingAverage !== undefined)
            .x(d => vis.xScale(d.Date))
            .y(d => vis.yScale(d.movingAverage))
            .curve(d3.curveBasis);

        vis.upperBandLine = d3.line()
            .defined(d => d.upperBand !== undefined)
            .x(d => vis.xScale(d.Date))
            .y(d => vis.yScale(d.upperBand))
            .curve(d3.curveBasis);

        vis.lowerBandLine = d3.line()
            .defined(d => d.lowerBand !== undefined)
            .x(d => vis.xScale(d.Date))
            .y(d => vis.yScale(d.lowerBand))
            .curve(d3.curveBasis);

    }

    /**
     * this function is used to prepare the data and update the scales before we render the actual vis
     */
    updateVis() {
        let vis = this;


        const movingWindow = 20;
        const numberOfStdDev = 2;
        let rollingSum = 0, rollingSquareSum = 0;

        vis.data.forEach((d, i) => {

            rollingSum += d.Close;
            rollingSquareSum += d.Close ** 2;
            if (i >= movingWindow) {
                rollingSum -= vis.data[i - movingWindow].Close;
                rollingSquareSum -= vis.data[i - movingWindow].Close ** 2;
            }
            if (i >= movingWindow - 1) {
                let mean = rollingSum / movingWindow;
                let variance = (rollingSquareSum / movingWindow) - mean ** 2;
                let stdDev = Math.sqrt(variance);

                d.movingAverage = mean;
                d.upperBand = mean + numberOfStdDev * stdDev;
                d.lowerBand = mean - numberOfStdDev * stdDev;
            }
        });
        vis.filteredData = vis.data.filter(d => d.movingAverage !== undefined && d.upperBand !== undefined && d.lowerBand !== undefined);


        vis.renderVis();
    }

    /**
     * this function contains the d3 code for binding data visual elements
     */
    renderVis() {
        let vis = this;

        vis.xScale.domain(d3.extent(vis.filteredData, d => d.Date));
        vis.yScale.domain([
            d3.min(vis.filteredData, d => d.lowerBand),
            d3.max(vis.filteredData, d => d.upperBand)
        ]);

        vis.svg.select('.x-axis').call(vis.xAxis);
        vis.svg.select('.y-axis').call(vis.yAxis);

        vis.svg.selectAll('.line.moving-average')
            .data([vis.filteredData])
            .join('path')
            .attr('class', 'line moving-average')
            .attr('d', vis.lineGenerator)
            .style('stroke', 'blue');

        vis.svg.selectAll('.line.upper-band')
            .data([vis.filteredData])
            .join('path')
            .attr('class', 'line upper-band')
            .attr('d', vis.upperBandLine)
            .style('stroke', 'green');

        vis.svg.selectAll('.line.lower-band')
            .data([vis.filteredData])
            .join('path')
            .attr('class', 'line lower-band')
            .attr('d', vis.lowerBandLine)
            .style('stroke', 'red');

        vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxis)
            .append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.config.margin.bottom + 15)
            .attr('text-anchor', 'middle')
            .text('Date');

        vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis)
            .append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -vis.height / 2)
            .attr('y', -vis.config.margin.left + 40)
            .attr('text-anchor', 'middle')
            .text('Price');

    }
}