import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../leafletFix";
import { FaUser, FaCog } from "react-icons/fa";
import SearchBar from "../components/SearchBar";


interface ProfileLocation {
  id: string;
  name: string;
  avatar_url: string | null;
  profile_images: { image_url: string }[];
  latitude: number;
  longitude: number;
}


const DEFAULT_CENTER: LatLngExpression = [14.5995, 120.9842];


const FitBounds: React.FC<{ locations: ProfileLocation[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (!locations.length) return;
    const bounds = locations.map(
      (l) => [l.latitude, l.longitude] as LatLngExpression
    );
    map.fitBounds(bounds as LatLngBoundsExpression, {
      padding: [50, 50],
    });
  }, [locations, map]);

  return null;
};



const HomePage: React.FC = () => {
  const [locations, setLocations] = useState<ProfileLocation[]>([]);
  const [filtered, setFiltered] = useState<ProfileLocation[]>([]);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setIsClient(true), []);

  /* ===== FETCH PROFILES + LOCATION ===== */
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          avatar_url,
          profile_images ( image_url ),
          user_locations ( latitude, longitude )
        `);

      if (error) {
        console.error(error);
        return;
      }

      const mapped: ProfileLocation[] =
        data
          ?.filter((p: any) => p.user_locations)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            avatar_url: p.avatar_url,
            profile_images: p.profile_images ?? [],
            latitude: p.user_locations.latitude,
            longitude: p.user_locations.longitude,
          })) ?? [];

      setLocations(mapped);
      setFiltered(mapped);
    };

    fetchProfiles();
  }, []);

  const handleSearch = (query: string) => {
    setFiltered(
      locations.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  if (!isClient) return null;

  return (
    <div className="relative w-full h-screen font-main flex flex-col bg-white">

      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#7C8F7A] text-white shadow-md">
        <h1 className="font-bold text-lg sm:text-xl">Date Tayo</h1>

        <div className="flex-1 px-4 hidden sm:block">
          <SearchBar onSearch={handleSearch} placeholder="Search people…" />
        </div>

        <div className="flex items-center gap-4">
          <FaUser
            className="text-xl cursor-pointer"
            onClick={() => navigate("/profile")}
          />
          <FaCog className="text-xl cursor-pointer" />
        </div>
      </header>

      <main className="flex-1 w-full mt-[64px]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          scrollWheelZoom
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {filtered.map((user) => (
            <Marker
              key={user.id}
              position={[user.latitude, user.longitude]}
            >
              <Popup>
                <div className="w-52">

                  {user.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-28 object-cover rounded mb-2"
                    />
                  )}

                  <h2
                    className="font-bold text-lg cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    {user.name}
                  </h2>

                  {user.profile_images.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {user.profile_images.map((img, i) => (
                        <img
                          key={i}
                          src={img.image_url}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          <FitBounds locations={filtered} />
        </MapContainer>
      </main>
    </div>
  );
};

export default HomePage;
