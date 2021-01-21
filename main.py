import cv2
import numpy as np
import random, time, sys, os
from PIL import Image

def save_image(path, image, make_directory=True):
    assert(image.dtype in [np.uint8, np.float32, np.float64])

    if image.dtype in [np.float32, np.float64]:
        image = np.clip(image*255, 0, 255).astype(np.uint8)

    if make_directory:
        directory, _ = os.path.split(path)
        os.makedirs(directory, exist_ok=True)

    image = Image.fromarray(image)
    image.save(path)

cam_id = 0

def main():
    cam = cv2.VideoCapture(cam_id)

    try:
        a = None
        b = None
        while True:
            ok, image = cam.read()

            if not ok:
                print("Failed to read frame from", cam)
                break


            image = image.astype(np.float32) / 255.0

            if a is None:
                a = image
                b = image
            else:
                a = np.minimum(a, image)
                b = np.maximum(b, image)
                alpha = 1.0 - (b - a).mean(axis=2)

                preview = np.concatenate([
                    image.mean(axis=2),
                    alpha,
                ], axis=1)

                scale = 2*576.0/preview.shape[1]

                preview = cv2.resize(preview, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

                cv2.imshow("preview", preview)

            key = cv2.waitKey(1)

            if key == ord('r'):
                print("reset")
                a = None

            if key == ord('s'):
                name = time.strftime("%Y-%m-%d-%H-%M-%S")
                path = f"alpha/{name}.png"
                save_image(path, alpha)
                print("saved image", path)

            if key == ord('q') or key == 27:
                print("quit")
                break

    finally:
        cam.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
