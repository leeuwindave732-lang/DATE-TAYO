import { supabase } from "../supabaseClient";
import { compressImage } from "./compressImage";

interface UploadResult {
    url: string;
    path: string;
    bucket: string;
}

export const uploadImage = async (file: File, path: string): Promise<UploadResult> => {
    try {
        const compressed = await compressImage(file);

        const extension = file.name.split(".").pop() || "jpg";
        const fileName = path.endsWith(`.${extension}`) ? path : `${path}.${extension}`;
        const bucket = "UploadImages";

        const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, compressed, { upsert: true });
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        if (!data?.publicUrl) throw new Error("Failed to get public URL");

        return { url: data.publicUrl, path: fileName, bucket };
    } catch (err: any) {
        console.error("Upload failed:", err);
        throw new Error(`Image upload failed: ${err.message}`);
    }
};
