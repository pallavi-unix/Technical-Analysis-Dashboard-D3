
// Configuration and global variables
var parseDate = d3.time.format("%Y-%m-%d").parse;
var TPeriod = "5Y";
var TDays = { "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "2Y": 504, "4Y": 1008, "5Y": 1258 };
var TIntervals = {"3M":"day" , "5Y": "day" };
var TFormat = { "day": "%d %b '%y", "week": "%d %b '%y", "month": "%b '%y" , "quarter" : "%b '%y"};
var genRaw, genData; // Variables to store raw and processed data.
var bollingerChartData;
var volumnChartData;
var cyclePlotData;  // Variables to store specific chart data.


// Event listeners for UI elements to trigger corresponding functions
document.getElementById('sma20').addEventListener('change', function() {
    displayCS()
});
document.getElementById('sma60').addEventListener('change', function() {
    displayCS()
});
document.getElementById('sma100').addEventListener('change', function() {
    displayCS()
});


document.getElementById('resetfilter').addEventListener('change', function() {
    // Reset data filter based on checkbox state
    if (!document.getElementById('resetfilter').checked){
            const company = document.getElementById('company-selector').value
            loadData(company, false); 
    }

    
});


document.getElementById('interval-selector').addEventListener('change', event => {
    mainjs()
});

document.getElementById('interval-selector-bollinger').addEventListener('change', event => {
    loadBollingerChart(bollingerChartData)  
});

document.getElementById('company-selector').addEventListener('change', event => {
    const company = event.target.value;
    loadData(company, false);
   
});

document.getElementById('interval-selector-volumn').addEventListener('change', event => {
    loadVolumnChart() 
});


function loadCandleStick(){
    mainjs()
    displayLatestInfo()
}


function loadVolumnChart(){
    const volumnBarChartConfig = {
        parentElement: '#volumnBarChart',
        containerWidth: 900,
        containerHeight: 500,
        margin: { top: 80, right: 20, bottom: 100, left: 100 }
    };
    const volumnBarChart = new VolumnBarChart(volumnBarChartConfig, volumnChartData);
    volumnBarChart.updateVis();
}


function loadCyclePlotGragh(){
    const cyclePlotConfig = {
        parentElement: '#cyclePlot',
        containerWidth: 900,
        containerHeight: 500,
        margin: { top: 0, right: 70, bottom: 75, left: 60 }
    };
    
    const cyclePlotChart = new CyclePlot(cyclePlotConfig, cyclePlotData);
    cyclePlotChart.updateVis();

}



function loadData(company, cyclePlotFilter) {
    let resetFilterCheckbox = document.getElementById('resetfilter');
    if (cyclePlotFilter) {
        resetFilterCheckbox.disabled = false;
        document.getElementById('resetfilter').checked = true;
        loadCandleStick()
        loadVolumnChart()
        
        loadBollingerChart(bollingerChartData)  
    }else{
        document.getElementById('resetfilter').checked = false
        displayAllCharts(company)
        resetFilterCheckbox.disabled = true;
    }
}

//Get Data from Excel based on companies selected 
function displayAllCharts(company){
    d3.csv(`data/${company}.csv`, genType).then(_data => {
        const data = _data
        genRaw = data;
        bollingerChartData = _data
        volumnChartData = data
        cyclePlotData = data
        loadCandleStick()
        loadBollingerChart(bollingerChartData)
        loadCyclePlotGragh()
        loadVolumnChart()

    })
        .catch(error => console.error(error));
}


// Code begins here 
loadData('Amazon',  false)


window.addEventListener('resize', function() {
    loadCandleStick()
    loadBollingerChart(bollingerChartData)
    loadCyclePlotGragh()
    loadVolumnChart()
  });

 
   
function toSlice(data) { return data.slice(-TDays[TPeriod]); }
function mainjs() {
    TIntervals[TPeriod] = document.getElementById('interval-selector').value;
    var toPress = function () { genData = (TIntervals[TPeriod] != "day") ? dataCompress(toSlice(genRaw), TIntervals[TPeriod]) : toSlice(genRaw); };
    toPress(); displayAll();
}

function displayAll() {
    displayCS();
    displayGen(genData.length - 1);
}



function displayCS() {
    sma20 = document.getElementById('sma20').checked;
    sma60 = document.getElementById('sma60').checked;
    sma100 = document.getElementById('sma100').checked;
    var chart = cschart(sma20, sma60, sma100).Bheight(300);
    d3.select("#candle-stick-chart").call(chart);
    hoverAll();
}


function hoverAll() {
    d3.select("#candle-stick-chart").select(".bands").selectAll("rect")
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

