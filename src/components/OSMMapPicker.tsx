import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({ onPositionChange }: { onPositionChange: (pos: {lat: number, lng: number}) => void }) {
    useMapEvents({
        click(e) {
            onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export function OSMMapPicker({ position, onPositionChange, onAddressFound }: { 
    position: {lat: number, lng: number} | null, 
    onPositionChange: (pos: {lat: number, lng: number}) => void,
    onAddressFound: (address: {location: string, city: string, state: string, pincode: string}) => void
}) {
    return (
        <MapContainer 
            center={position || [28.6139, 77.2090] as [number, number]} 
            zoom={12} 
            style={{ width: '100%', height: '300px', borderRadius: '1rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && (
                <Marker position={[position.lat, position.lng] as [number, number]} />
            )}
            <MapEvents onPositionChange={onPositionChange} />
        </MapContainer>
    );
}
