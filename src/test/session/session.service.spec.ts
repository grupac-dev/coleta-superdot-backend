import { expect } from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Types } from "mongoose";
import { createResearcher } from "../../service/researcher.service";
import { DateTime } from "luxon";
import { createSession, issueAccessToken } from "../../service/session.service";
import IResearcher from "../../interface/researcher.interface";
import { verifyJwt } from "../../util/jwt";

describe("Session Service", function () {
    before(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    let researcher: IResearcher;
    beforeEach(async function () {
        await mongoose.connection.dropCollection("researchers");
        researcher = await createResearcher({
            personal_data: {
                full_name: "Felipe Pereira",
                phone: "9999999",
                profile_photo: "photo.png",
                birth_date: DateTime.fromISO("2023-06-21").toJSDate(),
                country_state: "Bahia",
            },
            email: "test@hotmail.com",
            password_hash: "djasijd9j19dj2198udj9281jd",
            role: "Pesquisador",
            instituition: "IFBA",
        });
    });

    describe("create session", function () {
        it("should save and return the document", async () => {
            const session = await createSession(
                new Types.ObjectId(researcher._id),
                "Mozilla Firefox"
            );

            expect(session).to.not.be.null;
            expect(session)
                .to.have.property("researcher_id")
                .that.deep.equal(researcher._id);
            expect(session)
                .to.have.property("userAgent")
                .that.equal("Mozilla Firefox");
        });
    });

    describe("create jwt token", function () {
        it("should return valid encoded data", async () => {
            const session = await createSession(
                new Types.ObjectId(researcher._id),
                "Mozilla Firefox"
            );

            const signedToken = issueAccessToken(session);

            const verification = verifyJwt(
                signedToken,
                "ACCESS_TOKEN_PUBLIC_KEY"
            );

            expect(verification.valid).to.be.true;
            expect(verification.expired).to.be.false;
            expect(verification.decoded)
                .to.have.property("researcher_id")
                .that.deep.equal(researcher._id?.toString());
            expect(verification.decoded)
                .to.have.property("session_id")
                .that.deep.equal(session._id?.toString());
        });
    });
});
