import { Request, ResponseToolkit } from "@hapi/hapi";

import { Cache } from '../lib/cache'
import { resize, mimeType } from '../lib/resizer'

export default (sourceFiles: string[], cache: Cache) => {
  const getRandomSourceFile = (): string =>
    sourceFiles[Math.floor(Math.random() * sourceFiles.length)];

  const getImageName = (imagePath: string): string => {
    const parts = imagePath.split("\\");
    return parts[parts.length - 1];
  };

  const handler = async (request: Request, h: ResponseToolkit) => {
    const imagePath = getRandomSourceFile();
    const imageName = getImageName(imagePath);

    const width = Number(request.params.width) || 480;
    const height = Number(request.params.height) || width;

    try {
      const imageBuffer = await cache.get(imageName, width, height);
      return h.response(imageBuffer).type(mimeType);
    } catch (error) {
      if (error.name === "CacheError") {
        const imageBuffer = await resize(imagePath, width, height);
        cache.add(imageName, width, height, imageBuffer);
        return h.response(imageBuffer).type(mimeType);
      }
    }
  };

  return {
    method: "GET",
    path: "/{width}/{height}",
    handler,
  };
};
