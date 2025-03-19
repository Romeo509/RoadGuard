import React, { useEffect, useRef, useState } from "react";

const MapPage = () => {
  const mapRef = useRef(null);
  const miniMapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      console.log("Initializing map...");

      // Add Leaflet script dynamically
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement("script");
      leafletJS.src = "https://unpkg.com/leaflet/dist/leaflet.js";
      leafletJS.async = true;
      leafletJS.onload = () => {
        console.log("Leaflet loaded!");

        // Initialize the main map
        mapRef.current = L.map("map").setView([7.9465, -1.0232], 7); // Centered on Ghana

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapRef.current);

        console.log("Map initialized!");

        // Fetch locations from the server
        fetch("http://localhost:3000/locations")
          .then((res) => res.json())
          .then((data) => {
            setLocations(data); // Save locations in state
            addMarkers(data); // Add markers to the map
          })
          .catch((error) => console.error("Error fetching locations:", error));
      };

      document.body.appendChild(leafletJS);
    }
  }, []);

  const addMarkers = (locations) => {
    locations.forEach((location) => {
      const { lat, lon } = location.location;
      const description = location.description;
      const imagePath = `http://localhost:3000/${location.imagePath}`;

      // Create a marker
      const marker = L.marker([lat, lon]).addTo(mapRef.current);

      // Add a tooltip with the image on hover
      marker.bindTooltip(
        `<img src="${imagePath}" alt="${description}" style="width: 100px; height: auto; border-radius: 5px;" />`,
        {
          permanent: false, // Show only on hover
          direction: "top", // Position the tooltip above the marker
          className: "custom-tooltip", // Add a custom class for styling
        }
      );

      // Add a click event to show details in the right container
      marker.on("click", () => {
        setSelectedLocation({ lat, lon, description, imagePath });
        showMiniMap(lat, lon);
      });
    });
  };

  const showMiniMap = (lat, lon) => {
    if (!miniMapRef.current) {
      miniMapRef.current = L.map("mini-map").setView([lat, lon], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(miniMapRef.current);
    } else {
      miniMapRef.current.setView([lat, lon], 14);
    }

    L.marker([lat, lon]).addTo(miniMapRef.current);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Main Map Container */}
      <div style={styles.mapContainer}>
        <h2>📍 Saved Locations</h2>
        <div id="map" style={styles.map}></div>
      </div>

      {/* Right Container for Selected Location Info */}
      <div style={styles.infoContainer}>
        {selectedLocation ? (
          <>
            <h3>📌 Selected Location</h3>
            <img
              src={selectedLocation.imagePath}
              alt="Location"
              style={styles.image}
            />
            <p style={styles.description}>{selectedLocation.description}</p>
            <div id="mini-map" style={styles.miniMap}></div>
          </>
        ) : (
          <p>Select a location to view details</p>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  pageContainer: {
    display: "flex",
    gap: "50px",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  mapContainer: {
    flex: 2,
  },
  map: {
    height: "500px",
    width: "100%",
    marginTop: "20px",
    borderRadius: "10px",
    border: "2px solid #333",
  },
  infoContainer: {
    flex: 1,
    padding: "20px",
    borderRadius: "10px",
    border: "2px solid #333",
    textAlign: "center",
  },
  miniMap: {
    height: "200px",
    width: "100%",
    marginTop: "10px",
    borderRadius: "10px",
    border: "2px solid #333",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  description: {
    marginTop: "10px",
    fontWeight: "bold",
  },
};

export default MapPage;
