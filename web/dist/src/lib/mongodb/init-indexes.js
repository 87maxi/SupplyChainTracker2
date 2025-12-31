"use strict";
// web/src/lib/mongodb/init-indexes.ts
// Script to initialize MongoDB indexes using native driver
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
exports.initializeMongoDBIndexes = initializeMongoDBIndexes;
const native_client_1 = require("./native-client");
/**
 * Initialize MongoDB indexes for optimal query performance
 */
function initializeMongoDBIndexes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔄 Initializing MongoDB indexes...');
            yield (0, native_client_1.initializeIndexes)();
            console.log('🎉 MongoDB indexes initialized successfully');
        }
        catch (error) {
            console.error('❌ Error initializing MongoDB indexes:', error);
            throw error;
        }
    });
}
// Run initialization if this script is executed directly
if (require.main === module) {
    initializeMongoDBIndexes()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('Failed to initialize indexes:', error);
        process.exit(1);
    });
}
