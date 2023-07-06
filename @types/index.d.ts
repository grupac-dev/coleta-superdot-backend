import express from "express";
import ISession from "../src/interface/session.interface";

declare global {
    namespace Express {
        interface Locals {
            session: ISession | null;
        }
    }
}
