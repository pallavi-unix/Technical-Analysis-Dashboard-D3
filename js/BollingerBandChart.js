function loadBollingerChart(ksData) {
    // Parsing the date input as a date object

    interval = document.getElementById('interval-selector-bollinger').value;


    console.log("KSSSS Data" , ksData)

    
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

    var cardContainer = document.querySelector('.card.candle-stick-height-card');
    var cardWidth = cardContainer.clientWidth;
    var cardHeight = cardContainer.clientHeight;

    // Calculate chart dimensions
    var margin = { top: 20, right: 20, bottom: 150, left: 50 };
    var width = (cardWidth) - margin.left - margin.right;
    var height = (cardHeight) - margin.top - margin.bottom;

    // var margin = { top: 20, right: 20, bottom: 70, left: 50 },
    //     width = 800 - margin.left - margin.right,
    //     height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#chart")
       // .append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${cardWidth} ${cardHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
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
        .attr("y", 0-margin.left)
        .attr("x", 0-(height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Value");

    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + 80})`)
        .style("text-anchor", "middle")
        .text("Date");

}

// Helper function to aggregate data
function aggregateData(data, interval) {
    var aggregated = d3.groups(data, d => {
        switch (interval) {
            case 'week': return d3.timeWeek(d.Date);
            case 'month': return d3.timeMonth.every(4).floor(d.Date);
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
