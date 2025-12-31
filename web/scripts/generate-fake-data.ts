// web/scripts/generate-fake-data.ts
// Script to generate fake data for MongoDB testing

import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';
import { ContractRoles } from '@/types/contract';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'supplychain-tracker';

const ROLES: ContractRoles[] = [
  'FABRICANTE_ROLE',
  'AUDITOR_HW_ROLE', 
  'TECNICO_SW_ROLE',
  'ESCUELA_ROLE'
];

const SERIAL_NUMBERS = Array.from({ length: 100 }, () => 
  `NB-${faker.string.alphanumeric(8).toUpperCase()}`
);

const USER_ADDRESSES = Array.from({ length: 50 }, () => 
  `0x${faker.string.hexadecimal({ length: 40 }).toLowerCase()}`
);

function generateRoleData() {
  return {
    transactionHash: `0x${faker.string.hexadecimal({ length: 64 })}`,
    role: faker.helpers.arrayElement(ROLES),
    userAddress: faker.helpers.arrayElement(USER_ADDRESSES),
    data: {
      action: faker.helpers.arrayElement(['create', 'update', 'verify', 'distribute']),
      metadata: faker.lorem.sentence(),
      timestamp: faker.date.recent({ days: 30 }).getTime()
    },
    timestamp: faker.date.recent({ days: 30 }),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

function generateNetbookData() {
  const serialNumber = faker.helpers.arrayElement(SERIAL_NUMBERS);
  return {
    serialNumber,
    transactionHash: `0x${faker.string.hexadecimal({ length: 64 })}`,
    role: faker.helpers.arrayElement(ROLES),
    userAddress: faker.helpers.arrayElement(USER_ADDRESSES),
    data: {
      model: faker.helpers.arrayElement(['EduBook Pro', 'LearnPad Ultra', 'StudentTab Plus']),
      specs: {
        cpu: faker.helpers.arrayElement(['Intel i3', 'Intel i5', 'AMD Ryzen 3', 'AMD Ryzen 5']),
        ram: faker.helpers.arrayElement(['4GB', '8GB', '16GB']),
        storage: faker.helpers.arrayElement(['128GB SSD', '256GB SSD', '512GB SSD']),
        screen: faker.helpers.arrayElement(['11.6"', '13.3"', '14"', '15.6"'])
      },
      status: faker.helpers.arrayElement(['new', 'inspected', 'configured', 'distributed']),
      notes: faker.lorem.sentence()
    },
    timestamp: faker.date.recent({ days: 30 }),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function generateFakeData() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
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
      await roleDataCollection.insertMany(roleData, { ordered: false });
      console.log('Inserted role data');
    }

    if (netbookData.length > 0) {
      await netbookDataCollection.insertMany(netbookData, { ordered: false });
      console.log('Inserted netbook data');
    }

    console.log('Fake data generation completed!');
    console.log(`- Role data: ${roleData.length} entries`);
    console.log(`- Netbook data: ${netbookData.length} entries`);

    await client.close();
  } catch (error) {
    console.error('Error generating fake data:', error);
    process.exit(1);
  }
}

// Run if called directly (ES module equivalent)
if (process.argv[1] && process.argv[1] === import.meta.url.split('file://')[1]) {
  generateFakeData();
}

export { generateFakeData };