import cv2
import numpy as np
import random, time, sys, os
from PIL import Image

cam_id = 0

def main():
    cam = cv2.VideoCapture(cam_id)

    try:
        i_frame = 0
        a = None
        b = None
        s = None
        n_images = 0
        record = False
        while True:
            ok, image = cam.read()

            if not ok:
                print("Failed to read frame from", cam)
                break


            image = image.astype(np.float32) / 255.0

            if a is None:
                a = image
                b = image
                s = image
                n_images = 1
            else:
                a = np.minimum(a, image)
                b = np.maximum(b, image)
                s += image
                n_images += 1
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

            if key == ord('q') or key == 27:
                print("quit")
                break

    finally:
        cam.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
