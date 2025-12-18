import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { supabase } from "../supabaseClient";
import "leaflet/dist/leaflet.css";
import "../leafletFix";

interface UserLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

const DEFAULT_CENTER: LatLngExpression = [14.5995, 120.9842];

const Locations: React.FC = () => {
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [newMarker, setNewMarker] = useState<LatLngExpression | null>(null);
    const [userName, setUserName] = useState(""); // User name input

    // Fetch existing locations from Supabase
    useEffect(() => {
        const fetchLocations = async () => {
            const { data, error } = await supabase.from("user_locations").select("*");
            if (error) console.error(error);
            else if (data) setLocations(data);
        };
        fetchLocations();
    }, []);

    // Component to handle clicks on map
    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setNewMarker([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    // Function to save new marker to Supabase
    const saveLocation = async () => {
        if (!newMarker || !userName.trim()) {
            alert("Please enter your name and select a location.");
            return;
        }

        const [lat, lng] = newMarker as [number, number];
        const { data, error } = await supabase
            .from("user_locations")
            .insert([{ name: userName, latitude: lat, longitude: lng }])
            .select();

        if (error) {
            console.error(error);
            alert("Failed to save location");
        } else if (data) {
            setLocations((prev) => [...prev, data[0]]);
            setNewMarker(null);
            setUserName("");
            alert("Location pinned successfully!");
        }
    };

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Input form */}
            <div className="p-4 bg-lightGray flex flex-col sm:flex-row gap-2 items-center">
                <input
                    type="text"
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="px-4 py-2 border rounded-md flex-1"
                />
                <button
                    onClick={saveLocation}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accentHover transition-colors"
                >
                    Pin Location
                </button>
            </div>

            {/* Map */}
            <div className="flex-1 w-full">
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={13}
                    scrollWheelZoom
                    className="w-full h-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler />

                    {/* Existing locations */}
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

                    {/* New marker preview */}
                    {newMarker && (
                        <Marker position={newMarker as LatLngExpression}>
                            <Popup>New location. Click "Pin Location" to save.</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default Locations;
