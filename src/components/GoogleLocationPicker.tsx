import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary, MapControl, ControlPosition } from '@vis.gl/react-google-maps';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function GoogleLocationPicker({ position, onPositionChange, onAddressFound }: { 
    position: {lat: number, lng: number} | null, 
    onPositionChange: (pos: {lat: number, lng: number}) => void,
    onAddressFound: (address: {location: string, city: string, state: string, pincode: string}) => void
}) {
    if (!hasValidKey) {
        return (
          <div className="flex items-center justify-center h-64 bg-luxury-surface/50 border border-luxury-border rounded-2xl p-4 text-center">
            <p className="text-luxury-text">Google Maps API key required for location selection.</p>
          </div>
        );
    }

    return (
        <APIProvider apiKey={API_KEY} version="weekly">
            <Map
                center={position || { lat: 28.6139, lng: 77.2090 }}
                zoom={12}
                mapId="PROPERTY_LOCATION_MAP"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{width: '100%', height: '300px', borderRadius: '1rem'}}
                onClick={(e) => {
                    if (e.detail.latLng) {
                        onPositionChange(e.detail.latLng);
                        // Reverse geocoding would usually happen here
                    }
                }}
            >
                {position && (
                    <AdvancedMarker position={position}>
                        <Pin background="#FFB627" glyphColor="#000" />
                    </AdvancedMarker>
                )}
            </Map>
        </APIProvider>
    );
}
