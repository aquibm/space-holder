import Jimp from 'jimp'

export const resize = async (imagePath: string, width: number, height: number): Promise<Buffer> => {
    try {
        const instance = await Jimp.read(imagePath)
        return instance.cover(width, height).quality(60).getBufferAsync(Jimp.MIME_JPEG)
    } catch(error) {
        console.log(error)
        throw error
    }
}
