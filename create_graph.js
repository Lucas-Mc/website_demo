/* Insert Documentation Here
 *
 */
input_files = ["2013_December.csv","2013_November.csv"];

// For single file
function parseData(createGraph) {

    Papa.parse(input_files[0], {
        download: true,
        complete: function(results) {
            console.log("Done");
            createGraph(results.data)
        }
    });
}

// For single file
function createGraph(data) {
    // Line Plot.. start at line 10 (start of actual data in the CSV)
    start_at = 10;
    index = [];
    wind_speed = [];

    for (var i = start_at; i < data.length; i++) {
        
        index.push(data[i][1]);
        wind_speed.push(data[i][7]);
        
        var trace = {
            x: index,
            y: wind_speed,
            type: "scatter"

        };  
    }

    data = [trace];
    layout = {
        title: 'Sample ECG Data',
        xaxis: {
            rangeslider: {}
        },
        yaxis: {
            fixedrange: true
        }
    };
    Plotly.newPlot("chart", data, layout); 

}

parseData(createGraph)
