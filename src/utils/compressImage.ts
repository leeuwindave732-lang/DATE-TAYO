export const compressImage = (file: File, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;

            const MAX_WIDTH = 800;
            const scale = MAX_WIDTH / img.width;

            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => resolve(blob!),
                "image/jpeg",
                quality
            );
        };
    });
};
