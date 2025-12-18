export const compressImage = (file: File, quality = 0.7, maxWidth = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas context not found"));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Compression failed"));
                    // Keep original extension
                    const ext = file.name.split(".").pop() || "jpg";
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "." + ext, {
                        type: blob.type,
                    });
                    resolve(compressedFile);
                },
                "image/jpeg",
                quality
            );
        };

        img.onerror = (err) => reject(err);
    });
};

export const compressImages = async (files: FileList | File[]): Promise<File[]> => {
    const compressed: File[] = [];
    for (const file of Array.from(files)) {
        try {
            const c = await compressImage(file);
            compressed.push(c);
        } catch (err) {
            console.error("Failed to compress image:", file.name, err);
        }
    }
    return compressed;
};
