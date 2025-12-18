// Profile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "../utils/compressImage";
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

    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }
            setUser(user);

            // Fetch profile
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            if (profile) {
                setName(profile.name || "");
                setBio(profile.bio || "");
                setAvatarPreview(profile.avatar_url || null);
            }
        };
        checkUser();
    }, [navigate]);

    const uploadImage = async (file: File, path: string) => {
        const compressedFile = await compressImage(file); // compress before upload
        const { error } = await supabase.storage.from("profiles").upload(path, compressedFile, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("profiles").getPublicUrl(path);
        return data.publicUrl;
    };

    const handleGalleryChange = async (files: FileList | null) => {
        if (!files) return;
        const compressedFiles = await compressImages(files);
        setGallery(compressedFiles);
        setGalleryPreviews(compressedFiles.map(f => URL.createObjectURL(f)));
    };

    const saveProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let avatarUrl = avatarPreview;
            if (avatar) avatarUrl = await uploadImage(avatar, `${user.id}/avatar.jpg`);

            await supabase.from("profiles").upsert({
                id: user.id,
                name,
                bio,
                avatar_url: avatarUrl,
            });

            for (const file of gallery) {
                const imageUrl = await uploadImage(file, `${user.id}/gallery/${crypto.randomUUID()}.jpg`);
                await supabase.from("profile_images").insert({ profile_id: user.id, image_url: imageUrl });
            }

            setAvatarPreview(avatarUrl || null);
            alert("Profile saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save profile. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans flex justify-center">
            <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-center">Your Profile</h1>

                <Input type="email" value={user.email} disabled className="bg-gray-100" onChange={function (e: React.ChangeEvent<HTMLInputElement>): void {
                    throw new Error("Function not implemented.");
                }} />
                <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <textarea
                    className="w-full p-2 rounded border mb-2"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <label className="font-semibold">Avatar</label>
                {avatarPreview && <img src={avatarPreview} className="w-24 h-24 rounded-full object-cover mb-2" />}
                <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                            const compressed = await compressImage(file);
                            setAvatar(compressed);
                            setAvatarPreview(URL.createObjectURL(compressed));
                        }
                    }}
                />

                <label className="font-semibold mt-2">Gallery</label>
                <div className="flex gap-2 overflow-x-auto mb-2">
                    {galleryPreviews.map((src, i) => (
                        <img key={i} src={src} className="w-24 h-24 object-cover rounded" />
                    ))}
                </div>
                <input type="file" accept="image/*" multiple onChange={(e) => handleGalleryChange(e.target.files)} />

                <Button label={loading ? "Saving..." : "Save Profile"} fullWidth onClick={saveProfile} disabled={loading} />
            </div>
        </div>
    );
};

export default Profile;
