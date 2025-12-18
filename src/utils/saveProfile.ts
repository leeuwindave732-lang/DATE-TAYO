import { supabase } from "../supabaseClient";
import { compressImage, compressImages } from "./compressImage";
import { uploadImage } from "./uploadImage";

interface GalleryFile {
    file: File | null;
    preview: string;
}

interface SaveProfileParams {
    userId: string;
    name: string;
    bio: string;
    avatarFile: File | null;
    galleryFiles: GalleryFile[];
}

export const saveProfile = async ({
    userId,
    name,
    bio,
    avatarFile,
    galleryFiles,
}: SaveProfileParams) => {
    try {
        let avatarUrl: string | null = null;

        // 1️⃣ Upload avatar if provided
        if (avatarFile) {
            const uploadedAvatar = await uploadImage(avatarFile, `${userId}/avatar`);
            avatarUrl = uploadedAvatar.url;
        }

        // 2️⃣ Upsert profile info
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            name,
            bio,
            avatar_url: avatarUrl,
        });
        if (profileError) throw profileError;

        // 3️⃣ Upload gallery images
        const uploads: { profile_id: string; image_url: string }[] = [];
        for (const item of galleryFiles) {
            if (item.file) {
                const uploaded = await uploadImage(
                    item.file,
                    `${userId}/gallery/${crypto.randomUUID()}`
                );
                uploads.push({ profile_id: userId, image_url: uploaded.url });
            }
        }

        if (uploads.length > 0) {
            const { error: galleryError } = await supabase.from("profile_images").insert(uploads);
            if (galleryError) throw galleryError;
        }

        return { success: true };
    } catch (err: any) {
        console.error("saveProfile failed:", err);
        return { success: false, error: err.message };
    }
};
