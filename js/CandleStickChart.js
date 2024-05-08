
// Function to create a candlestick chart with optional simple moving averages.
function cschart(sma20 = false, sma60 = false, sma100 = false) {
    // Define the margins of the chart.
    var margin = { top: 0, right: 50, bottom: 40, left: 0 }
    var cardContainer = document.querySelector('.card.candle-stick-height-card');
    width = cardContainer.clientWidth;
    Bheight = cardContainer.clientHeight
    height = cardContainer.clientHeight

    // Main function to render the candlestick chart.
    function csrender(selection) {
        selection.each(function () {
            // Adjust width and height based on margins.
            width = width - margin.left - margin.right
            height = height - margin.top - margin.bottom - 120
            var interval = TIntervals[TPeriod];
            var minimal = d3.min(genData, function (d) { return d.LOW; });
            var maximal = d3.max(genData, function (d) { return d.HIGH; });
            var extRight = width + margin.right;
            // Define x and y scales for the chart.
            var x = d3.scaleBand()
                .range([0, width])
                .padding(0.1)
                .domain(genData.map(function (d) { return d.TIMESTAMP; }));

            var y = d3.scaleLinear()
                .range([height, 0])
                .domain([minimal, maximal]).nice();


            // Configure the x-axis with a dynamic number of ticks based on the width.    
            var xAxis = d3.axisBottom(x)
                .tickValues(x.domain().filter(function (d, i) {
                    // Calculate number of ticks based on the width
                    var maxTicks = 12; // maximum number of ticks you want to display
                    var idealTickGap = Math.floor(genData.length / maxTicks);
                    var tickInterval = Math.ceil(idealTickGap * (500 / width)); // Adjust '500' to fine-tune responsiveness

                    // Ensure that there's a minimum number of ticks, but not more than maxTicks
                    tickInterval = Math.max(tickInterval, Math.floor(genData.length / maxTicks));
                    return (i % tickInterval) === 0;
                })).tickFormat(d3.timeFormat(TFormat[interval]));

            // Define the y-axis on the right.
            var yAxis = d3.axisRight(y)
                .ticks(Math.floor(height / 50));

            // Setup the SVG container for the chart.
            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", Bheight + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add x and y axes to the SVG.
            svg.append("g")
                .attr("class", "axis xaxis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
            svg.append("g")
                .attr("class", "axis yaxis")
                .attr("transform", "translate(" + width + ",0)")
                .call(yAxis);
            svg.append("g")
                .attr("class", "axis grid")
                .attr("transform", "translate(" + width + ",0)")
                .call(d3.axisLeft(y).tickFormat("").tickSize(width).ticks(Math.floor(height / 50)));

            var bands = svg.selectAll(".bands")
                .data([genData])
                .enter().append("g")
                .attr("class", "bands");

            var barwidth = x.bandwidth();
            var candlewidth = Math.floor(d3.min([barwidth * 0.8, 13]) / 2) * 2 + 1;
            var delta = Math.round((barwidth - candlewidth) / 2);

            bands.selectAll("rect")
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("x", function (d) { return x(d.TIMESTAMP) + Math.floor(barwidth / 2); })
                .attr("y", 0)
                .attr("height", Bheight)
                .attr("width", 1)
                .attr("class", function (d, i) { return "band" + i; })
                .style("stroke-width", Math.floor(barwidth));

            var stick = svg.selectAll(".sticks")
                .data([genData])
                .enter().append("g")
                .attr("class", "sticks");

            stick.selectAll("rect")
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("x", function (d) { return x(d.TIMESTAMP) + Math.floor(barwidth / 2); })
                .attr("y", function (d) { return y(d.HIGH); })
                .attr("class", function (d, i) { return "stick" + i; })
                .attr("height", function (d) { return y(d.LOW) - y(d.HIGH); })
                .attr("width", 1)
                .classed("rise", function (d) { return (d.CLOSE > d.OPEN); })
                .classed("fall", function (d) { return (d.OPEN > d.CLOSE); });

            var candle = svg.selectAll(".candles")
                .data([genData])
                .enter().append("g")
                .attr("class", "candles");

            candle.selectAll("rect")
                .data(function (d) { return d; })
                .enter().append("rect")
                .attr("x", function (d) { return x(d.TIMESTAMP) + delta; })
                .attr("y", function (d) { return y(d3.max([d.OPEN, d.CLOSE])); })
                .attr("class", function (d, i) { return "candle" + i; })
                .attr("height", function (d) { return y(d3.min([d.OPEN, d.CLOSE])) - y(d3.max([d.OPEN, d.CLOSE])); })
                .attr("width", candlewidth)
                .classed("rise", function (d) { return (d.CLOSE > d.OPEN); })
                .classed("fall", function (d) { return (d.OPEN > d.CLOSE); });


            //Logic for Simple Moving Average 
            if (sma20) {

                //20 day moving average which is changed to 10 day moving average for Demo
                var movingAverageData20 = calculateMovingAverage(genData, 10); // Adjust the window size as needed
                var line = d3.line()
                    .x(function (d) { return x(d.TIMESTAMP) + Math.floor(barwidth / 2); })
                    .y(function (d) { return y(d.value); });
                svg.append("path")
                    .datum(movingAverageData20)
                    .attr("class", "moving-average-line")
                    .style("fill", "none")
                    .style("stroke", "#2B65EC") // Change color as needed
                    .style("stroke-width", 1.5)
                    .attr("d", line);

            }


            if (sma60) {

                //60 day moving day average calculation
                var movingAverageData60 = calculateMovingAverage(genData, 60); // Adjust the window size as needed
                // Plot moving average line
                var line = d3.line()
                    .x(function (d) { return x(d.TIMESTAMP) + Math.floor(barwidth / 2); })
                    .y(function (d) { return y(d.value); });
                svg.append("path")
                    .datum(movingAverageData60)
                    .attr("class", "moving-average-line1")
                    .style("fill", "none")
                    .style("stroke", "#CF9FFF") // Change color as needed
                    .style("stroke-width", 1.5)
                    .attr("d", line);
            }


            if (sma100) {

                //100 day moving average calculation
                var movingAverageData100 = calculateMovingAverage(genData, 100); // Adjust the window size as needed

                // Plot moving average line
                var line = d3.line()
                    .x(function (d) { return x(d.TIMESTAMP) + Math.floor(barwidth / 2); })
                    .y(function (d) { return y(d.value); });

                svg.append("path")
                    .datum(movingAverageData100)
                    .attr("class", "moving-average-line2")
                    .style("fill", "none")
                    .style("stroke", "orange") // Change color as needed
                    .style("stroke-width", 1)
                    .attr("d", line);

            }

        });
    } // csrender






    csrender.Bheight = function (value) {
        if (!arguments.length) return Bheight;
        Bheight = value;
        return csrender;
    };

    return csrender;
} // cschart




// Function to calculate the moving average of a dataset based on a specified window size.
function calculateMovingAverage(data, windowSize) {
    var movingAverageData = [];
    for (var i = windowSize - 1; i < data.length; i++) {
        var sum = 0;
        for (var j = i - windowSize + 1; j <= i; j++) {
            sum += data[j].CLOSE; // Ensure CLOSE is the correct property to average
        }
        var average = sum / windowSize;
        movingAverageData.push({ TIMESTAMP: data[i].TIMESTAMP, value: average });
    }
    return movingAverageData;
}
