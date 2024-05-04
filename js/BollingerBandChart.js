function loadBollingerChart(ksData , interval = 'day') {


    
    
    ksData.forEach(function (d) {
        d.Date = d.Date;
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
        d.AdjClose = +d["Adj Close"];
        d.Volume = +d.Volume;
    });


    // ksData = aggregateData(ksData, interval);

    console.log("interval" ,ksData ,  interval)

    

    // ksData = aggregateData(ksData, interval); 
    d3.select("#chart").selectAll("*").remove();

    // Set the dimensions and margins of the chart
    var margin = { top: 20, right: 20, bottom: 70, left: 50 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the SVG object to the chart div
    var svg = d3.select("#chart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define x scale with yearly ticks
    var xScale = d3.scaleTime()
        .domain(d3.extent(ksData, function (d) { return d.Date; }))
        .range([0, width + 200]);

    // Define y scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ksData, function (d) { return Math.max(d.High, d.Low, d.AdjClose); })])
        .range([height, 0]);

    // Define the line functions
    var lineHigh = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.High); });

    var lineLow = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.Low); });

    var lineAdjClose = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.AdjClose); });

    // Append lines for High, Low, and Adj Close
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

    // Displays x axis
    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(3))
        .tickFormat(d3.timeFormat("%d %b '%y"))

    // Append x axis to the chart
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text") 
        .style("text-anchor", "end")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em")
        .attr("transform", "rotate(-45)");

    // Add y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
}


function aggregateData(data, interval) {
    var parseDate = d3.timeParse("%a %b %d %Y %H:%M:%S GMT-0500 (Eastern Standard Time)");
    data.forEach(d => d.Date = parseDate(d.Date)); // Parse date for consistency

    if (interval !== "day") {
        var timeInterval = d3.timeDay;
        switch (interval) {
            case "week":
                timeInterval = d3.timeSunday;
                break;
            case "month":
                timeInterval = d3.timeMonth;
                break;
            case "quarter":
                timeInterval = d3.timeMonth.every(3);
                break;
        }

        data = d3.rollups(data,
            g => ({
                Open: g[0].Open, // Open of first day in the period
                High: d3.max(g, d => d.High), // Max high in the period
                Low: d3.min(g, d => d.Low), // Min low in the period
                Close: g[g.length - 1].Close, // Close of last day in the period
                AdjClose: d3.mean(g, d => d.AdjClose), // Average adjusted close in the period
                Date: g[0].Date // Date of the first entry in the period
            }),
            d => timeInterval.floor(d.Date)
        ).map(d => d[1]); // map to get values only
    }
    return data;
}
