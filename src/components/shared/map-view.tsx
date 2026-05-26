import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoiModel } from "@/types/map";

// Fix Leaflet default marker icon paths in bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapBoundsUpdater({ pois }: { pois: MapPoiModel[] }) {
  const map = useMap();

  useEffect(() => {
    if (pois.length === 0) return;
    const valid = pois.filter((p) => p.latitude && p.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(
      valid.map((p) => [p.latitude, p.longitude] as L.LatLngTuple),
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [pois, map]);

  return null;
}

interface MapViewProps {
  pois: MapPoiModel[];
  onMarkerClick?: (poi: MapPoiModel) => void;
  className?: string;
}

export function MapView({ pois, onMarkerClick, className }: MapViewProps) {
  const defaultCenter: L.LatLngTuple = [34.23, 108.96]; // Xi'an area

  return (
    <div className={className}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="w-full h-full rounded-2xl"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater pois={pois} />
        {pois
          .filter((p) => p.latitude && p.longitude)
          .map((poi) => (
            <Marker
              key={poi.id ?? `${poi.latitude}-${poi.longitude}`}
              position={[poi.latitude, poi.longitude]}
              eventHandlers={{
                click: () => onMarkerClick?.(poi),
              }}
            >
              <Popup>
                <div className="min-w-[160px]">
                  <h3 className="font-semibold text-sm">{poi.name}</h3>
                  {poi.category && (
                    <p className="text-xs text-muted-foreground mt-0.5">{poi.category}</p>
                  )}
                  {poi.address && (
                    <p className="text-xs mt-1">{poi.address}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {poi.latitude.toFixed(6)}, {poi.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
