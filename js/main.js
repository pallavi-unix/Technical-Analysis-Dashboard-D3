
var parseDate = d3.time.format("%Y-%m-%d").parse;
var TPeriod = "5Y";
var TDays = { "1M": 21, "3M": 63, "6M": 126, "1Y": 252, "2Y": 504, "4Y": 1008, "5Y": 1258 };
var TIntervals = {"3M":"day" , "5Y": "day" };
var TFormat = { "day": "%d %b '%y", "week": "%d %b '%y", "month": "%b '%y" , "quarter" : "%b '%y"};
var genRaw, genData;


document.getElementById('interval-selector').addEventListener('change', event => {
    const interval = event.target.value;
    const company = document.getElementById('company-selector').value;
    loadData(company, interval , false);
    
});

document.getElementById('company-selector').addEventListener('change', event => {
    const company = event.target.value;
    const interval = document.getElementById('interval-selector').value;
    loadData(company, interval , false);
    console.log("interval" , interval)
});


function loadCandleStick(interval){
    mainjs(interval)
    displayLatestInfo()

}

function loadData(company, interval , cyclePlotFilter) {




    if (cyclePlotFilter) {
        TPeriod = '3M'
        loadCandleStick(interval)
    }else{
        displayAllCharts(company , interval)
    }


   

}


function displayAllCharts(company , interval){
    d3.csv(`data/${company}.csv`, genType).then(_data => {
        const data = _data
        genRaw = data;
        
        loadCandleStick(interval)
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

loadData('Amazon', 'day' , false)

window.addEventListener('resize', function() {
    // You need to ensure that the chart re-rendering happens within the context of available data.
    // This might require ensuring data is loaded or accessible globally.
    d3.select('#candle-stick-chart').call(cschart());
  });


  window.addEventListener('resize', function() {
    // // Recalculate the width based on the container size
    // var margin = { top: 0, right: 50, bottom: 40, left: 0 }
    // var containerWidth = d3.select('#candle-stick-chart').node().getBoundingClientRect().width;
    // width = containerWidth - margin.left - margin.right;
  
    // // Reset the x scale range
    // x.range([0, width]);
  
    // // Recalculate tick values for the new width

    
    // xAxis.tickValues(x.domain().filter(function(d, i) {
    //   return !((i + Math.floor(90 / (width / genData.length)) / 2) % Math.ceil(60 / (width / genData.length)));
    // }));
  
    // // Redraw the x-axis
    // d3.select('.xaxis').call(xAxis);
    
    // // Additionally, you may need to update other chart elements that depend on the new width
    // console.log("Function Called window resize")
    // loadData('Amazon' , 'day')



  });
   
function toSlice(data) { return data.slice(-TDays[TPeriod]); }
function mainjs(interval) {

    
    TIntervals[TPeriod] = interval

    if (TPeriod == "3M" ){
        console.log("Checkkkkkk" , TPeriod,TIntervals[TPeriod] , interval)
        console.log("GENRAW" ,genRaw)
    }

    
    var toPress = function () { genData = (TIntervals[TPeriod] != "day") ? dataCompress(toSlice(genRaw), TIntervals[TPeriod]) : toSlice(genRaw); };
    toPress(); displayAll();
}

function displayAll() {

    displayCS();
    displayGen(genData.length - 1);
}



function displayCS(interval) {
    var chart = cschart(interval).Bheight(300);
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

