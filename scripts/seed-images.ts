const IMAGE_API_URL = "http://localhost:3000";

async function seedImages() {
  console.log("Seeding 10 posts with images...");

  // 1x1 Transparent PNG
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );

  for (let i = 1; i <= 10; i++) {
    try {
      // 1. Upload Image
      const formData = new FormData();
      // In Node, FormData might need a Blob which is available in Node 18+
      const blob = new Blob([pngBuffer], { type: "image/png" });
      formData.append("file", blob, `image-${i}.png`);

      const uploadRes = await fetch(`${IMAGE_API_URL}/api/images`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        console.error(`Failed to upload image ${i}: ${uploadRes.status}`);
        continue;
      }

      const { url } = await uploadRes.json();
      console.log(`Uploaded image ${i}: ${url}`);

      // 2. Create Post
      const content = `# Image Post ${i}

![Image ${i}](${url})

This post contains an uploaded image.
`;

      const postRes = await fetch(`${IMAGE_API_URL}/api/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (postRes.ok) {
        const data = await postRes.json();
        console.log(`Created image post ${i}: ${data.id}`);
      } else {
        console.error(`Failed to create post ${i}: ${postRes.status}`);
      }
    } catch (e) {
      console.error("Error:", e);
    }
  }
}

seedImages();
