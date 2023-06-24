import { cleanEnv } from "envalid";
import { num, port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
    SALT_WORK_FACTOR: num(),
});
