// Select the desired input file
input_files = ['demo_ecg1.csv', 'demo_ecg2.csv'];
all_results = [];
data = [];
shapes = [];

function parseData(createGraph) {

    for (var k = 0; k < input_files.length; k++) {
        Papa.parse(input_files[k], {
            download: true,
            complete: function(results) {
                all_results.push(results);
                if (all_results.length == input_files.length) {
                    console.log('Done');
                    createGraph(all_results)
                }
            }
        });
    }
}

function createGraph(all_results) {
    // Line Plot.. start_at is the start of actual data in the CSV
    start_at = 0;
    graphish = [];
    sig_names = ['II', 'V'];
    units = ['mV', 'mV'];
    layout = {
        height: 800,
        title: 'Sample ECG Data',
        grid: {
            rows: input_files.length,
            columns: 1,
            pattern: 'independent'
        },
        showlegend: false
    };

    for (var i = 0; i < all_results.length; i++) {

        index = [];
        signal = [];
        temp_data = all_results[i].data;
        if (i > 0 ) {
            x_string = 'x' + (i+1).toString();
            y_string = 'y' + (i+1).toString();
            x_axis = 'xaxis' + (i+1).toString();
            y_axis = 'yaxis' + (i+1).toString();
        } else {
            x_string = 'x';
            y_string = 'y';
            x_axis = 'xaxis'
            y_axis = 'yaxis'
        }

        for (var j = start_at; j < temp_data.length; j++) {

            fs = 250;
            index.push(j / fs);
            signal.push(temp_data[j][0]);

            var trace = {
                x: index,
                y: signal,
                xaxis: x_string,
                yaxis: y_string,
                row: i+1,
                column: 1,
                type: 'scatter',
                line: {
                    color: 'black',
                    width: 3
                }
            };
        }
        graphish.push(trace);

        grid_delta = 0.04
        x_max = Math.ceil(Math.max(...graphish[i].x)/grid_delta)
        y_min = Math.floor(Math.min(...graphish[i].y)/grid_delta)-1
        y_max = Math.ceil(Math.max(...graphish[i].y)/grid_delta)+1

        for (var j = y_min; j < y_max; j++) {
            shapes.push({
                type:'rect',
                layer: 'below',
                xref: x_string,
                yref: y_string,
                x0: 0,
                x1: x_max*grid_delta,
                y0: 0+(j*grid_delta),
                y1: grid_delta+(j*grid_delta),
                line: {
                    color: 'rgb(255, 212, 212)',
                    width: 1
                }
            })
        }

        for (var j = 0; j < x_max; j++) {
            shapes.push({
                type:'rect',
                layer: 'below',
                xref: x_string,
                yref: y_string,
                x0: 0+(j*grid_delta),
                x1: grid_delta+(j*grid_delta),
                y0: y_min*grid_delta,
                y1: y_max*grid_delta,
                line: {
                    color: 'rgb(255, 212, 212)',
                    width: 1
                }
            })
        }

        layout[x_axis] = {
            title: 'Time (s)',
            dtick: 0.2,
            gridcolor: 'rgb(255, 60, 60)',
            gridwidth: 1
        }
        layout[y_axis] = {
            title: sig_names[i] + ' (' + units[i] + ')',
            fixedrange: true,
            dtick: 0.2,
            gridcolor: 'rgb(255, 60, 60)',
            gridwidth: 1
        }

        data.push(graphish);

    }

    layout['shapes'] = shapes;
    Plotly.newPlot("chart", data[0], layout); 

}

parseData(createGraph)
