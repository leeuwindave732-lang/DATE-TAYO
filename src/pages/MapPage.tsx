import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../supabaseClient";

interface UserLocation {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
}
const center: LatLngExpression = [14.5995, 120.9842]; 

const MapPage: React.FC = () => {
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    useEffect(() =>{
        const fetchLocations = async () => {
            const { data, error } = await supabase
            .from("user_locations")
            .select("*");

            if (!error && data) {
                setLocations(data);
            }
        };

        fetchLocations();
    }, []);

    return (
        <div className="map-wrapper">
            {isClient && (
            <MapContainer 
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {locations.map((user) => (
                    <Marker key={user.id} position={[user.latitude, user.longitude] as LatLngExpression}>
                        <Popup>{user.name}</Popup>
                    </Marker>
                ))}            
            </MapContainer>
            )}
        </div>
        );
    };

export default MapPage;