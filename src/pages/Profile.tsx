import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "../utils/compressImage";
import { uploadImage } from "../utils/uploadImage";
import Input from "../components/input";
import Button from "../components/Button";

interface GalleryFile {
    file: File | null;
    preview: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<GalleryFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

    const navigate = useNavigate();

    // Load user and profile
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return navigate("/auth");
            setUser(user);

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setName(profile.name || "");
                setBio(profile.bio || "");
                setAvatarPreview(profile.avatar_url || null);
            }

            const { data: gallery } = await supabase
                .from("profile_images")
                .select("*")
                .eq("profile_id", user.id);

            if (gallery) {
                const galleryFiles = gallery.map((img: any) => ({
                    file: null,
                    preview: img.image_url,
                }));
                setGalleryFiles(galleryFiles);
            }
        };

        loadUser();
    }, [navigate]);

    // Handle avatar selection
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            setAvatarFile(compressed);
            setAvatarPreview(URL.createObjectURL(compressed));
        } catch (err) {
            console.error("Avatar compression failed:", err);
            setMessage({ text: "Failed to compress avatar.", type: "error" });
        }
    };

    // Handle gallery selection
    const handleGalleryChange = async (files: FileList | null) => {
        if (!files) return;

        try {
            const compressed = await compressImages(files);
            const newGallery = compressed.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            setGalleryFiles((prev) => [...prev, ...newGallery]);
        } catch (err) {
            console.error("Gallery compression failed:", err);
            setMessage({ text: "Failed to compress gallery images.", type: "error" });
        }
    };

    // Remove gallery image
    const removeGalleryImage = (index: number) => {
        const updated = [...galleryFiles];
        const removed = updated.splice(index, 1)[0];
        if (removed.preview && removed.file) URL.revokeObjectURL(removed.preview);
        setGalleryFiles(updated);
    };

    // Save profile
    const saveProfile = async () => {
        if (!user) return;
        setLoading(true);
        setMessage(null);

        try {
            // 1️⃣ Upload avatar
            let avatarUrl = avatarPreview;
            if (avatarFile) {
                const uploaded = await uploadImage(avatarFile, `${user.id}/avatar.${avatarFile.name.split(".").pop()}`);
                avatarUrl = uploaded.url;
            }

            // 2️⃣ Upsert profile
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: user.id,
                name,
                bio,
                avatar_url: avatarUrl,
            });
            if (profileError) throw profileError;

            // 3️⃣ Upload gallery
            const galleryUploads: { profile_id: string; image_url: string }[] = [];
            for (const item of galleryFiles) {
                if (item.file) {
                    const uploaded = await uploadImage(item.file, `${user.id}/gallery/${crypto.randomUUID()}.${item.file.name.split(".").pop()}`);
                    galleryUploads.push({ profile_id: user.id, image_url: uploaded.url });
                }
            }

            if (galleryUploads.length > 0) {
                const { error: galleryError } = await supabase.from("profile_images").insert(galleryUploads);
                if (galleryError) console.error("Gallery insert failed:", galleryError);
            }

            setAvatarPreview(avatarUrl);
            setMessage({ text: "Profile saved!", type: "success" });

            // Redirect to ProfilePage
            navigate("/profile-page");
        } catch (err: any) {
            console.error(err);
            setMessage({ text: "Failed to save profile.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-white flex justify-center items-start py-12 font-main">
            <div className="w-full max-w-sm bg-[#9CAF88] rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-black text-center">Profile</h1>

                {message && (
                    <div className={`text-center text-sm font-medium p-2 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-black text-white"}`}>
                        {message.text}
                    </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    {avatarPreview && <img src={avatarPreview} className="w-24 h-24 rounded-full object-cover border-2 border-black" />}
                    <input type="file" accept="image/*" className="text-black" onChange={handleAvatarChange} />
                </div>

                {/* Name */}
                <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border-2 border-black rounded-md text-black bg-white" />

                {/* Bio */}
                <textarea
                    className="w-full p-3 rounded-md border-2 border-black focus:outline-none focus:ring-1 focus:ring-black resize-none text-black bg-white"
                    placeholder="Bio"
                    value={bio}
                    rows={3}
                    onChange={(e) => setBio(e.target.value)}
                />

                {/* Gallery */}
                <div>
                    <label className="block font-medium text-black mb-1">Gallery</label>
                    <div className="flex gap-2 overflow-x-auto mb-2">
                        {galleryFiles.map((item, i) => (
                            <div key={i} className="relative">
                                <img src={item.preview} className="w-16 h-16 rounded-md object-cover border-2 border-black" />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(i)}
                                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <input type="file" accept="image/*" multiple className="text-black" onChange={(e) => handleGalleryChange(e.target.files)} />
                </div>

                {/* Buttons */}
                <Button label={loading ? "Saving..." : "Save"} fullWidth onClick={saveProfile} disabled={loading} className="bg-sage-300 text-black hover:bg-sage-300 hover:text-white border-2 border-black" />
                <Button label="Logout" fullWidth variant="secondary" onClick={logout} className="border-2 border-black text-black hover:bg-black hover:text-white" />
            </div>
        </div>
    );
};

export default Profile;
