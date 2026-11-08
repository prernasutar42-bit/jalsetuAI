# Maharashtra District GeoJSON Boundary Instructions

FloodWatch supports rendering official polygonal district boundaries on the interactive Leaflet map.

## Where to Download GeoJSON
You can obtain high-quality, open-source GeoJSON boundaries for all 36 Maharashtra districts from official and community GIS repositories:

1. **Datameet Maps Maharashtra**:
   - Repository: [https://github.com/datameet/maps/tree/master/Districts](https://github.com/datameet/maps/tree/master/Districts)
   - Or direct file: `maharashtra_districts.geojson`
2. **OpenStreetMap / GeoData**:
   - Search for administrative level 5 boundary polygons for Maharashtra State.

## Installation Steps
1. Download or save the GeoJSON file into this directory as:
   `backend/app/data/maharashtra_districts.geojson`
2. Run the geometry seeding script:
   ```bash
   python -m backend.app.data.seed_geojson
   ```
3. The script will match district names (accounting for recent revisions like Chhatrapati Sambhajinagar / Aurangabad, Dharashiv / Osmanabad, Ahilyanagar / Ahmednagar), simplify high-vertex polygons for fast web rendering, and save the polygon coordinates directly into `zones.geometry`.
4. If no GeoJSON is present, FloodWatch automatically falls back to proportional circle markers centered on the approximate district centroids.
