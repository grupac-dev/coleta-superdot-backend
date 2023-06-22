import { assert, expect } from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createResearcher } from "../service/researcher.service";
import { DateTime } from "luxon";
import { any } from "zod";

describe("Researcher Service", function(){
    before(async () => {
        const mongoServer = await MongoMemoryServer.create();
    
        await mongoose.connect(mongoServer.getUri());
    });
    
    after(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("Create Researcher", function(){
        it("Should return a document definition with data", function(){
            const researcherData = {
                personal_data: {
                    full_name: "Lara Vieira",
                    phone: "9999999",
                    profile_photo: "photo.png",
                    birth_date: DateTime.fromISO("2023-06-21").toJSDate(),
                    country_state: "Bahia",
                },
                email: "test@hotmail.com",
                password_hash: "djasijd9j19dj2198udj9281jd",
                role: "Pesquisador",
                instituition: "IFBA",
            };
            const researcher = createResearcher(researcherData) 

            expect(researcher).equal({
                personal_data: {
                    full_name: "Lara Vieira",
                    phone: "9999999",
                    profile_photo: "photo.png",
                    birth_date: DateTime.fromISO("2023-06-21").toJSDate(),
                    country_state: "Bahia",
                },
                _id: expect(String),
                email: "test@hotmail.com",
                password_hash: "djasijd9j19dj2198udj9281jd",
                role: "Pesquisador",
                instituition: "IFBA",
                updatedAt: expect(Date),
                createdAt: expect(Date),
                __v: expect(any),
                ...expect(any),
            });
        })
    })

    describe("Update Researcher", function(){
        it("Should update and return the document", function(){
            return assert.fail(0, 1, 'Exception not thrown');
        })
    })

    describe("Delete Researcher", function(){
        it("Should delete the document and return {deletedCount: 1}", function(){
            return assert.fail(0, 1, 'Exception not thrown');
        })
    })

    describe("Find Researcher", function(){

        describe("Find by id", function(){
            it("When id exists should return a document", function(){
                return assert.fail(0, 1, 'Exception not thrown');
            })
    
        })
        describe("Find by email", function(){
            it("When email exists should return a document", function(){
                return assert.fail(0, 1, 'Exception not thrown');
            })
        })
       
    })
    
})

