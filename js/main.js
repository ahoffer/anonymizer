//Contents of the file to be obfuscated.
var input = null;
var fields = null;
var file = null;
var piiData = [];
var anonymousData = [];

function loadFile(files) {
    if (files.length < 1 && !file) {
        alert("Please choose at least one file to parse.");
        return
    }

    //Set accessible variable.
    file = files[0];

    Papa.parse(file, {
        header: true,
        error: function (err, file) {
            console.log("ERROR:", err, file);
            alerts('Error logged to console.')
        },
        complete: function (results) {
            input = results;
            fields = input.meta.fields;
            populateHeaderList('checkbox', '50px')
        }
    });
}

function populateHeaderList(type, leftMarg, callback) {
    var div = document.getElementById('header-list');
    div.style.marginLeft = leftMarg;

    //'Clear' the dev element
    div.innerHTML = '';

    fields.forEach(function (each) {
        // create the necessary elements
        var label = document.createElement("label");
        var description = document.createTextNode(each);
        var control = document.createElement("input");
        control.type = type;    // make the element a checkbox
        control.name = 'headers';      // give it a name we can check
        control.setAttribute("header", each);
        if (callback) {
            control.onclick = function () {
                callback(this);
            };
        }

        label.appendChild(control);   // add the box to the element
        label.appendChild(description);// add the description to the element

        //Add the label element to the div
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
    });
}

function getPiiHeaders() {
    return _.chain(document.getElementsByName('headers'))
        .select(function (element) { return element.checked})
        .map(function (element) {return element.getAttribute('header')})
        .value();
}

function createAnonData() {
    var pii = getPiiHeaders();
    _.each(input.data, function (row) {
        piiRow = _.pick(row, pii);
        anonRow = _.omit(row, pii);
        piiRow.ANONYMOUS = anonRow.ANONYMOUS = getUUID();
        piiData.push(piiRow);
        anonymousData.push(anonRow);
    });
}

function anonymize() {
    createAnonData();
    var type = {type: "text/plain;charset=utf-8"};
    saveAs(new Blob([Papa.unparse(piiData)], type), "anonymous_map.csv");
    saveAs(new Blob([Papa.unparse(anonymousData)], type), "anonymous_data.csv");
}

function getUUID() {
    //Credit for this goes to http://stackoverflow.com/a/2117523/290962
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



