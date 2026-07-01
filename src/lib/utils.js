export async function downloadImage(url, filename = "ai-headshot-portrait.jpg") {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(url, "_blank");
  }
}

export const headshotsExamples = Array.from({ length: 24 }).map((_, i) => ({
  name: `Example ${i + 1}`,
  url: `https://placehold.co/300x400/1e293b/ffffff?text=AI+Headshot+${i + 1}`,
}));
