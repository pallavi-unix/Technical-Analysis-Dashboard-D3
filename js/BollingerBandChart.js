function loadBollingerChart(ksData, interval = 'day') {
    // Parsing the date input as a date object
    ksData.forEach(function (d) {
        d.Date = new Date(d.Date);  // Ensure Date is a Date object
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
        d.AdjClose = +d["Adj Close"];
        d.Volume = +d.Volume;
    });

    // Aggregate data based on the interval
    ksData = aggregateData(ksData, interval); 

    d3.select("#chart").selectAll("*").remove();

    var margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleTime()
        .domain(d3.extent(ksData, function(d) { return d.Date; }))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ksData, function(d) { return Math.max(d.High, d.Low, d.AdjClose); })])
        .range([height, 0]);

    var lineHigh = d3.line()
        .x(function(d) { return xScale(d.Date); })
        .y(function(d) { return yScale(d.High); });

    var lineLow = d3.line()
        .x(function(d) { return xScale(d.Date); })
        .y(function(d) { return yScale(d.Low); });

    var lineAdjClose = d3.line()
        .x(function(d) { return xScale(d.Date); })
        .y(function(d) { return yScale(d.AdjClose); });

    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineHigh)
        .style("stroke", "green");

    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineLow)
        .style("stroke", "red");

    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineAdjClose)
        .style("stroke", "black");

    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(interval === 'month' ? 1 : 3))
        .tickFormat(d3.timeFormat("%d %b '%y"));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
}

// Helper function to aggregate data
function aggregateData(data, interval) {
    var aggregated = d3.groups(data, d => {
        switch (interval) {
            case 'week': return d3.timeWeek(d.Date);
            case 'month': return d3.timeMonth(d.Date);
            case 'quarter': return d3.timeMonth.every(3).floor(d.Date);
            case 'day':
            default: return d.Date;
        }
    }).map(function(group) {
        var dates = group[1];
        return {
            Date: group[0], // Start date of the interval
            Open: d3.mean(dates, d => d.Open),
            High: d3.max(dates, d => d.High),
            Low: d3.min(dates, d => d.Low),
            Close: d3.mean(dates, d => d.Close),
            AdjClose: d3.mean(dates, d => d.AdjClose),
            Volume: d3.sum(dates, d => d.Volume)
        };
    });

    return aggregated;
}
