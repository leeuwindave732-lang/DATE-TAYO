import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "../utils/compressImage";
import { uploadImage } from "../utils/uploadImage";
import Button from "../components/Button";
import { Home, MapPin, MessageCircle, Settings, Plus, Grid, Bookmark } from "lucide-react";

interface ProfileImage {
    id: string;
    image_url: string;
}

interface GalleryFile {
    file: File | null;
    preview: string;
    id?: string; // existing images from Supabase will have an ID
}

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [gallery, setGallery] = useState<GalleryFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) return navigate("/auth");

            const user = data.user;
            setUser(user);

            // Load profile info
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

            // Load gallery
            const { data: images } = await supabase
                .from("profile_images")
                .select("*")
                .eq("profile_id", user.id);

            if (images) {
                setGallery(
                    images.map((img: ProfileImage) => ({
                        file: null,
                        preview: img.image_url,
                        id: img.id,
                    }))
                );
            }
        };

        loadProfile();
    }, [navigate]);

    // Avatar selection
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);

            // Revoke old URL if exists
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);

            setAvatarFile(compressed);
            setAvatarUrl(URL.createObjectURL(compressed));
        } catch (err) {
            console.error("Avatar compression failed:", err);
            setMessage({ text: "Failed to compress avatar.", type: "error" });
        }
    };

    // Gallery selection
    const handleGalleryChange = async (files: FileList | null) => {
        if (!files) return;
        try {
            const compressedFiles = await compressImages(files);
            const newGallery: GalleryFile[] = compressedFiles.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setGallery((prev) => [...prev, ...newGallery]);
        } catch (err) {
            console.error("Gallery compression failed:", err);
            setMessage({ text: "Failed to compress gallery images.", type: "error" });
        }
    };

    // Remove gallery image
    const removeGalleryImage = (index: number) => {
        const updated = [...gallery];
        const removed = updated.splice(index, 1)[0];
        if (removed.preview && removed.file) URL.revokeObjectURL(removed.preview);
        setGallery(updated);
    };

    const saveProfile = async () => {
        if (!user) return;
        setLoading(true);
        setMessage(null);

        try {
            let avatarLink = avatarUrl;

            // Upload avatar if changed
            if (avatarFile) {
                const uploadedAvatar = await uploadImage(avatarFile, `${user.id}/avatar`);
                avatarLink = uploadedAvatar.url; // use .url
            }

            // Upsert profile info
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: user.id,
                name,
                bio,
                avatar_url: avatarLink,
            });
            if (profileError) throw profileError;

            // Upload gallery images
            const uploads: { profile_id: string; image_url: string }[] = [];
            for (const item of gallery) {
                if (item.file) {
                    const uploadedImage = await uploadImage(
                        item.file,
                        `${user.id}/gallery/${crypto.randomUUID()}`
                    );
                    uploads.push({ profile_id: user.id, image_url: uploadedImage.url }); // use .url
                }
            }

            if (uploads.length > 0) {
                const { error: galleryError } = await supabase.from("profile_images").insert(uploads);
                if (galleryError) console.error("Gallery insert failed:", galleryError);
            }

            setMessage({ text: "Profile updated successfully!", type: "success" });
            navigate("/profile-page");
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to update profile.", type: "error" });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 5000); // auto-hide message
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#9CAF88] text-black font-main flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="hidden md:flex md:w-64 bg-[#9CAF88] border-r border-white/60 p-6 flex-col">
                <h1 className="text-2xl font-bold mb-8">Date Tayo</h1>
                <nav className="flex flex-col gap-2">
                    {[{ icon: Home, label: "Home" }, { icon: MapPin, label: "Add locations" }, { icon: MessageCircle, label: "Messages" }].map(({ icon: Icon, label }) => (
                        <button key={label} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white text-black border border-black hover:bg-black hover:text-white transition">
                            <Icon size={20} /> {label}
                        </button>
                    ))}
                </nav>
                <button className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl bg-white text-black border border-black hover:bg-black hover:text-white transition">
                    <Settings size={20} /> Settings
                </button>
            </aside>

            {/* Main */}
            <main className="flex-1 w-full px-4 sm:px-6 md:px-12 lg:px-16 py-6 md:py-10">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10">
                    <div className="relative">
                        <img src={avatarUrl || ""} className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-lg" />
                        <label className="absolute bottom-1 right-1 bg-white border border-black rounded-full p-2 cursor-pointer">
                            <Plus size={14} />
                            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                        </label>
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h2 className="text-xl sm:text-2xl font-semibold">{name || "username"}</h2>
                            <Button label={loading ? "Saving..." : "Save Profile"} className="bg-sage-300 text-black border border-black w-full sm:w-auto" onClick={saveProfile} disabled={loading} />
                        </div>
                        <div className="flex justify-center sm:justify-start gap-6 text-sm">
                            <span><b>{gallery.length}</b> posts</span>
                            <span><b>0</b> followers</span>
                            <span><b>0</b> following</span>
                        </div>
                        <p className="max-w-lg text-sm leading-relaxed">{bio || "No bio yet"}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-10 border-t border-white/60 pt-4 mb-6 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <Grid size={16} /> POSTS
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                        <Bookmark size={16} /> SAVED
                    </div>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {gallery.map((img, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden border-2 border-white bg-white">
                            <img src={img.preview} className="w-full h-full object-cover group-hover:scale-105 transition" />
                            {img.file && (
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(i)}
                                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Upload */}
                <div className="mt-8">
                    <input type="file" multiple accept="image/*" onChange={(e) => handleGalleryChange(e.target.files)} />
                </div>

                {/* Messages */}
                {message && (
                    <div className={`text-center text-sm font-medium p-2 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-black text-white"} mt-4`}>
                        {message.text}
                    </div>
                )}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-black flex justify-around py-3">
                <Home size={22} />
                <MapPin size={22} />
                <MessageCircle size={22} />
                <Settings size={22} />
            </nav>
        </div>
    );
};

export default ProfilePage;
