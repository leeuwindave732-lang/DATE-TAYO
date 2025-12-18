import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImages } from "../utils/compressImage";
import { uploadImage } from "../utils/uploadImage";
import Button from "../components/Button";
import Input from "../components/input";
import {
  Home,
  MapPin,
  MessageCircle,
  Settings,
  Plus,
  Grid,
} from "lucide-react";

interface ProfileImage {
  id: string;
  image_url: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<ProfileImage[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate("/auth");
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      const { data: images } = await supabase
        .from("profile_images")
        .select("*")
        .eq("profile_id", user.id);

      if (images) setGallery(images);
    };

    loadProfile();
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const url = await uploadImage(file, `${user.id}/avatar.jpg`);
      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      setAvatarUrl(url);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setLoading(true);
    try {
      const compressed = await compressImages(files);
      const inserted: ProfileImage[] = [];

      for (const file of compressed) {
        const url = await uploadImage(
          file,
          `${user.id}/gallery/${crypto.randomUUID()}.jpg`
        );
        const { data } = await supabase
          .from("profile_images")
          .insert({ profile_id: user.id, image_url: url })
          .select()
          .single();
        if (data) inserted.push(data);
      }

      setGallery((prev) => [...prev, ...inserted]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#9CAF88] text-black font-main flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/20 p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Date Tayo</h1>

        <nav className="flex flex-col gap-3">
          <button className="flex items-center gap-3 hover:opacity-70">
            <Home size={20} /> Home
          </button>
          <button className="flex items-center gap-3 hover:opacity-70">
            <MapPin size={20} /> Add locations
          </button>
          <button className="flex items-center gap-3 hover:opacity-70">
            <MessageCircle size={20} /> Messages
          </button>
        </nav>

        <div className="mt-auto flex items-center gap-3 cursor-pointer hover:opacity-70">
          <Settings size={20} /> Settings
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">
        {/* Header */}
        <div className="flex items-center gap-8 mb-10">
          <div className="relative">
            {avatarUrl && (
              <img
                src={avatarUrl}
                className="w-32 h-32 rounded-full object-cover border-2 border-black"
              />
            )}
            <label className="absolute bottom-0 right-0 bg-white border border-black rounded-full p-1 cursor-pointer">
              <Plus size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{name || "username"}</h2>
              <Button
                label="Edit profile"
                className="bg-white text-black border border-black"
              />
            </div>
            <p className="max-w-md">{bio || "No bio yet"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 border-t border-black/30 pt-4 mb-6">
          <Grid size={18} /> <span className="font-medium">Posts</span>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-3 gap-4">
          {gallery.map((img) => (
            <img
              key={img.id}
              src={img.image_url}
              className="aspect-square object-cover border border-black"
            />
          ))}
        </div>

        {/* Upload */}
        <div className="mt-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleGalleryUpload(e.target.files)}
          />
        </div>

        {/* Logout */}
        <div className="mt-10">
          <Button
            label="Logout"
            onClick={logout}
            className="bg-white text-black border border-black"
          />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;