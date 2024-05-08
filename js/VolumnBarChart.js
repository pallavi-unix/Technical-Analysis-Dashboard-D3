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
            containerWidth: _config.containerWidth,
            containerHeight: _config.containerHeight,
            margin: _config.margin || { top: 20, right: 20, bottom: 20, left: 50 }
        };
        this.data = _data;
        this.colorScale = _colorScale;
        this.initVis();
    }

    /**
     * Initializes the visualization by setting up SVG and chart dimensions.
     */
    initVis() {
        // Remove any existing SVG elements
        d3.select('#volumnBarChart svg').remove();
        let vis = this;

        // Calculate dimensions based on parent container size
        var cardContainer = document.querySelector('.card.candle-stick-height-card');
        var cardWidth = cardContainer.clientWidth - 20;
        var cardHeight = cardContainer.clientHeight - 45;

        // Set chart width and height
        vis.width = (cardWidth) - vis.config.margin.left - vis.config.margin.right;
        vis.height = (cardHeight) - vis.config.margin.top - vis.config.margin.bottom;

        // Create SVG element
        vis.svg = d3.select(vis.config.parentElement)
            .append('svg')
            .attr('width', "100%")
            .attr('height', "100%")
            .attr("viewBox", `0 0 ${cardWidth} ${cardHeight}`)

        // Create chart group
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    }

    /**
     * Updates the visualization based on new data or settings.
     */
    updateVis() {
        let vis = this;
        let volumn_interval = document.getElementById('interval-selector-volumn').value;

        // Parse date strings to Date objects
        vis.data.forEach(d => {
            d.Date = new Date(d.Date);
        });

        // Modify data structure to include opening and closing prices
        vis.data.forEach((d, i) => {
            if (i > 0) {
                d.OpeningPrice = vis.data[i - 1].Close;
            }
            d.ClosingPrice = d.Close;
        });

        // Determine time interval and tick format based on selected interval
        let timeInterval, tickFormat;

        switch (volumn_interval) {
            case 'quarter':
                timeInterval = d3.timeMonth;
                tickFormat = d => {
                    const date = new Date(d);
                    const quarter = Math.ceil((date.getMonth() + 1) / 3);
                    return `Q${quarter} ${date.getFullYear()}`;
                };
                break;
            case 'month':
                timeInterval = d3.timeMonth.every(3);
                tickFormat = d3.timeFormat('%b %Y');
                break;
            case 'week':
                timeInterval = d3.timeWeek;
                tickFormat = d3.timeFormat('%b %d, %Y');
                break;
            case 'day':
                timeInterval = d3.timeFormat('%Y-%m-%d')
                break;
        }

        // Aggregate data based on selected interval
        vis.dailyVolumes = this.aggregateData(vis.data, volumn_interval);
        const maxVolume = d3.max(vis.dailyVolumes, d => d.Volume);
        const maxVolumeRoundUp = Math.ceil(maxVolume / 10000000) * 10000000;

        // Create scales
        vis.xScale = d3.scaleBand()
            .domain(vis.dailyVolumes.map(d => d.Date))
            .range([0, vis.width])
            .padding(0.2);

        vis.yScale = d3.scaleLinear()
            .domain([0, maxVolumeRoundUp])
            .nice()
            .range([vis.height, 0]);

        // Adjust x-axis ticks based on selected interval
        if (volumn_interval == "day" || volumn_interval == "week") {
            vis.xAxisCall = d3.axisBottom(vis.xScale)
                .tickValues(vis.dailyVolumes.filter((d, i) => i % 30 === 0).map(d => d.Date))
                .tickFormat(d3.timeFormat('%b %Y'));
        }
        else {
            vis.xAxisCall = d3.axisBottom(vis.xScale)
                .tickValues(vis.dailyVolumes.map(d => d.Date))
                .tickFormat(tickFormat);
        }

        // Render the visualization
        vis.renderVis();
    }

    /**
     * Renders the visualization by drawing bars, x-axis, and y-axis.
     */
    renderVis() {
        let vis = this;

        // Draw bars
        vis.chart.selectAll('.bar')
            .data(vis.dailyVolumes)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => vis.xScale(d.Date))
            .attr('width', vis.xScale.bandwidth())
            .attr('y', d => vis.yScale(d.Volume))
            .attr('height', d => vis.height - vis.yScale(d.Volume))
            .attr('fill', d => d.FillColor);

        // Label for x-axis
        vis.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${vis.height})`)
            .call(vis.xAxisCall)
            .selectAll('text')
            .attr('transform', 'rotate(-60)')
            .attr('text-anchor', 'end')
            .attr('dx', '-0.5em')
            .attr('dy', '0.5em')
            .style('font-size', '10px')
            .style('fill', 'black');

        // Label for y-axis
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - (vis.height / 2))
            .attr("dx", "-6em")
            .attr("dy", "2em")
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text("Volume");

        vis.svg.append("text")
            .attr("transform", `translate(${vis.width / 2},${vis.height + 150})`)
            .attr("dx", "6em")
            .attr("dy", "0em")
            .style("text-anchor", "middle")
            .style("fill", "black")
            .text("Date");

        // Draw y-axis
        vis.chart.append('g')
            .call(d3.axisLeft(vis.yScale)
                .tickValues(vis.yScale.ticks(10)) // Generate 10 nicely-rounded tick values based on the y-axis domain
                .tickFormat(d3.format(".2s")))
            .selectAll('text') // select all the text elements for customization
            .attr('transform', 'translate(-10, 0)') // adjust the x-coordinate for the tick values
            .style('font-size', '10px');
    }

    /**
     * Aggregates the data based on the specified time interval.
     */
    aggregateData(data, interval) {
        var aggregated = d3.groups(data, d => {
            // Switch statement to determine the grouping logic based on the specified interval
            switch (interval) {
                case 'week': return d3.timeWeek(d.Date);
                case 'month': return d3.timeMonth.every(4).floor(d.Date);
                case 'quarter': return d3.timeMonth.every(3).floor(d.Date);
                case 'day':
                default: return d.Date;
            }
        }).map(function (group) {
            var dates = group[1];
            // Calculate opening and closing prices
            var openingPrice = dates[0].OpeningPrice;
            var closingPrice = dates[dates.length - 1].ClosingPrice;
            // Determine fill color based on the comparison of closing and opening prices
            var fillColor = closingPrice < openingPrice ? 'red' : 'green';
            return {
                Date: group[0],
                Volume: d3.sum(dates, d => d.Volume),
                OpeningPrice: openingPrice,
                ClosingPrice: closingPrice,
                FillColor: fillColor // Fill color based on price comparison
            };
        });
        return aggregated; // Return the aggregated data array
    }
}
