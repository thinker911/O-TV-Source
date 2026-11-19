import test from "node:test";
import assert from "node:assert/strict";
import { encodeBase58 } from "../src/index.js";

test("encodes empty bytes", () => {
  assert.equal(encodeBase58(new Uint8Array()), "");
});

test("encodes leading zero bytes as leading ones", () => {
  assert.equal(encodeBase58(new Uint8Array([0, 0, 1])), "112");
});

test("encodes a known byte sequence", () => {
  assert.equal(encodeBase58(new TextEncoder().encode("Hello World")), "JxF12TrwUP45BMd");
});
