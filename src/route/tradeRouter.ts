import express from "express";
import { tradeAdapter } from "../conlrollers/tradeAdapter";

const router = express.Router();

router.post("/sync", tradeAdapter);

export default router;


