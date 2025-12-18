import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "../utils/compressImage";
import { uploadImage } from "../utils/uploadImage";
import Button from "../components/Button";
import Input from "../components/input";

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
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return navigate("/auth");
            setUser(user);

            // Load profile
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (profile) {
                setName(profile.name || "");
                setBio(profile.bio || "");
                setAvatarUrl(profile.avatar_url || null);
            }

            // Load gallery
            const { data: images } = await supabase.from("profile_images").select("*").eq("profile_id", user.id);
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
            const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
            if (error) throw error;
            setAvatarUrl(url);
            setMessage({ text: "Avatar updated!", type: "success" });
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to update avatar.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleGalleryUpload = async (files: FileList | null) => {
        if (!files || !user) return;
        setLoading(true);
        try {
            const compressedFiles = await compressImages(files);
            const newImages: ProfileImage[] = [];

            for (const file of compressedFiles) {
                const url = await uploadImage(file, `${user.id}/gallery/${crypto.randomUUID()}.jpg`);
                const { data, error } = await supabase.from("profile_images").insert({ profile_id: user.id, image_url: url }).select().single();
                if (error) throw error;
                newImages.push(data);
            }

            setGallery((prev) => [...prev, ...newImages]);
            setMessage({ text: "Gallery updated!", type: "success" });
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to upload images.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const removeGalleryImage = async (id: string) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase.from("profile_images").delete().eq("id", id);
            if (error) throw error;
            setGallery((prev) => prev.filter((img) => img.id !== id));
            setMessage({ text: "Image removed!", type: "success" });
        } catch (err) {
            console.error(err);
            setMessage({ text: "Failed to remove image.", type: "error" });
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
        <div className="min-h-screen bg-white flex justify-center py-12 font-main">
            <div className="w-full max-w-md flex flex-col gap-4">
                <h1 className="text-2xl font-semibold text-center">My Profile</h1>

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
                    {avatarUrl && (
                        <img
                            src={avatarUrl}
                            className="w-28 h-28 rounded-full object-cover border-2 border-black"
                        />
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>

                {/* Name & Bio */}
                <div className="flex flex-col gap-2">
                    <Input type="text" value={name} disabled className="border-2 border-black rounded-md text-black bg-white" onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                        throw new Error("Function not implemented.");
                    } } />
                    <textarea value={bio} rows={3} disabled className="w-full p-3 rounded-md border-2 border-black resize-none text-black bg-white" />
                </div>

                {/* Gallery */}
                <div>
                    <label className="block font-medium text-black mb-1">Gallery</label>
                    <div className="flex gap-2 overflow-x-auto mb-2">
                        {gallery.map((img) => (
                            <div key={img.id} className="relative">
                                <img
                                    src={img.image_url}
                                    className="w-24 h-24 rounded-md object-cover border-2 border-black"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(img.id)}
                                    className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryUpload(e.target.files)} />
                </div>

                {/* Logout */}
                <Button label="Logout" fullWidth onClick={logout} className="border-2 border-black text-black hover:bg-black hover:text-white" />
            </div>
        </div>
    );
};

export default ProfilePage;
