function loadBollingerChart(ksData) {

    ksData.forEach(function (d) {
        d.Date = d.Date;
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
        d.AdjClose = +d["Adj Close"];
        d.Volume = +d.Volume;
    });

    d3.select("#chart").selectAll("*").remove();

    // Set the dimensions and margins of the chart
    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
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


    // Define x axis with yearly tick format
    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat(d3.timeFormat("%Y"));


    // Append x axis to the chart
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    // Add y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));




}