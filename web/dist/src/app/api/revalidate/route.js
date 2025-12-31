"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const cache_1 = require("next/cache");
function GET(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = request.nextUrl.searchParams.get('tag');
        if (!tag) {
            return Response.json({ error: 'Tag parameter is required' }, { status: 400 });
        }
        (0, cache_1.revalidateTag)(tag, 'max');
        return Response.json({ revalidated: true, tag }, { status: 200 });
    });
}
