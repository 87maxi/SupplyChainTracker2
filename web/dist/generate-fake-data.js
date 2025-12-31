"use strict";
// web/scripts/generate-fake-data.ts
// Script to generate fake data for MongoDB testing
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
exports.generateFakeData = generateFakeData;
const mongodb_1 = require("mongodb");
const faker_1 = require("@faker-js/faker");
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'supplychain-tracker';
const ROLES = [
    'FABRICANTE_ROLE',
    'AUDITOR_HW_ROLE',
    'TECNICO_SW_ROLE',
    'ESCUELA_ROLE'
];
const SERIAL_NUMBERS = Array.from({ length: 100 }, () => `NB-${faker_1.faker.string.alphanumeric(8).toUpperCase()}`);
const USER_ADDRESSES = Array.from({ length: 50 }, () => `0x${faker_1.faker.string.hexadecimal({ length: 40 }).toLowerCase()}`);
function generateRoleData() {
    return {
        transactionHash: `0x${faker_1.faker.string.hexadecimal({ length: 64 })}`,
        role: faker_1.faker.helpers.arrayElement(ROLES),
        userAddress: faker_1.faker.helpers.arrayElement(USER_ADDRESSES),
        data: {
            action: faker_1.faker.helpers.arrayElement(['create', 'update', 'verify', 'distribute']),
            metadata: faker_1.faker.lorem.sentence(),
            timestamp: faker_1.faker.date.recent({ days: 30 }).getTime()
        },
        timestamp: faker_1.faker.date.recent({ days: 30 }),
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
function generateNetbookData() {
    const serialNumber = faker_1.faker.helpers.arrayElement(SERIAL_NUMBERS);
    return {
        serialNumber,
        transactionHash: `0x${faker_1.faker.string.hexadecimal({ length: 64 })}`,
        role: faker_1.faker.helpers.arrayElement(ROLES),
        userAddress: faker_1.faker.helpers.arrayElement(USER_ADDRESSES),
        data: {
            model: faker_1.faker.helpers.arrayElement(['EduBook Pro', 'LearnPad Ultra', 'StudentTab Plus']),
            specs: {
                cpu: faker_1.faker.helpers.arrayElement(['Intel i3', 'Intel i5', 'AMD Ryzen 3', 'AMD Ryzen 5']),
                ram: faker_1.faker.helpers.arrayElement(['4GB', '8GB', '16GB']),
                storage: faker_1.faker.helpers.arrayElement(['128GB SSD', '256GB SSD', '512GB SSD']),
                screen: faker_1.faker.helpers.arrayElement(['11.6"', '13.3"', '14"', '15.6"'])
            },
            status: faker_1.faker.helpers.arrayElement(['new', 'inspected', 'configured', 'distributed']),
            notes: faker_1.faker.lorem.sentence()
        },
        timestamp: faker_1.faker.date.recent({ days: 30 }),
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
function generateFakeData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new mongodb_1.MongoClient(MONGODB_URI);
            yield client.connect();
            const db = client.db(MONGODB_DB);
            const roleDataCollection = db.collection('role_data');
            const netbookDataCollection = db.collection('netbook_data');
            console.log('Generating fake data...');
            // Generate 3000 role data entries
            const roleData = Array.from({ length: 3000 }, generateRoleData);
            console.log('Generated 3000 role data entries');
            // Generate 3000 netbook data entries
            const netbookData = Array.from({ length: 3000 }, generateNetbookData);
            console.log('Generated 3000 netbook data entries');
            // Insert data
            if (roleData.length > 0) {
                yield roleDataCollection.insertMany(roleData);
                console.log('Inserted role data');
            }
            if (netbookData.length > 0) {
                yield netbookDataCollection.insertMany(netbookData);
                console.log('Inserted netbook data');
            }
            console.log('Fake data generation completed!');
            console.log(`- Role data: ${roleData.length} entries`);
            console.log(`- Netbook data: ${netbookData.length} entries`);
            yield client.close();
        }
        catch (error) {
            console.error('Error generating fake data:', error);
            process.exit(1);
        }
    });
}
// Run if called directly (ES module equivalent)
if (process.argv[1] && process.argv[1] === import.meta.url.split('file://')[1]) {
    generateFakeData();
}
