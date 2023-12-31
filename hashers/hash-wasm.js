/*!
 * hash-wasm (https://www.npmjs.com/package/hash-wasm)
 * (c) Dani Biro
 * @license MIT
 */

! function (A, I) {
    "object" == typeof exports && "undefined" != typeof module ? I(exports) : "function" == typeof define && define.amd ? define(["exports"], I) : I((A = "undefined" != typeof globalThis ? globalThis : A || self).hashwasm = A.hashwasm || {})
}(this, (function (A) {
    "use strict";

    function I(A, I, B, g) {
        return new(B || (B = Promise))((function (i, e) {
            function n(A) {
                try {
                    c(g.next(A))
                } catch (A) {
                    e(A)
                }
            }

            function Q(A) {
                try {
                    c(g.throw(A))
                } catch (A) {
                    e(A)
                }
            }

            function c(A) {
                var I;
                A.done ? i(A.value) : (I = A.value, I instanceof B ? I : new B((function (A) {
                    A(I)
                }))).then(n, Q)
            }
            c((g = g.apply(A, I || [])).next())
        }))
    }
    class B {
        constructor() {
            this.mutex = Promise.resolve()
        }
        lock() {
            let A = () => {};
            return this.mutex = this.mutex.then((() => new Promise(A))), new Promise((I => {
                A = I
            }))
        }
        dispatch(A) {
            return I(this, void 0, void 0, (function* () {
                const I = yield this.lock();
                try {
                    return yield Promise.resolve(A())
                } finally {
                    I()
                }
            }))
        }
    }
    var g;
    const i = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : "undefined" != typeof window ? window : global,
        e = null !== (g = i.Buffer) && void 0 !== g ? g : null,
        n = i.TextEncoder ? new i.TextEncoder : null;

    function Q(A, I) {
        return (15 & A) + (A >> 6 | A >> 3 & 8) << 4 | (15 & I) + (I >> 6 | I >> 3 & 8)
    }
    const c = "a".charCodeAt(0) - 10,
        t = "0".charCodeAt(0);

    function o(A, I, B) {
        let g = 0;
        for (let i = 0; i < B; i++) {
            let B = I[i] >>> 4;
            A[g++] = B > 9 ? B + c : B + t, B = 15 & I[i], A[g++] = B > 9 ? B + c : B + t
        }
        return String.fromCharCode.apply(null, A)
    }
    const a = null !== e ? A => {
            if ("string" == typeof A) {
                const I = e.from(A, "utf8");
                return new Uint8Array(I.buffer, I.byteOffset, I.length)
            }
            if (e.isBuffer(A)) return new Uint8Array(A.buffer, A.byteOffset, A.length);
            if (ArrayBuffer.isView(A)) return new Uint8Array(A.buffer, A.byteOffset, A.byteLength);
            throw new Error("Invalid data type!")
        } : A => {
            if ("string" == typeof A) return n.encode(A);
            if (ArrayBuffer.isView(A)) return new Uint8Array(A.buffer, A.byteOffset, A.byteLength);
            throw new Error("Invalid data type!")
        },
        E = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        d = new Uint8Array(256);
    for (let A = 0; A < E.length; A++) d[E.charCodeAt(A)] = A;

    function r(A) {
        const I = function (A) {
                let I = Math.floor(.75 * A.length);
                const B = A.length;
                return "=" === A[B - 1] && (I -= 1, "=" === A[B - 2] && (I -= 1)), I
            }(A),
            B = A.length,
            g = new Uint8Array(I);
        let i = 0;
        for (let I = 0; I < B; I += 4) {
            const B = d[A.charCodeAt(I)],
                e = d[A.charCodeAt(I + 1)],
                n = d[A.charCodeAt(I + 2)],
                Q = d[A.charCodeAt(I + 3)];
            g[i] = B << 2 | e >> 4, i += 1, g[i] = (15 & e) << 4 | n >> 2, i += 1, g[i] = (3 & n) << 6 | 63 & Q, i += 1
        }
        return g
    }
    const y = 16384,
        h = new B,
        s = new Map;

    function C(A, B) {
        return I(this, void 0, void 0, (function* () {
            let g = null,
                i = null,
                e = !1;
            if ("undefined" == typeof WebAssembly) throw new Error("WebAssembly is not supported in this environment!");
            const n = () => new DataView(g.exports.memory.buffer).getUint32(g.exports.STATE_SIZE, !0),
                c = h.dispatch((() => I(this, void 0, void 0, (function* () {
                    if (!s.has(A.name)) {
                        const I = r(A.data),
                            B = WebAssembly.compile(I);
                        s.set(A.name, B)
                    }
                    const I = yield s.get(A.name);
                    g = yield WebAssembly.instantiate(I, {})
                })))),
                t = (A = null) => {
                    e = !0, g.exports.Hash_Init(A)
                },
                E = A => {
                    if (!e) throw new Error("update() called before init()");
                    (A => {
                        let I = 0;
                        for (; I < A.length;) {
                            const B = A.subarray(I, I + y);
                            I += B.length, i.set(B), g.exports.Hash_Update(B.length)
                        }
                    })(a(A))
                },
                d = new Uint8Array(2 * B),
                C = (A, I = null) => {
                    if (!e) throw new Error("digest() called before init()");
                    return e = !1, g.exports.Hash_Final(I), "binary" === A ? i.slice(0, B) : o(d, i, B)
                },
                D = A => "string" == typeof A ? A.length < 4096 : A.byteLength < y;
            let F = D;
            switch (A.name) {
            case "argon2":
            case "scrypt":
                F = () => !0;
                break;
            case "blake2b":
            case "blake2s":
                F = (A, I) => I <= 512 && D(A);
                break;
            case "blake3":
                F = (A, I) => 0 === I && D(A);
                break;
            case "xxhash64":
            case "xxhash3":
            case "xxhash128":
                F = () => !1
            }
            return yield(() => I(this, void 0, void 0, (function* () {
                g || (yield c);
                const A = g.exports.Hash_GetBuffer(),
                    I = g.exports.memory.buffer;
                i = new Uint8Array(I, A, y)
            })))(), {
                getMemory: () => i,
                writeMemory: (A, I = 0) => {
                    i.set(A, I)
                },
                getExports: () => g.exports,
                setMemorySize: A => {
                    g.exports.Hash_SetMemorySize(A);
                    const I = g.exports.Hash_GetBuffer(),
                        B = g.exports.memory.buffer;
                    i = new Uint8Array(B, I, A)
                },
                init: t,
                update: E,
                digest: C,
                save: () => {
                    if (!e) throw new Error("save() can only be called after init() and before digest()");
                    const I = g.exports.Hash_GetState(),
                        B = n(),
                        i = g.exports.memory.buffer,
                        c = new Uint8Array(i, I, B),
                        t = new Uint8Array(4 + B);
                    return function (A, I) {
                        const B = I.length >> 1;
                        for (let g = 0; g < B; g++) {
                            const B = g << 1;
                            A[g] = Q(I.charCodeAt(B), I.charCodeAt(B + 1))
                        }
                    }(t, A.hash), t.set(c, 4), t
                },
                load: I => {
                    if (!(I instanceof Uint8Array)) throw new Error("load() expects an Uint8Array generated by save()");
                    const B = g.exports.Hash_GetState(),
                        i = n(),
                        c = 4 + i,
                        t = g.exports.memory.buffer;
                    if (I.length !== c) throw new Error(`Bad state length (expected ${c} bytes, got ${I.length})`);
                    if (! function (A, I) {
                            if (A.length !== 2 * I.length) return !1;
                            for (let B = 0; B < I.length; B++) {
                                const g = B << 1;
                                if (I[B] !== Q(A.charCodeAt(g), A.charCodeAt(g + 1))) return !1
                            }
                            return !0
                        }(A.hash, I.subarray(0, 4))) throw new Error("This state was written by an incompatible hash implementation");
                    const o = I.subarray(4);
                    new Uint8Array(t, B, i).set(o), e = !0
                },
                calculate: (A, I = null, e = null) => {
                    if (!F(A, I)) return t(I), E(A), C("hex", e);
                    const n = a(A);
                    return i.set(n), g.exports.Hash_Calculate(n.length, I, e), o(d, i, B)
                },
                hashLength: B
            }
        }))
    }
    var D = {
        name: "sha1",
        data: "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",
        hash: "40d92e5d"
    };
    const F = new B;
    let f = null;
    A.createSHA1 = function () {
        return C(D, 20).then((A => {
            A.init();
            const I = {
                init: () => (A.init(), I),
                update: B => (A.update(B), I),
                digest: I => A.digest(I),
                save: () => A.save(),
                load: B => (A.load(B), I),
                blockSize: 64,
                digestSize: 20
            };
            return I
        }))
    }, A.sha1 = function (A) {
        if (null === f) return function (A, B, g) {
            return I(this, void 0, void 0, (function* () {
                const I = yield A.lock(), i = yield C(B, g);
                return I(), i
            }))
        }(F, D, 20).then((I => (f = I, f.calculate(A))));
        try {
            const I = f.calculate(A);
            return Promise.resolve(I)
        } catch (A) {
            return Promise.reject(A)
        }
    }, Object.defineProperty(A, "__esModule", {
        value: !0
    })
}));