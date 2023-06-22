import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

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
            return false;
        })
    })

    describe("Update Researcher", function(){
        it("Should update and return the document", function(){
            return false;
        })
    })

    describe("Delete Researcher", function(){
        it("Should delete the document and return {deletedCount: 1}", function(){
            return false;
        })
    })

    describe("Find Researcher", function(){

        describe("Find by id", function(){
            it("When id exists should return a document", function(){
                return false;
            })
    
        })
        describe("Find by email", function(){
            it("When email exists should return a document", function(){
                return false;
            })
        })
       
    })
    
})

