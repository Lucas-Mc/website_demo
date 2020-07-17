// Select the desired input file
input_file = "demo_ecg.csv";

function parseData(createGraph) {

    Papa.parse(input_file, {
        download: true,
        complete: function(results) {
            console.log("Done");
            createGraph(results.data)
        }
    });
}

function createGraph(data) {
    // Line Plot.. start_at is the start of actual data in the CSV
    start_at = 0;
    index = [];
    signal = [];

    for (var i = start_at; i < data.length; i++) {

        fs = 250;
        index.push(i / fs);
        signal.push(data[i][0]);
        
        var trace = {
            x: index,
            y: signal,
            type: 'scatter',
            line: {
                color: 'black',
                width: 3
            }
        };
    }

    data = [trace];

    shapes = [];
    grid_delta = 0.04
    x_lims = Math.max(...data[0].x)/grid_delta
    y_min = Math.floor(Math.min(...data[0].y)/grid_delta)
    y_max = Math.max(...data[0].y)/grid_delta
    for (var i = y_min; i < y_max; i++) {
        for (var j = 0; j < x_lims; j++) {
            shapes.push({
                type:'rect',
                layer: 'below',
                x0: 0+(j*grid_delta),
                y0: 0+(i*grid_delta),
                x1: grid_delta+(j*grid_delta),
                y1: grid_delta+(i*grid_delta),
                line: {
                    color: 'rgb(255, 212, 212)',
                    width: 1
                }
            })
        }
    }

    layout = {
        height: 600,
        title: 'Sample ECG Data',
        xaxis: {
            title: 'Time (s)',
            rangeslider: {},
            dtick: 0.2,
            gridcolor: 'rgb(255, 60, 60)',
            gridwidth: 1
        },
        yaxis: {
            title: 'Electric Potential (mV)',
            fixedrange: true,
            dtick: 0.2,
            gridcolor: 'rgb(255, 60, 60)',
            gridwidth: 1
        },
        shapes: shapes
    };

    Plotly.newPlot("chart", data, layout); 

}

parseData(createGraph)
