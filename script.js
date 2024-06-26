document.addEventListener("DOMContentLoaded", function () {
    // Initialize map
    var map = L.map("map", {
        scrollWheelZoom: false
    }).setView([51.505, -0.09], 4);
    map.createPane("labels");
    map.getPane("labels").style.zIndex = 450;
    map.getPane("labels").style.pointerEvents = "none";

    // Add tile layer without labels
    L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        {
            attribution: "©OpenStreetMap, ©CartoDB",
        }
    ).addTo(map);

    // Add a label layer in a separate pane for better control
    var positronLabels = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
        {
            attribution: "©OpenStreetMap, ©CartoDB",
            pane: "labels",
        }
    ).addTo(map);

    // Load GeoJSON and add interactivity
    var geoJson = L.geoJson(euData, {
        // Ensure that `euData` is correctly referenced
        style: function (features) {
            return {
                fillColor: getColor(features.properties.NAME), // Adjust color based on some property
                weight: 1,
                opacity: 1,
                color: "white",
                dashArray: "3",
                fillOpacity: 0.5,
            };
        },
        onEachFeature: function (features, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: function (e) {
                    selectCountry(e, features.properties.NAME); // Pass country name on click
                },
            });
        },
    }).addTo(map);

    // Function to highlight the feature on mouseover
    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 1,
            color: "#666",
            dashArray: "",
            fillOpacity: 0.8,
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    // Function to reset highlight on mouseout
    function resetHighlight(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.5,
        });
    }

    // Function to select a country and update dropdown
    function selectCountry(e, countryName) {
        var select = document.getElementById("countrySelect");
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].text === countryName) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event("change"));
                break;
            }
        }
    }

    // Fetching data and updating charts
    function fetchData() {
        var country = document.getElementById("countrySelect").value;
        var year = document.getElementById("yearSelect").value;
        var product = document.getElementById("productSelect").value;
        var url = `server.php?country=${encodeURIComponent(
            country
        )}&year=${encodeURIComponent(year)}&product=${encodeURIComponent(product)}`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                updateBarChart(data.monthlyData);
                updatePieChart(data.categoryData);
            })
            .catch((error) => console.error("Error:", error));
    }

    document.getElementById("countrySelect").addEventListener("change", fetchData);
    document.getElementById("yearSelect").addEventListener("change", fetchData);
    document.getElementById("productSelect").addEventListener("change", fetchData);

    // Ensure that the page is fully loaded before initializing map and fetching data
    window.onload = function () {
        fetchData();
    };

    // Color picker function for the map
    function getColor(d) {
        return d === 'Croatia' ||
            d === 'France' ||
            d === 'Italy' ||
            d === 'Portugal' ||
            d === 'Slovenia' ||
            d === 'Spain' ||
            d === 'Switzerland'
            ? '#34a853'
            : d === 'Germany' || d === 'Belgium' || d === 'Netherlands'
                ? '#f18d00'
                : d === 'Czech Republic' ||
                    d === 'Greece' ||
                    d === 'Hungary' ||
                    d === 'Poland'
                    ? '#673ab7'
                    : d === 'United Kingdom'
                        ? '#e91e63'
                        : d === 'Denmark' ||
                            d === 'Sweden' ||
                            d === 'Estonia' ||
                            d === 'Finland' ||
                            d === 'Latvia' ||
                            d === 'Lithuania' ||
                            d === 'Norway'
                            ? '#4a80f5'
                            : '#bdbdbd'
    }

    // Create overlay layers
    var AntwerpenP = L.marker([51.29999, 4.30758]).bindPopup("Antwerpen Production");
    var WroclavP = L.marker([51.11862, 16.99842]).bindPopup("Wrocłav Productions");
    var LyonP = L.marker([45.75555, 4.76737]).bindPopup("Lyon Productions");
    var AntwerpenDC = L.marker([51.2999, 4.30758]).bindPopup("Antwerpen Distribution Center");
    var WroclavDC = L.marker([51.11862, 16.99842]).bindPopup("Wrocłav Distribution Center");
    var LyonDC = L.marker([45.75555, 4.76737]).bindPopup("Lyon Distribution Center");
    var BirminghamDC = L.marker([52.42853, -1.89877]).bindPopup("Birmingham Distribution Center");
    var GoteborgDC = L.marker([57.72338, 11.85666]).bindPopup("Göteborg Distribution Center");

    var Plants = L.layerGroup([AntwerpenP, WroclavP, LyonP]);
    var DistC = L.layerGroup([AntwerpenDC, WroclavDC, LyonDC, BirminghamDC, GoteborgDC]);
    var overlayMaps = {
        "Distribution Centers": DistC,
        "Production Plants": Plants,
    };

    // Add the layer control element to map
    var layerControl = L.control.layers(null, overlayMaps);
    layerControl.addTo(map);

    // Adjust the z-index of the layer control to ensure it appears on top
    var layerControlContainer = layerControl.getContainer();
    layerControlContainer.style.zIndex = "1000";
});