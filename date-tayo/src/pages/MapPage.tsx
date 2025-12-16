import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface UserPin {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
}

const MapPage: React.FC = () => {
    const [pins, setPins] = useState<UserPin[]>([]);

    useEffect(() => {
    //FETCH PINS FROM SUPABASE 
    setPins([
        { id: '1', latitude: 14.5995, longitude: 120.9842, name: 'Marjorie' },
        { id: '2', latitude: 14.6095, longitude: 120.9842, name: 'Leeuwin' },
    ]);
    },
    []);

    return (
        <div className="min-h-screen">
            <MapContainer center={[14.5995, 120.9842]} zoom={13} className="h-screen w-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                {pins.map((pin) => (
                    <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
                        <Popup>{pins.name}</Popup>
                    </Marker>
                ))}            
            </MapContainer>
        </div>
        );
    };

export default MapPage;