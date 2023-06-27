import { Request, Response } from "express";
import * as path from "path";
import multer from "multer";

const uploadFilePath = path.resolve(__dirname, "../", "storage/uploads");

const storage = multer.diskStorage({
    destination: uploadFilePath,
    filename: function (req, file, cb) {
        const uniquePreffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            uniquePreffix + file.fieldname + path.extname(file.originalname)
        );
    },
});

const uploaderConfig = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(req, file, callback) {
        const extension: boolean =
            [".png", ".jpg", "jpeg", "pdf"].indexOf(
                path.extname(file.originalname).toLowerCase()
            ) >= 0;
        const mimeType: boolean =
            ["image/png", "image/png", "image/png", "application/pdf"].indexOf(
                path.extname(file.mimetype)
            ) >= 0;

        if (extension && mimeType) {
            return callback(null, true);
        }
        callback(new Error("Invalid file type."));
    },
});

const singleUploader = uploaderConfig.single("profile_photo");

export const singleUploadFile = async (
    req: Request,
    res: Response
): Promise<any> => {
    return new Promise((resolve, reject): void => {
        singleUploader(req, res, (error) => {
            if (error) {
                reject(error);
            }

            resolve({ file: req.file, body: req.body });
        });
    });
};
