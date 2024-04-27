
var parseDate = d3.time.format("%Y-%m-%d").parse;
var TPeriod = "5Y";
var TDays = { "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "2Y": 504, "4Y": 1008, "5Y": 1258 };
var TIntervals = { "5Y": "day" };
var TFormat = { "day": "%d %b '%y", "week": "%d %b '%y", "month": "%b '%y" };
var genRaw, genData;


// const intervalSelector = document.getElementById('interval-selector');
// const intervalSelectorContainer = document.getElementById('interval-selector-container');

// intervalSelectorContainer.addEventListener('click', function(event) {
//     const interval = event.target.getAttribute('value');
//     if (interval !== null) {
//         const company = document.getElementById('company-selector').value;
//         loadData(company, interval);
        
//     }
// });

document.getElementById('interval-selector').addEventListener('change', event => {
    const interval = event.target.value;
    const company = document.getElementById('company-selector').value;
    loadData(company, interval);
});

document.getElementById('company-selector').addEventListener('change', event => {
    const company = event.target.value;
    const interval = document.getElementById('interval-selector').value;
    loadData(company, interval);
});



function loadData(company, interval) {

    d3.csv(`data/${company}.csv`, genType).then(_data => {
        const data = _data
        genRaw = data;
        mainjs(interval)
        displayLatestInfo()


        // var compressedData = dataCompress(_data, interval);

        
        loadBollingerChart(_data)



        const cyclePlotConfig = {
            parentElement: '#cyclePlot',
            containerWidth: 900,
            containerHeight: 500,
            margin: { top: 25, right: 70, bottom: 75, left: 60 }
        };
        const volumnBarChartConfig = {
            parentElement: '#volumnBarChart',
            containerWidth: 900,
            containerHeight: 500,
            margin: { top: 80, right: 20, bottom: 100, left: 100 }
        };

        d3.select('#cyclePlot svg').remove();
        d3.select('#volumnBarChart svg').remove();
        const cyclePlotChart = new CyclePlot(cyclePlotConfig, data);
        cyclePlotChart.updateVis();
        const volumnBarChart = new VolumnBarChart(volumnBarChartConfig, data);
        volumnBarChart.updateVis();


    })
        .catch(error => console.error(error));

}

loadData('Amazon', 'day')
function toSlice(data) { return data.slice(-TDays[TPeriod]); }
function mainjs(interval) {
    TIntervals[TPeriod] = interval
    var toPress = function () { genData = (TIntervals[TPeriod] != "day") ? dataCompress(toSlice(genRaw), TIntervals[TPeriod]) : toSlice(genRaw); };
    toPress(); displayAll();
}

function displayAll() {
    changeClass();
    displayCS();
    displayGen(genData.length - 1);
}

function changeClass() {
    if (TPeriod == "1M") {
        d3.select("#oneM").classed("active", true);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", false);
    } else if (TPeriod == "6M") {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", true);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", false);
    } else if (TPeriod == "1Y") {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", true);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", false);
    } else if (TPeriod == "2Y") {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", true);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", false);
    } else if (TPeriod == "4Y") {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", true);
        d3.select("#fiveY").classed("active", false);
    } else if (TPeriod == "5Y") {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", true);
    }

    else {
        d3.select("#oneM").classed("active", false);
        d3.select("#threeM").classed("active", false);
        d3.select("#sixM").classed("active", false);
        d3.select("#oneY").classed("active", false);
        d3.select("#twoY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fourY").classed("active", false);
        d3.select("#fiveY").classed("active", true);
    }
}

function displayCS() {
    var chart = cschart().Bheight(440);
    d3.select("#chart1").call(chart);
    hoverAll();
}








// function hoverAll() {
//     d3.select("#chart1").select(".bands").selectAll("rect")
//         .on("mouseover", function (d, i) {
//             d3.select(this).classed("hoved", true);
//             d3.selectAll(".stick").filter(function (_, index) { return index === i; }).classed("hoved", true);
//             d3.selectAll(".candle").filter(function (_, index) { return index === i; }).classed("hoved", true);
//             d3.selectAll(".volume").filter(function (_, index) { return index === i; }).classed("hoved", true);
//             d3.selectAll(".sigma").filter(function (_, index) { return index === i; }).classed("hoved", true);
//             var ohlcData = i;
//             // Update the infoboxes with OHLC data
//             d3.select("#infodate").text(ohlcData.TIMESTAMP);
//             d3.select("#infoopen").text(ohlcData.OPEN);
//             d3.select("#infohigh").text(ohlcData.HIGH);
//             d3.select("#infolow").text(ohlcData.LOW);
//             d3.select("#infoclose").text(ohlcData.CLOSE);

//             // Call the displayGen function with the hovered index
//             displayGen(i);
//         })
//         .on("mouseout", function (d, i) {
//             d3.select(this).classed("hoved", false);
//             d3.selectAll(".stick").filter(function (_, index) { return index === i; }).classed("hoved", false);
//             d3.selectAll(".candle").filter(function (_, index) { return index === i; }).classed("hoved", false);
//             d3.selectAll(".volume").filter(function (_, index) { return index === i; }).classed("hoved", false);
//             d3.selectAll(".sigma").filter(function (_, index) { return index === i; }).classed("hoved", false);

//             // Reset the infoboxes to default text
//             d3.select("#infodate").text("");
//             d3.select("#infoopen").text("");
//             d3.select("#infohigh").text("");
//             d3.select("#infolow").text("");
//             d3.select("#infoclose").text("");

//             // Call the displayGen function with the last index
//             displayGen(genData.length - 1);
//         });
// }



function hoverAll() {
    d3.select("#chart1").select(".bands").selectAll("rect")
        .on("mouseover", function(event, d) {
            // Add hovered class to current element
            d3.select(this).classed("hoved", true);

            // Highlight corresponding elements
            d3.selectAll(".stick" + d.index).classed("hoved", true);
            d3.selectAll(".candle" + d.index).classed("hoved", true);
            d3.selectAll(".volume" + d.index).classed("hoved", true);
            d3.selectAll(".sigma" + d.index).classed("hoved", true);

            // Update the infoboxes with OHLC data
            updateInfoBox(d);
        })
        .on("mouseout", function(event, d) {
            // Remove hovered class from the element
            d3.select(this).classed("hoved", false);

            // Remove highlighting from corresponding elements
            d3.selectAll(".stick" + d.index).classed("hoved", false);
            d3.selectAll(".candle" + d.index).classed("hoved", false);
            d3.selectAll(".volume" + d.index).classed("hoved", false);
            d3.selectAll(".sigma" + d.index).classed("hoved", false);

            // Clear the infoboxes
            displayLatestInfo();
        });
}

// function updateInfoBox(d) {
//     d3.select("#infodate").text("Date : "+d.TIMESTAMP);
//     d3.select("#infoopen").text("Open : "+d.OPEN);
//     d3.select("#infohigh").text("High : "+d.HIGH);
//     d3.select("#infolow").text("Low : "+d.LOW);
//     d3.select("#infoclose").text("Close : "+d.CLOSE);
// }

function updateInfoBox(d) {
    // Format the date
    var formatDate = d3.time.format("%a %b %d %Y");
    var date = new Date(d.TIMESTAMP);
    var formattedDate = formatDate(date);

    // Round the prices to two decimal places
    var open = parseFloat(d.OPEN).toFixed(2);
    var high = parseFloat(d.HIGH).toFixed(2);
    var low = parseFloat(d.LOW).toFixed(2);
    var close = parseFloat(d.CLOSE).toFixed(2);

    // Update the information box
    d3.select("#infodate").text("Date: " + formattedDate);
    d3.select("#infoopen").text("Open: " + open);
    d3.select("#infohigh").text("High: " + high);
    d3.select("#infolow").text("Low: " + low);
    d3.select("#infoclose").text("Close: " + close);
}


// function clearInfoBox() {
//     d3.select("#infodate").text("");
//     d3.select("#infoopen").text("");
//     d3.select("#infohigh").text("");
//     d3.select("#infolow").text("");
//     d3.select("#infoclose").text("");
// }


function displayLatestInfo() {
    // Assuming genData is sorted and the latest price is the last element
    var latestData = genData[genData.length - 1];

    // Format the date
    var formatDate = d3.time.format("%a %b %d %Y"); // Use d3.timeFormat if using d3 v4 or later
    var date = new Date(latestData.TIMESTAMP);
    var formattedDate = formatDate(date);

    // Round the prices to two decimal places
    var open = parseFloat(latestData.OPEN).toFixed(2);
    var high = parseFloat(latestData.HIGH).toFixed(2);
    var low = parseFloat(latestData.LOW).toFixed(2);
    var close = parseFloat(latestData.CLOSE).toFixed(2);

    // Update the information box with the latest price
    d3.select("#infodate").text("Date: " + formattedDate);
    d3.select("#infoopen").text("Open: " + open);
    d3.select("#infohigh").text("High: " + high);
    d3.select("#infolow").text("Low: " + low);
    d3.select("#infoclose").text("Close: " + close);
}



function displayGen(mark) {
    var header = csheader();
    d3.select("#infobar").datum(genData.slice(mark)[0]).call(header);
}

