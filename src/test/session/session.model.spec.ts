import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import ResearcherModel from "../../model/researcher.model";
import chai, { expect, should } from "chai";
import chaiAsPromise from "chai-as-promised";
import SessionModel from "../../model/session.model";

chai.use(chaiAsPromise);
should();

describe("Session model", () => {
    before(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    after(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("Creating session model", () => {
        it("should be saved on db", async () => {
            const modelData = {
                personal_data: {
                    full_name: "Rafael Pereira",
                    phone: "9999999",
                    profile_photo: "photo.png",
                    birth_date: "2023-06-21",
                    country_state: "Bahia",
                },
                email: "test@hotmail.com",
                password_hash: "djasijd9j19dj2198udj9281jd",
                role: "Pesquisador",
                instituition: "IFBA",
            };

            const researcher = await ResearcherModel.create(modelData);

            const session = await SessionModel.create({
                researcher_id: researcher._id,
                userAgent: "Mozilla Firefox",
            });

            expect(session).to.not.be.null;
            expect(session)
                .to.have.property("researcher_id")
                .that.is.deep.equal(researcher._id);
        });
    });
});
