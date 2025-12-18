import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "../utils/compressImage";
import { uploadImage } from "../utils/uploadImage";
import Input from "../components/input";
import Button from "../components/Button";

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [gallery, setGallery] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

    const navigate = useNavigate();

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
        };
        loadUser();
    }, [navigate]);

    const handleGalleryChange = async (files: FileList | null) => {
        if (!files) return;
        const compressedFiles = await compressImages(files);
        setGallery(compressedFiles);
        setGalleryPreviews(compressedFiles.map(f => URL.createObjectURL(f)));
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = [...gallery];
        const newPreviews = [...galleryPreviews];
        newGallery.splice(index, 1);
        newPreviews.splice(index, 1);
        setGallery(newGallery);
        setGalleryPreviews(newPreviews);
    };

    const saveProfile = async () => {
        if (!user) return;
        setLoading(true);
        setMessage(null);

        try {
            // Compress and upload avatar if exists
            let avatarUrl = avatarPreview;
            if (avatar) {
                const compressedAvatar = await compressImage(avatar);
                avatarUrl = await uploadImage(compressedAvatar, `${user.id}/avatar.jpg`);
            }

            // Upsert profile
            const { error: profileError } = await supabase.from("profiles").upsert({
                id: user.id,
                name,
                bio,
                avatar_url: avatarUrl,
            });
            if (profileError) throw profileError;

            // Upload gallery images
            for (const file of gallery) {
                const compressedFile = await compressImage(file);
                const imageUrl = await uploadImage(compressedFile, `${user.id}/gallery/${crypto.randomUUID()}.jpg`);
                const { error: imgError } = await supabase.from("profile_images").insert({
                    profile_id: user.id,
                    image_url: imageUrl,
                });
                if (imgError) console.error("Gallery insert error:", imgError);
            }

            setAvatarPreview(avatarUrl || null);
            setMessage({ text: "Profile saved!", type: "success" });

            // Redirect to ProfilePage after successful save
            navigate("/profile-page");

        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to save profile.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-white flex justify-center items-start py-12 font-main">
            <div className="w-full max-w-sm bg-[#9CAF88] rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-black text-center">Profile</h1>

                {message && (
                    <div
                        className={`text-center text-sm font-medium p-2 rounded ${
                            message.type === "error" ? "bg-red-100 text-red-700" : "bg-black text-white"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    {avatarPreview && (
                        <img
                            src={avatarPreview}
                            className="w-24 h-24 rounded-full object-cover border-2 border-black"
                        />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="text-black"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const compressed = await compressImage(file);
                                setAvatar(compressed);
                                setAvatarPreview(URL.createObjectURL(compressed));
                            }
                        }}
                    />
                </div>

                {/* Name */}
                <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-2 border-black rounded-md text-black bg-white"
                />

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
                        {galleryPreviews.map((src, i) => (
                            <div key={i} className="relative">
                                <img
                                    src={src}
                                    className="w-16 h-16 rounded-md object-cover border-2 border-black"
                                />
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
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="text-black"
                        onChange={(e) => handleGalleryChange(e.target.files)}
                    />
                </div>

                {/* Buttons */}
                <Button
                    label={loading ? "Saving..." : "Save"}
                    fullWidth
                    onClick={saveProfile}
                    disabled={loading}
                    className="bg-sage-300 text-black hover:bg-sage-300 hover:text-white border-2 border-black"
                />
                <Button
                    label="Logout"
                    fullWidth
                    variant="secondary"
                    onClick={logout}
                    className="border-2 border-black text-black hover:bg-black hover:text-white"
                />
            </div>
        </div>
    );
};

export default Profile;
