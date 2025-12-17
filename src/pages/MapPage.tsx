import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { supabase } from "../supabaseClient";
import "leaflet/dist/leaflet.css";
import "../leafletFix"; // make sure leafletFix exists

interface UserLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

const DEFAULT_CENTER: LatLngExpression = [14.5995, 120.9842]; // Manila

const MapPage: React.FC = () => {
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [isClient, setIsClient] = useState(false);

    // ensure map only renders on client
    useEffect(() => setIsClient(true), []);

    // fetch user locations from Supabase
    useEffect(() => {
        const fetchLocations = async () => {
            const { data, error } = await supabase
                .from("user_locations")
                .select("*");
            if (error) console.error("Supabase fetch error:", error);
            else if (data) setLocations(data);
        };
        fetchLocations();
    }, []);

    if (!isClient) return null;

    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    padding: "1rem",
                    fontSize: "1.8rem",
                    fontWeight: "bold",
                }}
            >
                Date Tayo Map
            </h1>

            <div style={{ flexGrow: 1 }}>
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {locations.map((user) => (
                        <Marker
                            key={user.id}
                            position={[user.latitude, user.longitude] as LatLngExpression}
                        >
                            <Popup>
                                <strong>{user.name}</strong>
                                <br />
                                Lat: {user.latitude}, Lng: {user.longitude}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
