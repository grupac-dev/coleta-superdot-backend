import bcrypt from "bcrypt";
import env from "./validateEnv";

export function hashPassword(rawPassword: string) {
    return bcrypt.hashSync(rawPassword, env.SALT_WORK_FACTOR);
}

export async function comparePassword(
    rawPassword: string,
    hashedPassword: string
) {
    return await bcrypt.compare(rawPassword, hashedPassword);
}
