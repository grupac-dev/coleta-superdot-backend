import { cleanEnv } from "envalid";
import { num, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    SALT_WORK_FACTOR: num(),
    ACCESS_TOKEN_PRIVATE_KEY: str(),
    ACCESS_TOKEN_PUBLIC_KEY: str(),
    REFRESH_TOKEN_PRIVATE_KEY: str(),
    REFRESH_TOKEN_PUBLIC_KEY: str(),
    ACCESS_TOKEN_TTL: str(),
    REFRESH_TOKEN_TTL: str(),
    MONGO_CONNECTION_STRING: str(),
    PORT: num(),
    DEFAULT_APP_ROLE: str(),
});
