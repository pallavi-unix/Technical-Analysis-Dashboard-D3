// Function to load and render the Bollinger Band Chart with provided stock data.
function loadBollingerChart(ksData) {
    // Retrieve the selected interval from a dropdown menu on the webpage.
    interval = document.getElementById('interval-selector-bollinger').value;

    // Parse and convert the dataset's fields to appropriate data types.
    ksData.forEach(function (d) {
        d.Date = new Date(d.Date);
        d.Open = +d.Open;
        d.High = +d.High;
        d.Low = +d.Low;
        d.Close = +d.Close;
        d.AdjClose = +d["Adj Close"];
        d.Volume = +d.Volume;
    });

    // Generate Bollinger Bands data.
    filtered_data = getbanddata(ksData);


    // Aggregate data based on the selected interval (daily, weekly, monthly, etc.).
    ksData = aggregateData(ksData, interval);


    // Clear any existing SVG elements from the chart container.
    d3.select("#chart").selectAll("*").remove();

    // Select card container for dynamic sizing.
    var cardContainer = document.querySelector('.card.candle-stick-height-card');
    var cardWidth = cardContainer.clientWidth;
    var cardHeight = cardContainer.clientHeight;

    // Define margins and dimensions for the SVG.
    var margin = { top: 20, right: 20, bottom: 150, left: 50 };
    var width = (cardWidth) - margin.left - margin.right;
    var height = (cardHeight) - margin.top - margin.bottom;


    // Create SVG element with responsive attributes.
    var svg = d3.select("#chart")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${cardWidth} ${cardHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Define scales for the x and y axes.
    var xScale = d3.scaleTime()
        .domain(d3.extent(ksData, function (d) { return d.Date; }))
        .range([0, width]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(ksData, function (d) { return Math.max(d.High, d.Low, d.AdjClose); })])
        .range([height, 0]);


    // Define line generators for high, low, and adjusted close values.

    var lineHigh = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.High); });

    var lineLow = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.Low); });

    var lineAdjClose = d3.line()
        .x(function (d) { return xScale(d.Date); })
        .y(function (d) { return yScale(d.AdjClose); });

    // Append paths for high, low, and adjusted close lines with interactions.


    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineHigh)
        .style("stroke", "green")
        .on('mouseover', function (event, d) {
            svg.selectAll(".markup-point").remove();
            svg.selectAll(".markup-text").remove();

            const [x, y] = d3.pointer(event);
            const markupX = x;
            const markupY = y;

            svg.append("circle")
                .attr("cx", markupX)
                .attr("cy", markupY)
                .attr("r", 4)
                .attr("fill", "green")
                .attr("class", "markup-point");



            const mouseX = xScale.invert(d3.pointer(event)[0]);
            const nearestDataPoint = findNearestDataPoint(filtered_data, mouseX);

            svg.append("text")
                .attr("x", markupX + 10)
                .attr("y", markupY)
                .text(`Upper Band: ${nearestDataPoint.upperBand.toFixed(2)}`)
                .attr("class", "markup-text");



        });

    // Function to find the nearest data point based on mouse position.
    function findNearestDataPoint(data, mouseX) {
        const bisectDate = d3.bisector(d => d.Date).left;
        const index = bisectDate(data, mouseX, 1);
        if (index === 0) return data[index];
        if (index === data.length) return data[index - 1];
        const d0 = data[index - 1];
        const d1 = data[index];
        const nearestDataPoint = mouseX - d0.Date > d1.Date - mouseX ? d1 : d0;
        return nearestDataPoint;
    }


    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineLow)
        .style("stroke", "red")
        .on('mouseover', function (event, d) {
            svg.selectAll(".markup-point").remove();
            svg.selectAll(".markup-text").remove();

            const [x, y] = d3.pointer(event);
            const markupX = x;
            const markupY = y;

            svg.append("circle")
                .attr("cx", markupX)
                .attr("cy", markupY)
                .attr("r", 4)
                .attr("fill", "red")
                .attr("class", "markup-point");



            const mouseX = xScale.invert(d3.pointer(event)[0]);
            const nearestDataPoint = findNearestDataPoint(filtered_data, mouseX);

            svg.append("text")
                .attr("x", markupX + 10)
                .attr("y", markupY)
                .text(`Lower Band: ${nearestDataPoint.lowerBand.toFixed(2)}`)
                .attr("class", "markup-text");



        });

    svg.append("path")
        .datum(ksData)
        .attr("class", "line")
        .attr("d", lineAdjClose)
        .style("stroke", "black")
        .on('mouseover', function (event, d) {
            svg.selectAll(".markup-point").remove();
            svg.selectAll(".markup-text").remove();

            const [x, y] = d3.pointer(event);
            const markupX = x;
            const markupY = y;

            svg.append("circle")
                .attr("cx", markupX)
                .attr("cy", markupY)
                .attr("r", 4)
                .attr("fill", "black")
                .attr("class", "markup-point");



            const mouseX = xScale.invert(d3.pointer(event)[0]);
            const nearestDataPoint = findNearestDataPoint(filtered_data, mouseX);

            svg.append("text")
                .attr("x", markupX + 10)
                .attr("y", markupY)
                .text(`Closing price: ${nearestDataPoint.movingAverage.toFixed(2)}`)
                .attr("class", "markup-text");



        });

    var xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeMonth.every(interval === 'Month' ? 1 : 3))
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

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Value");

    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + 80})`)
        .style("text-anchor", "middle")
        .text("Date");

}

// Function to generate Bollinger Bands data.
function getbanddata(data) {
    const movingWindow = 20;
    const numberOfStdDev = 2;
    let rollingSum = 0, rollingSquareSum = 0;

    data.forEach((d, i) => {

        rollingSum += d.Close;
        rollingSquareSum += d.Close ** 2;
        if (i >= movingWindow) {
            rollingSum -= data[i - movingWindow].Close;
            rollingSquareSum -= data[i - movingWindow].Close ** 2;
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

    // Filtered data
    let filteredData = data.filter(d => d.movingAverage !== undefined && d.upperBand !== undefined && d.lowerBand !== undefined);

    return filteredData;

}


// Helper function to aggregate data
function aggregateData(data, interval) {
    // Aggregation logic for different intervals.
    var aggregated = d3.groups(data, d => {
        switch (interval) {
            case 'week': return d3.timeWeek(d.Date);
            case 'month': return d3.timeMonth.every(4).floor(d.Date);
            case 'quarter': return d3.timeMonth.every(3).floor(d.Date);
            case 'day':
            default: return d.Date;
        }
    }).map(function (group) {
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
