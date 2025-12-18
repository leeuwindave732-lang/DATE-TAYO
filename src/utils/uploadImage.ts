import { supabase } from "../supabaseClient";
import { compressImage } from "./compressImage";

export const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
        const compressed = await compressImage(file);

        // Ensure path ends with .jpg
        const fileName = path.endsWith(".jpg") ? path : path + ".jpg";

        // Upload to Supabase Storage
        const { error } = await supabase.storage.from("profiles").upload(fileName, compressed, { upsert: true });
        if (error) {
            console.error("Supabase upload error:", error);
            throw error;
        }

        // Get public URL
        const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);
        if (!data?.publicUrl) throw new Error("Failed to get public URL");

        return data.publicUrl;
    } catch (err: any) {
        console.error("Upload failed:", err);
        throw new Error("Failed to upload image. Check your bucket permissions or file size.");
    }
};
